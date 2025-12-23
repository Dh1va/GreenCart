const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: Number,
        price: Number,
      },
    ],

    address: { type: mongoose.Schema.Types.ObjectId, ref: "address" },

    courier: {
      courierId: { type: mongoose.Schema.Types.ObjectId, ref: "courier" },
      name: String,
      price: Number,
      minDays: Number,
      maxDays: Number,
    },

    payment: {
      method: { type: String, enum: ["razorpay", "cod"] },
      status: { type: String, enum: ["pending", "paid", "failed"] },
      transactionId: String,
    },

    // 🔥 DELIVERY LIFECYCLE
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

      trackingId: { type: String },        // admin updates
      trackingUrl: { type: String },       // optional
      shippedAt: Date,
      deliveredAt: Date,
    },

    pricing: {
      subtotal: Number,
      tax: Number,
      deliveryFee: Number,
      discount: Number,
      total: Number,
    },
  },
  { timestamps: true }
);
