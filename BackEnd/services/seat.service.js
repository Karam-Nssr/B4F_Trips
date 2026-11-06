import Seat from "../models/Seat.model.js";
import Bus from "../models/Bus.model.js";
import Reservation from "../models/Reservation.model.js";

/**
 * Build the seat layout array for a bus document.
 * ORDINARY  (2+2): rows 1..N-1 → [L,L,R,R], last row → [L,L,M,R,R]
 * FIRST_CLASS(1+2): every row  → [L,R,R]
 * BUSINESS  (1+1): every row  → [L,R]
 */
export const buildSeatLayout = (bus) => {
  const { _id: busId, busClass, size } = bus;
  const rowCount = size === "LARGE" ? 11 : 9;
  const seats = [];
  let seatNum = 1;

  if (busClass === "ORDINARY") {
    for (let row = 1; row <= rowCount - 1; row++) {
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "LEFT",
        column: 1,
      });
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "LEFT",
        column: 2,
      });
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "RIGHT",
        column: 3,
      });
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "RIGHT",
        column: 4,
      });
    }
    const lastRow = rowCount;
    seats.push({
      bus: busId,
      seatNumber: String(seatNum++),
      row: lastRow,
      position: "LEFT",
      column: 1,
    });
    seats.push({
      bus: busId,
      seatNumber: String(seatNum++),
      row: lastRow,
      position: "LEFT",
      column: 2,
    });
    seats.push({
      bus: busId,
      seatNumber: String(seatNum++),
      row: lastRow,
      position: "MIDDLE",
      column: 3,
    });
    seats.push({
      bus: busId,
      seatNumber: String(seatNum++),
      row: lastRow,
      position: "RIGHT",
      column: 4,
    });
    seats.push({
      bus: busId,
      seatNumber: String(seatNum++),
      row: lastRow,
      position: "RIGHT",
      column: 5,
    });
  } else if (busClass === "FIRST_CLASS") {
    for (let row = 1; row <= rowCount; row++) {
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "LEFT",
        column: 1,
      });
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "RIGHT",
        column: 2,
      });
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "RIGHT",
        column: 3,
      });
    }
  } else if (busClass === "BUSINESS") {
    for (let row = 1; row <= rowCount; row++) {
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "LEFT",
        column: 1,
      });
      seats.push({
        bus: busId,
        seatNumber: String(seatNum++),
        row,
        position: "RIGHT",
        column: 2,
      });
    }
  }

  return seats;
};

export const generateSeatsForBus = async (busId) => {
  const bus = await Bus.findById(busId);
  if (!bus) {
    const error = new Error("Bus not found.");
    error.statusCode = 404;
    throw error;
  }

  const existing = await Seat.countDocuments({ bus: busId });
  if (existing > 0) {
    const error = new Error("Seats already exist for this bus.");
    error.statusCode = 409;
    throw error;
  }

  const seats = buildSeatLayout(bus);

  if (seats.length !== bus.capacity) {
    const error = new Error(
      `Generated seat count (${seats.length}) does not match bus capacity (${bus.capacity}).`,
    );
    error.statusCode = 500;
    throw error;
  }

  const createdSeats = await Seat.insertMany(seats);
  return createdSeats;
};

export const getSeatsByBus = async (busId) => {
  const bus = await Bus.findById(busId);
  if (!bus) {
    const error = new Error("Bus not found.");
    error.statusCode = 404;
    throw error;
  }

  const seats = await Seat.find({ bus: busId }).sort({ row: 1, column: 1 });
  return { bus, seats };
};

export const getSeatsByTrip = async (tripId) => {
  // Dynamic import to avoid circular dependency
  const { default: Trip } = await import("../models/Trip.model.js");

  const trip = await Trip.findById(tripId).populate("bus");
  if (!trip) {
    const error = new Error("Trip not found.");
    error.statusCode = 404;
    throw error;
  }

  if (trip.status === "CANCELLED") {
    const error = new Error("This trip has been cancelled.");
    error.statusCode = 400;
    throw error;
  }

  const seats = await Seat.find({ bus: trip.bus._id, isActive: true }).sort({
    row: 1,
    column: 1,
  });

  const reservations = await Reservation.find({
    trip: tripId,
    status: "CONFIRMED",
  }).select("seat");
  const reservedSeatIds = new Set(reservations.map((r) => r.seat.toString()));

  const seatLayout = seats.map((seat) => ({
    seatId: seat._id,
    seatNumber: seat.seatNumber,
    row: seat.row,
    position: seat.position,
    column: seat.column,
    status: reservedSeatIds.has(seat._id.toString()) ? "RESERVED" : "AVAILABLE",
  }));

  return {
    tripId: trip._id,
    trip: {
      from: trip.from,
      to: trip.to,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      price: trip.price,
      status: trip.status,
    },
    bus: {
      busId: trip.bus._id,
      busNumber: trip.bus.busNumber,
      busClass: trip.bus.busClass,
      size: trip.bus.size,
    },
    busCapacity: trip.bus.capacity,
    availableSeats: seats.length - reservedSeatIds.size,
    reservedSeats: reservedSeatIds.size,
    seats: seatLayout,
  };
};
