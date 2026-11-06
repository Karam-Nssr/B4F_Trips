import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authenticate, getMe);

export default router;
