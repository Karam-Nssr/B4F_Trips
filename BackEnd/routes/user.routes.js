import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), getAllUsers);
router.get("/:id", authenticate, getUserById);
router.post("/", authenticate, authorize("ADMIN"), createUser);
router.put("/:id", authenticate, authorize("ADMIN"), updateUser);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteUser);

export default router;
