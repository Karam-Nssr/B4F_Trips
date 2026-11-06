import mongoose from "mongoose";

export const BUS_CAPACITY_MAP = {
  ORDINARY:    { LARGE: 45, MEDIUM: 37 },
  FIRST_CLASS: { LARGE: 33, MEDIUM: 27 },
  BUSINESS:    { LARGE: 22, MEDIUM: 18 },
};

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, "Bus number is required"],
      unique: true,
      trim: true,
    },
    busClass: {
      type: String,
      enum: ["ORDINARY", "FIRST_CLASS", "BUSINESS"],
      required: [true, "Bus class is required"],
    },
    size: {
      type: String,
      enum: ["LARGE", "MEDIUM"],
      required: [true, "Bus size is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
    },
    price: {
      type: Number,
      required: [true, "Bus price is required"],
      min: [0, "Price cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Validate capacity matches class/size — no next() needed in async mongoose hooks
busSchema.pre("save", function () {
  const expectedCapacity = BUS_CAPACITY_MAP[this.busClass]?.[this.size];
  if (expectedCapacity !== undefined && this.capacity !== expectedCapacity) {
    throw new Error(
      `Capacity for ${this.busClass} ${this.size} bus must be ${expectedCapacity}, got ${this.capacity}`
    );
  }
});

const Bus = mongoose.model("Bus", busSchema);
export default Bus;
