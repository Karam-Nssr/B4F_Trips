import mongoose from "mongoose";
import Trip from "../models/Trip.model.js";
import Bus from "../models/Bus.model.js";
import Reservation from "../models/Reservation.model.js";
import { checkBusOverlap } from "./trip.service.js";

const GENERATION_WINDOW_DAYS = 30;

const getDamascusToday = () => {
  const now = new Date();
  const damascusStr = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Damascus",
  });
  return new Date(damascusStr + "T00:00:00.000Z");
};

const createSchedule = async ({
  from,
  to,
  bus,
  departureTime,
  price,
  frequency,
  startDate,
  endDate,
  daysOfWeek,
  dayOfMonth,
}) => {
  const busDoc = await Bus.findById(bus);
  if (!busDoc || !busDoc.isActive) {
    const error = new Error("Bus not found or inactive.");
    error.statusCode = 400;
    throw error;
  }

  const recurrenceGroupId = new mongoose.Types.ObjectId();

  const scheduleTemplate = await Trip.create({
    from,
    to,
    bus,
    departureDate: new Date(startDate),
    departureTime,
    price,
    status: "SCHEDULED",
    schedule: {
      isRecurring: true,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      daysOfWeek: daysOfWeek || [],
      dayOfMonth: dayOfMonth || null,
    },
    recurrenceGroupId,
  });

  const generated = await generateTripsForSchedule(scheduleTemplate);
  return { schedule: scheduleTemplate, generatedCount: generated };
};

const getAllSchedules = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const query = { "schedule.isRecurring": true };

  const total = await Trip.countDocuments(query);
  const schedules = await Trip.find(query)
    .populate("bus", "busNumber busClass size")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return {
    schedules,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      perPage: Number(limit),
    },
  };
};

const getScheduleById = async (id) => {
  const schedule = await Trip.findOne({
    _id: id,
    "schedule.isRecurring": true,
  }).populate("bus", "busNumber busClass size capacity");

  if (!schedule) {
    const error = new Error("Schedule not found.");
    error.statusCode = 404;
    throw error;
  }

  const generatedCount = await Trip.countDocuments({
    recurrenceGroupId: schedule.recurrenceGroupId,
    "schedule.isRecurring": false,
  });

  return { schedule, generatedCount };
};

const updateSchedule = async (id, updates) => {
  const schedule = await Trip.findOne({
    _id: id,
    "schedule.isRecurring": true,
  });
  if (!schedule) {
    const error = new Error("Schedule not found.");
    error.statusCode = 404;
    throw error;
  }

  const filtered = {};
  if (updates.from) filtered.from = updates.from;
  if (updates.to) filtered.to = updates.to;
  if (updates.bus) filtered.bus = updates.bus;
  if (updates.price !== undefined) filtered.price = updates.price;
  if (updates.departureTime) filtered.departureTime = updates.departureTime;
  if (updates.frequency) filtered["schedule.frequency"] = updates.frequency;
  if (updates.startDate)
    filtered["schedule.startDate"] = new Date(updates.startDate);
  if (updates.endDate) filtered["schedule.endDate"] = new Date(updates.endDate);
  if (updates.daysOfWeek) filtered["schedule.daysOfWeek"] = updates.daysOfWeek;
  if (updates.dayOfMonth) filtered["schedule.dayOfMonth"] = updates.dayOfMonth;

  const updatedSchedule = await Trip.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });

  const today = getDamascusToday();
  const futureGeneratedTrips = await Trip.find({
    recurrenceGroupId: schedule.recurrenceGroupId,
    "schedule.isRecurring": false,
    departureDate: { $gte: today },
  });

  let updatedCount = 0;
  for (const trip of futureGeneratedTrips) {
    const hasReservations = await Reservation.exists({
      trip: trip._id,
      status: "CONFIRMED",
    });
    if (!hasReservations) {
      const tripUpdates = {};
      if (updates.from) tripUpdates.from = updates.from;
      if (updates.to) tripUpdates.to = updates.to;
      if (updates.bus) tripUpdates.bus = updates.bus;
      if (updates.price !== undefined) tripUpdates.price = updates.price;
      if (updates.departureTime)
        tripUpdates.departureTime = updates.departureTime;
      if (Object.keys(tripUpdates).length > 0) {
        await Trip.findByIdAndUpdate(trip._id, tripUpdates);
        updatedCount++;
      }
    }
  }

  return { schedule: updatedSchedule, updatedTripsCount: updatedCount };
};

