import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { loginLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);

export default router;
