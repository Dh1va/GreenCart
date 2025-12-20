import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },

    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },

    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const Otp = mongoose.models.otp || mongoose.model("otp", otpSchema);
export default Otp;
