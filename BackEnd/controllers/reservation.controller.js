import * as reservationService from "../services/reservation.service.js";

const createReservation = async (req, res, next) => {
  try {
    const { trip, seat, passengerName, passengerPhone } = req.body;
    const reservation = await reservationService.createReservation({
      tripId: trip,
      seatId: seat,
      passengerName,
      passengerPhone,
      requestingUser: req.user,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Reservation created successfully.",
        data: reservation,
      });
  } catch (error) {
    next(error);
  }
};

const checkout = async (req, res, next) => {
  try {
    const {
      tripId,
      seatId,
      fullName,
      phone,
      nationalId,
      paymentMethod,
    } = req.body;
    const ticket = await reservationService.checkout({
      tripId,
      seatId,
      passengerName: fullName,
      passengerPhone: phone,
      nationalId,
      paymentMethod,
    });
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

const getAllReservations = async (req, res, next) => {
  try {
    const { page, limit, tripId, status } = req.query;
    const result = await reservationService.getAllReservations({
      requestingUser: req.user,
      page,
      limit,
      tripId,
      status,
    });
    res.status(200).json({
      success: true,
      message: "Reservations retrieved successfully.",
      data: result.reservations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMyReservations = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await reservationService.getMyReservations({
      userId: req.user._id,
      page,
      limit,
      status,
    });
    res.status(200).json({
      success: true,
      message: "Your reservations retrieved successfully.",
      data: result.reservations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getReservationById = async (req, res, next) => {
  try {
    const reservation = await reservationService.getReservationById(
      req.params.id,
      req.user,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Reservation retrieved successfully.",
        data: reservation,
      });
  } catch (error) {
    next(error);
  }
};

const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.cancelReservation(
      req.params.id,
      req.user,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Reservation cancelled successfully.",
        data: reservation,
      });
  } catch (error) {
    next(error);
  }
};

export {
  createReservation,
  checkout,
  getAllReservations,
  getMyReservations,
  getReservationById,
  cancelReservation,
};
