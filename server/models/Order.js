import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
      required: true,
    },

    courier: {
      courierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courier",
      },
      name: String,
      price: Number,
      minDays: Number,
      maxDays: Number,
    },

    payment: {
      method: {
        type: String,
        enum: ["razorpay", "cod"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      transactionId: String,
    },

    delivery: {
      status: {
        type: String,
        enum: [
          "order_placed",
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ],
        default: "order_placed",
      },
      trackingId: String,
      trackingUrl: String,
      shippedAt: Date,
      deliveredAt: Date,
    },

    pricing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("order", orderSchema);
