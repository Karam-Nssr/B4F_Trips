import { Router } from "express";
import {
  getSeatsByBus,
  getSeatsByTrip,
} from "../controllers/seat.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = Router();

// GET /api/buses/:busId/seats — ADMIN only
router.get(
  "/buses/:busId/seats",
  authenticate,
  authorize("ADMIN"),
  getSeatsByBus,
);

// GET /api/trips/:tripId/seats — All authenticated roles
router.get("/trips/:tripId/seats", getSeatsByTrip);

export default router;
