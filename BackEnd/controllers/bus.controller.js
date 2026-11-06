import * as busService from "../services/bus.service.js";

const getAllBuses = async (req, res, next) => {
  try {
    const { page, limit, busClass, size, isActive } = req.query;
    const result = await busService.getAllBuses({
      page,
      limit,
      busClass,
      size,
      isActive,
    });
    res.status(200).json({
      success: true,
      message: "Buses retrieved successfully.",
      data: result.buses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getBusById = async (req, res, next) => {
  try {
    const bus = await busService.getBusById(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Bus retrieved successfully.",
        data: bus,
      });
  } catch (error) {
    next(error);
  }
};

const createBus = async (req, res, next) => {
  try {
    const { busNumber, busClass, size, capacity, price } = req.body;
    const bus = await busService.createBus({
      busNumber,
      busClass,
      size,
      capacity,
      price,
    });
    res
      .status(201)
      .json({ success: true, message: "Bus created successfully.", data: bus });
  } catch (error) {
    next(error);
  }
};

const updateBus = async (req, res, next) => {
  try {
    const bus = await busService.updateBus(req.params.id, req.body);
    res
      .status(200)
      .json({ success: true, message: "Bus updated successfully.", data: bus });
  } catch (error) {
    next(error);
  }
};

const deleteBus = async (req, res, next) => {
  try {
    await busService.deleteBus(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Bus deleted successfully.",
        data: null,
      });
  } catch (error) {
    next(error);
  }
};

const deactivateBus = async (req, res, next) => {
  try {
    const bus = await busService.deactivateBus(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Bus deactivated successfully.",
        data: bus,
      });
  } catch (error) {
    next(error);
  }
};

export {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  deactivateBus,
};
