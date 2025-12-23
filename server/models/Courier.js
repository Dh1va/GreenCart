import mongoose from "mongoose";
const courierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    price: { type: Number, required: true },

    // ETA range in days (machine usable)
    minDays: { type: Number, required: true },
    maxDays: { type: Number, required: true },

    // Admin control flags
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Optional future extension
    description: { type: String }, // e.g. "Fastest delivery"
  },
  { timestamps: true }
);
export default mongoose.models.courier ||
  mongoose.model("courier", courierSchema);
