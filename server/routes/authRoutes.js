import express from "express";
import { 
  sendOtp, 
  verifyOtp, 
  loginWithPassword, 
  registerWithPassword 
} from "../controllers/authController.js";
import { otpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);

router.post("/login-password", loginWithPassword);
router.post("/register-password", registerWithPassword);

export default router;