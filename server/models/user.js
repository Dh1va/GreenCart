import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    mobile: { type: String, required: true, unique: true },
    role: { type: String, default: "user" },
    cartItems: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;
