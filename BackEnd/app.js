import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import busRoutes from "./routes/bus.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";

import errorHandler from "./middleware/error.middleware.js";
import notFound from "./middleware/notFound.middleware.js";

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Intercity Bus Reservation API is running.",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/buses", busRoutes);
app.use("/api", seatRoutes); // /api/buses/:busId/seats & /api/trips/:tripId/seats
app.use("/api/trips", tripRoutes);
app.use("/api/reservations", reservationRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
