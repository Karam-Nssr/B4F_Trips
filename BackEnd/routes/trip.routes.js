import { Router } from "express";
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  cancelTrip,
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "../controllers/trip.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import {
  validateCreateTrip,
  validateCreateSchedule,
} from "../validators/trip.validator.js";

const router = Router();

// ── Schedule routes — MUST come before /:id ──────────────────────────────────
router.post(
  "/schedules",
  authenticate,
  authorize("ADMIN"),
  validateCreateSchedule,
  createSchedule,
);
router.get("/schedules", authenticate, authorize("ADMIN"), getAllSchedules);
router.get("/schedules/:id", authenticate, authorize("ADMIN"), getScheduleById);
router.put("/schedules/:id", authenticate, authorize("ADMIN"), updateSchedule);
router.delete(
  "/schedules/:id",
  authenticate,
  authorize("ADMIN"),
  deleteSchedule,
);

// ── Trip routes ───────────────────────────────────────────────────────────────
router.get("/", authenticate, getAllTrips);
router.get("/:id", authenticate, getTripById);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateCreateTrip,
  createTrip,
);
router.put("/:id", authenticate, authorize("ADMIN"), updateTrip);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteTrip);
router.patch("/:id/cancel", authenticate, authorize("ADMIN"), cancelTrip);

export default router;
