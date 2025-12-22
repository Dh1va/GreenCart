import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "product",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    amount: {
      type: Number,
      required: true,
    },

    address: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "address",
    },

    courier: {
      name: { type: String },
      price: { type: Number, default: 0 },
    },

    coupon: {
      code: { type: String },
      discount: { type: Number, default: 0 },
    },

    status: {
      type: String,
      default: "Order Placed",
    },

    paymentType: {
      type: String,
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.order ||
  mongoose.model("order", orderSchema);
