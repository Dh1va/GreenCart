import cron from "node-cron";
import Otp from "../models/Otp.js";

export const startOtpCleanup = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      const result = await Otp.deleteMany({ expiresAt: { $lt: now } });
      if (result.deletedCount > 0) {
        console.log(`🧹 OTP cleanup: ${result.deletedCount} expired OTPs removed`);
      }
    } catch (err) {
      console.error("OTP cleanup error:", err.message);
    }
  });
};
