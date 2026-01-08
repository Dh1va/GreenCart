import Order from "../models/Order.js";
import Product from "../models/product.js";
import Coupon from "../models/Coupon.js";
import Address from "../models/Address.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ------------------------------------------------
   UTILITY: CALCULATE ORDER AMOUNT (SERVER AUTHORITY)
------------------------------------------------- */
const calculateAmount = async ({ items, courier, coupon }) => {
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }
    subtotal += product.offerPrice * item.quantity;
  }

  const tax = Math.floor(subtotal * 0.02);
  const courierPrice = courier?.price || 0;
  const couponDiscount = coupon?.discount || 0;

  const total = subtotal + tax + courierPrice - couponDiscount;

  return {
    subtotal,
    tax,
    courierPrice,
    couponDiscount,
    total,
  };
};

/* ------------------------------------------------
   PLACE ORDER — COD
   POST /api/order/cod
------------------------------------------------- */
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address, courier, coupon } = req.body;

    if (!items || items.length === 0) {
      return res.json({ success: false, message: "No items in order" });
    }

    if (!address?._id) {
      return res.json({ success: false, message: "Address required" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }

      subtotal += product.offerPrice * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.offerPrice, // ✅ REQUIRED
      });
    }

    const tax = Math.floor(subtotal * 0.02);
    const deliveryFee = courier?.price || 0;
    const discount = coupon?.discount || 0;
    const total = subtotal + tax + deliveryFee - discount;

    console.log("ORDER PAYLOAD", {
      user: userId,
      items: orderItems,
      pricing: { subtotal, tax, deliveryFee, discount, total },
      payment: { method: "cod" },
    });

    const order = await Order.create({
      user: userId, // ✅ REQUIRED
      items: orderItems,
      address: address._id, // ✅ ObjectId ONLY
      courier: courier
  ? {
      courierId: courier._id || null,
      name: courier.name,
      price: courier.price,
      minDays: courier.minDays,
      maxDays: courier.maxDays,
    }
  : null,
      payment: {
        method: "cod", // ✅ MUST MATCH ENUM
        status: "pending",
      },
      pricing: {
        subtotal, // ✅ REQUIRED
        tax,
        deliveryFee, // ✅ CORRECT FIELD
        discount,
        total, // ✅ REQUIRED
      },
      delivery: {
        status: "order_placed",
      },
    });

    res.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("COD Order Error:", error);
    res.json({ success: false, message: error.message });
  }
};




/* ------------------------------------------------
   CREATE RAZORPAY ORDER
------------------------------------------------- */
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, addressId, courier, coupon } = req.body;

    if (!items || !addressId) {
      return res.json({
        success: false,
        message: "Items and address are required",
      });
    }

    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }
      subtotal += product.offerPrice * item.quantity;
    }

    const tax = Math.floor(subtotal * 0.02);
    const deliveryCharge = courier?.price || 0;
    const couponDiscount = coupon?.discount || 0;
    const finalAmount = subtotal + tax + deliveryCharge - couponDiscount;

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      notes: {
        userId,
        addressId,
      },
    });

    res.json({
      success: true,
      order: razorpayOrder,
      amount: finalAmount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createRazorpayOrder error:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ------------------------------------------------
   VERIFY RAZORPAY PAYMENT (FIXED)
------------------------------------------------- */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      addressId,
      courier,
      coupon,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Payment verification failed" });
    }

    let subtotal = 0;
    const normalizedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }

      subtotal += product.offerPrice * item.quantity;

      normalizedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.offerPrice,
      });
    }

    const tax = Math.floor(subtotal * 0.02);
    const deliveryFee = courier?.price || 0;
    const discount = coupon?.discount || 0;
    const total = subtotal + tax + deliveryFee - discount;

    const order = await Order.create({
      user: req.userId,
      items: normalizedItems,
      address: addressId, // ✅ ObjectId
      courier: courier
  ? {
      courierId: courier._id || null,
      name: courier.name,
      price: courier.price,
      minDays: courier.minDays,
      maxDays: courier.maxDays,
    }
  : null,

      payment: {
        method: "razorpay", // ✅ enum match
        status: "paid",
        transactionId: razorpay_payment_id,
      },

      pricing: {
        subtotal,
        tax,
        deliveryFee,
        discount,
        total,
      },
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await Order.findByIdAndUpdate(orderId, { "delivery.status": status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ------------------------------------------------
   GET USER ORDERS
------------------------------------------------- */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


/* ------------------------------------------------
   GET ALL ORDERS (ADMIN)
------------------------------------------------- */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("address") // Populate EVERYTHING first to test
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ------------------------------------------------
   ADMIN: UPDATE TRACKING
------------------------------------------------- */
export const updateOrderTracking = async (req, res) => {
  try {
    const { orderId, trackingId } = req.body;

    await Order.findByIdAndUpdate(
      orderId,
      {
        "delivery.trackingId": trackingId,
        "delivery.shippedAt": new Date(),
      },
      { new: true }
    );

    res.json({ success: true, message: "Tracking updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ------------------------------------------------
   ADMIN: UPDATE PAYMENT STATUS
------------------------------------------------- */
export const updateOrderPayment = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await Order.findByIdAndUpdate(
      orderId,
      { "payment.status": status },
      { new: true }
    );

    res.json({ success: true, message: "Payment status updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
