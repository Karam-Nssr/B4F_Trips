import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: [true, "Bus reference is required"],
  },
  seatNumber: {
    type: String,
    required: [true, "Seat number is required"],
  },
  row: {
    type: Number,
    required: [true, "Row is required"],
    min: 1,
  },
  position: {
    type: String,
    enum: ["LEFT", "MIDDLE", "RIGHT"],
    required: [true, "Position is required"],
  },
  column: {
    type: Number,
    required: [true, "Column is required"],
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

seatSchema.index({ bus: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ bus: 1, row: 1, column: 1 });

const Seat = mongoose.model("Seat", seatSchema);
export default Seat;
