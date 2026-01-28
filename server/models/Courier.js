import mongoose from "mongoose";
const courierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    price: { type: Number, required: true },
    chargePerItem: { type: Boolean, default: false },

    // ETA range in days (machine usable)
    minDays: { type: Number, required: true },
    maxDays: { type: Number, required: true },

    trackingPrefix: { type: String, default: "" }, 
    trackingSequence: { type: Number, default: 1000 }, 

    // Admin control flags
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Optional future extension
    description: { type: String }, 
  },
  { timestamps: true }
);
export default mongoose.models.courier ||
  mongoose.model("courier", courierSchema);
