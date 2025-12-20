import express from "express";
import { sendOtp, verifyOtp } from "../controllers/authController.js";
import { otpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);

export default router;