const deleteSchedule = async (id) => {
  const schedule = await Trip.findOne({
    _id: id,
    "schedule.isRecurring": true,
  });
  if (!schedule) {
    const error = new Error("Schedule not found.");
    error.statusCode = 404;
    throw error;
  }

  const today = getDamascusToday();
  const futureTrips = await Trip.find({
    recurrenceGroupId: schedule.recurrenceGroupId,
    "schedule.isRecurring": false,
    departureDate: { $gte: today },
    status: "SCHEDULED",
  });

  let deletedCount = 0;
  let cancelledCount = 0;

  for (const trip of futureTrips) {
    const hasReservations = await Reservation.exists({
      trip: trip._id,
      status: "CONFIRMED",
    });
    if (!hasReservations) {
      await Trip.findByIdAndDelete(trip._id);
      deletedCount++;
    } else {
      await Trip.findByIdAndUpdate(trip._id, { status: "CANCELLED" });
      cancelledCount++;
    }
  }

  await Trip.findByIdAndDelete(id);
  return {
    deletedTripsCount: deletedCount,
    cancelledTripsCount: cancelledCount,
  };
};

export const generateTripsForSchedule = async (scheduleDoc) => {
  const { schedule, recurrenceGroupId, bus, from, to, departureTime, price } =
    scheduleDoc;
  const today = getDamascusToday();
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + GENERATION_WINDOW_DAYS);

  const effectiveStart =
    schedule.startDate && schedule.startDate > today
      ? schedule.startDate
      : today;
  const effectiveEnd =
    schedule.endDate && schedule.endDate < windowEnd
      ? schedule.endDate
      : windowEnd;

  const existing = await Trip.find({
    recurrenceGroupId,
    "schedule.isRecurring": false,
  }).select("departureDate");

  const existingDates = new Set(
    existing.map((t) => t.departureDate.toISOString().split("T")[0]),
  );

  const datesToGenerate = getDatesInRange(
    effectiveStart,
    effectiveEnd,
    schedule,
  );
  const tripsToCreate = [];

  for (const date of datesToGenerate) {
    const dateStr = date.toISOString().split("T")[0];
    if (existingDates.has(dateStr)) continue;

    const overlap = await checkBusOverlap(bus, date, departureTime);
    if (overlap) continue;

    tripsToCreate.push({
      from,
      to,
      bus,
      departureDate: date,
      departureTime,
      price,
      status: "SCHEDULED",
      schedule: { isRecurring: false },
      recurrenceGroupId,
    });
  }

  if (tripsToCreate.length > 0) {
    await Trip.insertMany(tripsToCreate);
  }
  return tripsToCreate.length;
};

const getDatesInRange = (start, end, schedule) => {
  const dates = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dayOfMonth = current.getDate();
    let include = false;

    if (schedule.frequency === "DAILY") {
      include = true;
    } else if (schedule.frequency === "WEEKLY") {
      include =
        !schedule.daysOfWeek ||
        schedule.daysOfWeek.length === 0 ||
        schedule.daysOfWeek.includes(dayOfWeek);
    } else if (schedule.frequency === "MONTHLY") {
      include = schedule.dayOfMonth
        ? dayOfMonth === schedule.dayOfMonth
        : dayOfMonth === 1;
    }

    if (include) dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const runScheduleMaintenance = async () => {
  const schedules = await Trip.find({ "schedule.isRecurring": true });
  let totalGenerated = 0;

  for (const schedule of schedules) {
    try {
      const count = await generateTripsForSchedule(schedule);
      totalGenerated += count;
    } catch (err) {
      console.error(`[Schedule] Error for ${schedule._id}: ${err.message}`);
    }
  }

  if (totalGenerated > 0) {
    console.log(`[Schedule] Generated ${totalGenerated} new trip(s).`);
  }
  return totalGenerated;
};

export {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
