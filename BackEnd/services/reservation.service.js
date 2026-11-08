import Reservation from "../models/Reservation.model.js";
import Trip from "../models/Trip.model.js";
import Seat from "../models/Seat.model.js";

const simulatePayment = ({ amount, paymentMethod }) => {
  if (paymentMethod !== "SIMULATED_ONLINE") {
    const error = new Error("Unsupported payment method.");
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error("Invalid payment amount.");
    error.statusCode = 400;
    throw error;
  }
  return { success: true, paidAt: new Date() };
};

const createBookingReference = (reservationId) =>
  `BR-${new Date().getFullYear()}-${reservationId
    .toString()
    .slice(-6)
    .toUpperCase()}`;

const checkout = async ({
  tripId,
  seatId,
  passengerName,
  passengerPhone,
  nationalId,
  paymentMethod,
}) => {
  const trip = await Trip.findById(tripId).populate(
    "bus",
    "busNumber isActive",
  );
  if (!trip) {
    const error = new Error("Trip not found.");
    error.statusCode = 404;
    throw error;
  }
  if (trip.status !== "SCHEDULED") {
    const error = new Error("This trip is not available for booking.");
    error.statusCode = 409;
    throw error;
  }

  const seat = await Seat.findById(seatId);
  if (!seat) {
    const error = new Error("Seat not found.");
    error.statusCode = 404;
    throw error;
  }
  if (!seat.isActive || !trip.bus || !trip.bus.isActive) {
    const error = new Error("This seat is no longer available.");
    error.statusCode = 409;
    throw error;
  }
  if (seat.bus.toString() !== trip.bus._id.toString()) {
    const error = new Error(
      "This seat does not belong to the bus assigned to this trip.",
    );
    error.statusCode = 400;
    throw error;
  }

  const payment = simulatePayment({
    amount: trip.price,
    paymentMethod,
  });

  const existingReservation = await Reservation.findOne({
    trip: tripId,
    seat: seatId,
    status: "CONFIRMED",
  });
  if (existingReservation) {
    const error = new Error("This seat is already reserved for this trip.");
    error.statusCode = 409;
    throw error;
  }

  let reservation;
  try {
    reservation = await Reservation.create({
      trip: tripId,
      seat: seatId,
      createdBy: null,
      user: null,
      passengerName,
      passengerPhone,
      nationalId,
      paymentMethod,
      paymentStatus: "PAID",
      paidAt: payment.paidAt,
      status: "CONFIRMED",
    });
    reservation.bookingReference = createBookingReference(reservation._id);
    await reservation.save();
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(
        "This seat was just reserved by someone else. Please select another seat.",
      );
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }

  return {
    bookingReference: reservation.bookingReference,
    reservationId: reservation._id,
    status: reservation.status,
    paymentStatus: reservation.paymentStatus,
    passengerName: reservation.passengerName,
    passengerPhone: reservation.passengerPhone,
    nationalId: reservation.nationalId,
    seatNumber: seat.seatNumber,
    trip: {
      from: trip.from,
      to: trip.to,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      price: trip.price,
      busNumber: trip.bus.busNumber,
    },
    paidAt: reservation.paidAt,
  };
};

