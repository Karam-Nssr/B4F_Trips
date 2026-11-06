import * as seatService from "../services/seat.service.js";

const getSeatsByBus = async (req, res, next) => {
  try {
    const { bus, seats } = await seatService.getSeatsByBus(req.params.busId);
    res.status(200).json({
      success: true,
      message: "Seats retrieved successfully.",
      data: { bus, seats },
    });
  } catch (error) {
    next(error);
  }
};

const getSeatsByTrip = async (req, res, next) => {
  try {
    const data = await seatService.getSeatsByTrip(req.params.tripId);
    res.status(200).json({
      success: true,
      message: "Trip seat availability retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export { getSeatsByBus, getSeatsByTrip };
