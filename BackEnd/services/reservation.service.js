import Reservation from "../models/Reservation.model.js";
import Trip from "../models/Trip.model.js";
import Seat from "../models/Seat.model.js";

const simulatePayment = ({ amount, paymentMethod }) => {
  if (paymentMethod !== "SIMULATED_ONLINE") {
    const error = new Error("Unsupported payment method.");
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error("Invalid payment amount.");
    error.statusCode = 400;
    throw error;
  }

  // Training-project simulation: successful payment, no real gateway/charge.
  return { success: true, paidAt: new Date() };
};

const createBookingReference = () => {
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BR-${new Date().getFullYear()}-${randomPart}`;
};

const checkout = async ({ tripId, passengers, paymentMethod }) => {
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
  if (!trip.bus || !trip.bus.isActive) {
    const error = new Error("The bus assigned to this trip is not active.");
    error.statusCode = 409;
    throw error;
  }
  if (!Array.isArray(passengers) || passengers.length === 0) {
    const error = new Error("At least one passenger is required.");
    error.statusCode = 400;
    throw error;
  }

  const seatIds = passengers.map((item) => String(item.seatId));
  if (new Set(seatIds).size !== seatIds.length) {
    const error = new Error("A seat cannot be booked more than once.");
    error.statusCode = 400;
    throw error;
  }

  // Validate every seat belongs to this trip's bus and is active.
  const seats = await Seat.find({
    _id: { $in: seatIds },
    bus: trip.bus._id,
    isActive: true,
  });
  if (seats.length !== seatIds.length) {
    const error = new Error(
      "One or more selected seats are invalid or unavailable for this bus.",
    );
    error.statusCode = 400;
    throw error;
  }

  const seatById = new Map(seats.map((seat) => [seat._id.toString(), seat]));

  // Check all selected seats before simulating the single combined payment.
  const existingReservations = await Reservation.find({
    trip: tripId,
    seat: { $in: seatIds },
    status: "CONFIRMED",
  }).select("seat");

  if (existingReservations.length > 0) {
    const takenIds = new Set(
      existingReservations.map((reservation) => reservation.seat.toString()),
    );
    const takenNumbers = seats
      .filter((seat) => takenIds.has(seat._id.toString()))
      .map((seat) => seat.seatNumber);

    const error = new Error(
      `These seat(s) are no longer available: ${takenNumbers.join(", ")}.`,
    );
    error.statusCode = 409;
    throw error;
  }

  const totalAmount = trip.price * passengers.length;
  const payment = simulatePayment({ amount: totalAmount, paymentMethod });

  const bookingReference = createBookingReference();
  const reservationDocuments = passengers.map((item) => {
    const seat = seatById.get(String(item.seatId));
    return {
      trip: tripId,
      seat: seat._id,
      user: null,
      createdBy: null,
      passengerName: item.passenger.fullName.trim(),
      passengerPhone: item.passenger.phone.trim(),
      nationalId: item.passenger.nationalId.trim(),
      bookingReference,
      paymentMethod,
      paymentStatus: "PAID",
      paidAt: payment.paidAt,
      status: "CONFIRMED",
    };
  });

  let createdReservations = [];
  try {
    // One document per seat keeps the existing unique trip+seat constraint.
    // If any insert fails, remove all documents from this booking reference.
    createdReservations = await Reservation.insertMany(reservationDocuments, {
      ordered: true,
    });
  } catch (err) {
    await Reservation.deleteMany({ bookingReference });

    if (err.code === 11000) {
      const error = new Error(
        "At least one selected seat was just reserved by someone else. No seats from this booking were reserved. Please choose again.",
      );
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }

  const ticketPassengers = passengers.map((item) => {
    const seat = seatById.get(String(item.seatId));
    return {
      seatId: seat._id,
      seatNumber: seat.seatNumber,
      fullName: item.passenger.fullName.trim(),
      phone: item.passenger.phone.trim(),
      nationalId: item.passenger.nationalId.trim(),
    };
  });

  return {
    bookingReference,
    reservationIds: createdReservations.map((reservation) => reservation._id),
    status: "CONFIRMED",
    paymentStatus: "PAID",
    passengers: ticketPassengers,
    totalAmount,
    paidAt: payment.paidAt,
    trip: {
      from: trip.from,
      to: trip.to,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      price: trip.price,
      busNumber: trip.bus.busNumber,
    },
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
