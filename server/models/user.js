import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    mobile: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    cartItems: { type: Object, default: {} },
    hasMergedGuestCart: {
      type: Boolean,
      default: false
    }
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;
