import mongoose from "mongoose";
import Reservation from "../models/Reservation.model.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    const reservationIndexes = await Reservation.collection.indexes();

    for (const index of reservationIndexes) {
      if (
        Object.keys(index.key).length === 1 &&
        index.key.bookingReference === 1 &&
        index.unique
      ) {
        await Reservation.collection.dropIndex(index.name);
      }
    }

    await Reservation.createIndexes();
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
