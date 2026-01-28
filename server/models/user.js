import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isBlocked: { type: Boolean, default: false },

    cartItems: { type: Object, default: {} },

    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "product",
      default: [],
    },

    hasMergedGuestCart: {
      type: Boolean,
      default: false,
    },
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;
