import rateLimit from "express-rate-limit";

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
