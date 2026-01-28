import express from "express";
import { 
  sendOtp, 
  verifyOtp, 
  loginWithPassword, 
  registerWithPassword 
} from "../controllers/authController.js";
import { otpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// --- OTP Authentication (Rate Limited) ---
router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);

// --- Password Authentication ---
router.post("/login-password", loginWithPassword);
router.post("/register-password", registerWithPassword);

export default router;