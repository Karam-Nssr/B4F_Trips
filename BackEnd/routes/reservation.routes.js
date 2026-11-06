import { Router } from "express";
import {
  createReservation,
  getAllReservations,
  getMyReservations,
  getReservationById,
  cancelReservation,
} from "../controllers/reservation.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validateCreateReservation } from "../validators/reservation.validator.js";

const router = Router();

// POST — ADMIN, EMPLOYEE, USER
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "EMPLOYEE", "USER"),
  validateCreateReservation,
  createReservation,
);

// GET my-reservations — must be before /:id
router.get(
  "/my-reservations",
  authenticate,
  authorize("USER"),
  getMyReservations,
);

// GET all — ADMIN, EMPLOYEE
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "EMPLOYEE"),
  getAllReservations,
);

// GET by id — all authenticated (access control handled in service)
router.get("/:id", authenticate, getReservationById);

// PATCH cancel — ADMIN, EMPLOYEE only
router.patch(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN", "EMPLOYEE"),
  cancelReservation,
);

export default router;