const createReservation = async ({
  tripId,
  seatId,
  passengerName,
  passengerPhone,
  requestingUser,
}) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    const error = new Error("Trip not found.");
    error.statusCode = 404;
    throw error;
  }

  if (trip.status !== "SCHEDULED") {
    const error = new Error(
      `This trip is not available for booking. Status: ${trip.status}`,
    );
    error.statusCode = 400;
    throw error;
  }

  const seat = await Seat.findById(seatId);
  if (!seat) {
    const error = new Error("Seat not found.");
    error.statusCode = 404;
    throw error;
  }

  if (seat.bus.toString() !== trip.bus.toString()) {
    const error = new Error(
      "This seat does not belong to the bus assigned to this trip.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (!seat.isActive) {
    const error = new Error("This seat is not available.");
    error.statusCode = 400;
    throw error;
  }

  const existingReservation = await Reservation.findOne({
    trip: tripId,
    seat: seatId,
    status: "CONFIRMED",
  });
  if (existingReservation) {
    const error = new Error("This seat is already reserved for this trip.");
    error.statusCode = 409;
    throw error;
  }

  const reservationData = {
    trip: tripId,
    seat: seatId,
    createdBy: requestingUser._id,
    passengerName,
    passengerPhone,
    status: "CONFIRMED",
  };

  if (requestingUser.role === "USER") {
    reservationData.user = requestingUser._id;
  }

  let reservation;
  try {
    reservation = await Reservation.create(reservationData);
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(
        "This seat was just reserved by someone else. Please select another seat.",
      );
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }

  await reservation.populate([
    {
      path: "trip",
      select: "from to departureDate departureTime price status",
    },
    { path: "seat", select: "seatNumber row position column" },
    { path: "createdBy", select: "name email role" },
  ]);

  return reservation;
};

const getAllReservations = async ({
  requestingUser,
  page = 1,
  limit = 10,
  tripId,
  status,
}) => {
  const query = {};

  if (requestingUser.role === "EMPLOYEE") {
    query.createdBy = requestingUser._id;
  }

  if (tripId) query.trip = tripId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const total = await Reservation.countDocuments(query);
  const reservations = await Reservation.find(query)
    .populate("trip", "from to departureDate departureTime price status")
    .populate("seat", "seatNumber row position")
    .populate("user", "name email phone")
    .populate("createdBy", "name email role")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return {
    reservations,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      perPage: Number(limit),
    },
  };
};

const getMyReservations = async ({ userId, page = 1, limit = 10, status }) => {
  const query = { user: userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const total = await Reservation.countDocuments(query);
  const reservations = await Reservation.find(query)
    .populate("trip", "from to departureDate departureTime price status")
    .populate("seat", "seatNumber row position column")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return {
    reservations,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      perPage: Number(limit),
    },
  };
};

const getReservationById = async (id, requestingUser) => {
  const reservation = await Reservation.findById(id)
    .populate("trip", "from to departureDate departureTime price status")
    .populate("seat", "seatNumber row position column")
    .populate("user", "name email phone")
    .populate("createdBy", "name email role");

  if (!reservation) {
    const error = new Error("Reservation not found.");
    error.statusCode = 404;
    throw error;
  }

  if (requestingUser.role === "USER") {
    if (
      !reservation.user ||
      reservation.user._id.toString() !== requestingUser._id.toString()
    ) {
      const error = new Error(
        "You do not have permission to view this reservation.",
      );
      error.statusCode = 403;
      throw error;
    }
  } else if (requestingUser.role === "EMPLOYEE") {
    if (
      !reservation.createdBy ||
      reservation.createdBy._id.toString() !== requestingUser._id.toString()
    ) {
      const error = new Error(
        "You do not have permission to view this reservation.",
      );
      error.statusCode = 403;
      throw error;
    }
  }

  return reservation;
};

const cancelReservation = async (id, requestingUser) => {
  if (requestingUser.role === "USER") {
    const error = new Error(
      "Customers are not allowed to cancel reservations. Please contact reception.",
    );
    error.statusCode = 403;
    throw error;
  }

  const reservation = await Reservation.findById(id);
  if (!reservation) {
    const error = new Error("Reservation not found.");
    error.statusCode = 404;
    throw error;
  }

  if (reservation.status === "CANCELLED") {
    const error = new Error("This reservation is already cancelled.");
    error.statusCode = 400;
    throw error;
  }

  if (requestingUser.role === "EMPLOYEE") {
    if (
      !reservation.createdBy ||
      reservation.createdBy.toString() !== requestingUser._id.toString()
    ) {
      const error = new Error(
        "You can only cancel reservations that you created.",
      );
      error.statusCode = 403;
      throw error;
    }
  }

  reservation.status = "CANCELLED";
  await reservation.save();
  return reservation;
};

export {
  createReservation,
  checkout,
  getAllReservations,
  getMyReservations,
  getReservationById,
  cancelReservation,
};
