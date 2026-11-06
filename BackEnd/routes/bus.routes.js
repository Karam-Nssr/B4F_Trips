import { Router } from "express";
import {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  deactivateBus,
} from "../controllers/bus.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validateCreateBus } from "../validators/trip.validator.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), getAllBuses);
router.get("/:id", authenticate, authorize("ADMIN"), getBusById);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateCreateBus,
  createBus,
);
router.put("/:id", authenticate, authorize("ADMIN"), updateBus);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteBus);
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("ADMIN"),
  deactivateBus,
);

export default router;
