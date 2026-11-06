import Trip from "../models/Trip.model.js";
import Bus from "../models/Bus.model.js";
import Reservation from "../models/Reservation.model.js";

export const checkBusOverlap = async (
  busId,
  departureDate,
  departureTime,
  excludeTripId = null,
) => {
  const [hours, minutes] = departureTime.split(":").map(Number);
  const departureMins = hours * 60 + minutes;
  const bufferMins = 180; // 3-hour buffer

  const sameDayTrips = await Trip.find({
    bus: busId,
    departureDate: {
      $gte: new Date(new Date(departureDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(departureDate).setHours(23, 59, 59, 999)),
    },
    status: { $ne: "CANCELLED" },
    ...(excludeTripId && { _id: { $ne: excludeTripId } }),
  });

  for (const trip of sameDayTrips) {
    const [th, tm] = trip.departureTime.split(":").map(Number);
    const tripMins = th * 60 + tm;
    if (Math.abs(tripMins - departureMins) < bufferMins) return true;
  }
  return false;
};

const getAllTrips = async ({
  page = 1,
  limit = 10,
  from,
  to,
  departureDate,
  busClass,
  minPrice,
  maxPrice,
  status,
  availableOnly,
}) => {
  const query = {};
  if (from) query.from = { $regex: from, $options: "i" };
  if (to) query.to = { $regex: to, $options: "i" };
  if (departureDate) {
    const date = new Date(departureDate);
    query.departureDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lte: new Date(date.setHours(23, 59, 59, 999)),
    };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }
  if (status) {
    query.status = status;
  } else if (availableOnly === "true") {
    query.status = "SCHEDULED";
  }

  if (busClass) {
    const allTrips = await Trip.find(query).populate(
      "bus",
      "busNumber busClass size capacity",
    );
    const filtered = allTrips.filter(
      (t) => t.bus && t.bus.busClass === busClass,
    );
    const total = filtered.length;
    const skip = (page - 1) * limit;
    const trips = filtered.slice(skip, skip + Number(limit));
    return {
      trips,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        perPage: Number(limit),
      },
    };
  }

  const skip = (page - 1) * limit;
  const total = await Trip.countDocuments(query);
  const trips = await Trip.find(query)
    .populate("bus", "busNumber busClass size capacity")
    .skip(skip)
    .limit(Number(limit))
    .sort({ departureDate: 1, departureTime: 1 });

  return {
    trips,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      perPage: Number(limit),
    },
  };
};

const getTripById = async (id) => {
  const trip = await Trip.findById(id).populate(
    "bus",
    "busNumber busClass size capacity price",
  );
  if (!trip) {
    const error = new Error("Trip not found.");
    error.statusCode = 404;
    throw error;
  }
  return trip;
};

const createTrip = async ({
  from,
  to,
  bus,
  departureDate,
  departureTime,
  price,
}) => {
  const busDoc = await Bus.findById(bus);
  if (!busDoc) {
    const error = new Error("Bus not found.");
    error.statusCode = 404;
    throw error;
  }
  if (!busDoc.isActive) {
    const error = new Error("Cannot assign an inactive bus to a trip.");
    error.statusCode = 400;
    throw error;
  }

  const overlap = await checkBusOverlap(bus, departureDate, departureTime);
  if (overlap) {
    const error = new Error(
      "This bus already has a trip scheduled within 3 hours of the requested departure time on this date.",
    );
    error.statusCode = 409;
    throw error;
  }

  const trip = await Trip.create({
    from,
    to,
    bus,
    departureDate: new Date(departureDate),
    departureTime,
    price,
    status: "SCHEDULED",
  });

  return trip.populate("bus", "busNumber busClass size capacity");
};

const updateTrip = async (id, updates) => {
  const trip = await Trip.findById(id);
  if (!trip) {
    const error = new Error("Trip not found.");
    error.statusCode = 404;
    throw error;
  }
  if (trip.status === "CANCELLED") {
    const error = new Error("Cannot update a cancelled trip.");
    error.statusCode = 400;
    throw error;
  }

  if (updates.bus && updates.bus.toString() !== trip.bus.toString()) {
    const busDoc = await Bus.findById(updates.bus);
    if (!busDoc || !busDoc.isActive) {
      const error = new Error("Invalid or inactive bus.");
      error.statusCode = 400;
      throw error;
    }
    const hasReservations = await Reservation.exists({
      trip: id,
      status: "CONFIRMED",
    });
    if (hasReservations) {
      const error = new Error(
        "Cannot change the bus for a trip with existing confirmed reservations.",
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const finalBus = updates.bus || trip.bus;
  const finalDate = updates.departureDate || trip.departureDate;
  const finalTime = updates.departureTime || trip.departureTime;
  const overlap = await checkBusOverlap(finalBus, finalDate, finalTime, id);
  if (overlap) {
    const error = new Error(
      "This bus already has a trip scheduled within 3 hours of the requested departure time on this date.",
    );
    error.statusCode = 409;
    throw error;
  }

  const updated = await Trip.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("bus", "busNumber busClass size capacity");

  return updated;
};

const deleteTrip = async (id) => {
  const trip = await Trip.findById(id);
  if (!trip) {
    const error = new Error("Trip not found.");
    error.statusCode = 404;
    throw error;
  }

  // CONFIRMED BUSINESS RULE: cannot delete trip with active reservations
  const confirmedReservations = await Reservation.countDocuments({
    trip: id,
    status: "CONFIRMED",
  });

  if (confirmedReservations > 0) {
    const error = new Error(
      `Cannot delete this trip. It has ${confirmedReservations} active confirmed reservation(s). Please cancel all reservations before deleting the trip.`,
    );
    error.statusCode = 409;
    throw error;
  }

  await Trip.findByIdAndDelete(id);
  return trip;
};

const cancelTrip = async (id) => {
  const trip = await Trip.findById(id);
  if (!trip) {
    const error = new Error("Trip not found.");
    error.statusCode = 404;
    throw error;
  }
  if (trip.status === "CANCELLED") {
    const error = new Error("Trip is already cancelled.");
    error.statusCode = 400;
    throw error;
  }
  if (trip.status === "COMPLETED") {
    const error = new Error("Cannot cancel a completed trip.");
    error.statusCode = 400;
    throw error;
  }

  trip.status = "CANCELLED";
  await trip.save();
  return trip;
};

export {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  cancelTrip,
};
