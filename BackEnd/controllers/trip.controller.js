import * as tripService from "../services/trip.service.js";
import * as scheduleService from "../services/schedule.service.js";

const getAllTrips = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      from,
      to,
      departureDate,
      busClass,
      minPrice,
      maxPrice,
      status,
      availableOnly,
    } = req.query;
    const result = await tripService.getAllTrips({
      page,
      limit,
      from,
      to,
      departureDate,
      busClass,
      minPrice,
      maxPrice,
      status,
      availableOnly,
    });
    res.status(200).json({
      success: true,
      message: "Trips retrieved successfully.",
      data: result.trips,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Trip retrieved successfully.",
        data: trip,
      });
  } catch (error) {
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const { from, to, bus, departureDate, departureTime, price } = req.body;
    const trip = await tripService.createTrip({
      from,
      to,
      bus,
      departureDate,
      departureTime,
      price,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Trip created successfully.",
        data: trip,
      });
  } catch (error) {
    next(error);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.body);
    res
      .status(200)
      .json({
        success: true,
        message: "Trip updated successfully.",
        data: trip,
      });
  } catch (error) {
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    await tripService.deleteTrip(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Trip deleted successfully.",
        data: null,
      });
  } catch (error) {
    next(error);
  }
};

const cancelTrip = async (req, res, next) => {
  try {
    const trip = await tripService.cancelTrip(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Trip cancelled successfully.",
        data: trip,
      });
  } catch (error) {
    next(error);
  }
};

// ── Schedule Controllers ────────────────────────────────────────────────────

const createSchedule = async (req, res, next) => {
  try {
    const {
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
    } = req.body;
    const result = await scheduleService.createSchedule({
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
    });
    res.status(201).json({
      success: true,
      message: `Recurring schedule created. ${result.generatedCount} trip(s) generated.`,
      data: result.schedule,
      generatedCount: result.generatedCount,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSchedules = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await scheduleService.getAllSchedules({ page, limit });
    res.status(200).json({
      success: true,
      message: "Schedules retrieved successfully.",
      data: result.schedules,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getScheduleById = async (req, res, next) => {
  try {
    const result = await scheduleService.getScheduleById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Schedule retrieved successfully.",
      data: result.schedule,
      generatedCount: result.generatedCount,
    });
  } catch (error) {
    next(error);
  }
};

const updateSchedule = async (req, res, next) => {
  try {
    const result = await scheduleService.updateSchedule(
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: `Schedule updated. ${result.updatedTripsCount} future unbooked trip(s) updated.`,
      data: result.schedule,
      updatedTripsCount: result.updatedTripsCount,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const result = await scheduleService.deleteSchedule(req.params.id);
    res.status(200).json({
      success: true,
      message: `Schedule deleted. ${result.deletedTripsCount} trip(s) deleted, ${result.cancelledTripsCount} cancelled.`,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  cancelTrip,
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
