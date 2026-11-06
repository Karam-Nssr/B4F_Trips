import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY"] },
    startDate: { type: Date },
    endDate: { type: Date },
    daysOfWeek: { type: [Number], default: [] },
    dayOfMonth: { type: Number, min: 1, max: 31 },
  },
  { _id: false },
);

const tripSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: [true, "Source city is required"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "Destination city is required"],
      trim: true,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: [true, "Bus is required"],
    },
    departureDate: {
      type: Date,
      required: [true, "Departure date is required"],
    },
    departureTime: {
      type: String,
      required: [true, "Departure time is required"],
      match: [/^\d{2}:\d{2}$/, "Departure time must be in HH:MM format"],
    },
    price: {
      type: Number,
      required: [true, "Ticket price is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
    schedule: {
      type: scheduleSchema,
      default: () => ({ isRecurring: false }),
    },
    recurrenceGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true },
);

// Validate source != destination
tripSchema.pre("save", function () {
  if (
    this.from &&
    this.to &&
    this.from.trim().toLowerCase() === this.to.trim().toLowerCase()
  ) {
    throw new Error("Source and destination cities must be different");
  }
});

tripSchema.index({ from: 1, to: 1, departureDate: 1, status: 1 });
tripSchema.index({ bus: 1, departureDate: 1 });
tripSchema.index({ recurrenceGroupId: 1 });
tripSchema.index({ "schedule.isRecurring": 1 });

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
