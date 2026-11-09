import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: [true, "Trip is required"],
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: [true, "Seat is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    passengerName: {
      type: String,
      required: [true, "Passenger name is required"],
      trim: true,
    },
    passengerPhone: {
      type: String,
      required: [true, "Passenger phone is required"],
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return !this.createdBy || Boolean(value);
        },
        message: "National ID is required for guest reservations",
      },
    },
    // Shared by every seat reservation belonging to the same checkout.
    // It must NOT be unique because one booking can contain multiple seats.
    bookingReference: {
      type: String,
      trim: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["SIMULATED_ONLINE"],
    },
    paymentStatus: {
      type: String,
      enum: ["PAID"],
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true },
);

// One CONFIRMED reservation per trip+seat.
reservationSchema.index(
  { trip: 1, seat: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "CONFIRMED" },
    name: "unique_confirmed_seat_per_trip",
  },
);

reservationSchema.index({ trip: 1, status: 1 });
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ createdBy: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
