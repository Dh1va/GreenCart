import Order from "../models/Order.js";
import Product from "../models/product.js";
import Coupon from "../models/Coupon.js";
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

    if (!address) {
      return res.json({ success: false, message: "Address required" });
    }

    const amountData = await calculateAmount({
      items,
      courier,
      coupon,
    });

    const order = await Order.create({
      userId,
      items,
      amount: amountData.total,
      address,
      courier: courier || null,
      coupon: coupon || null,
      paymentType: "COD",
      isPaid: false,
      status: "Order Placed",
    });

    if (coupon?.code) {
      await Coupon.findOneAndUpdate(
        { code: coupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

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
   POST /api/order/razorpay/order
------------------------------------------------- */
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, addressId, courier, coupon } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    if (!items || items.length === 0 || !addressId) {
      return res.json({
        success: false,
        message: "Items and address are required",
      });
    }

    /* ---------------- CALCULATE SUBTOTAL ---------------- */
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      subtotal += product.offerPrice * item.quantity;
    }

    /* ---------------- ADD TAX ---------------- */
    const tax = Math.floor(subtotal * 0.02);

    /* ---------------- ADD DELIVERY ---------------- */
    const deliveryCharge = courier?.price || 0;

    /* ---------------- APPLY COUPON ---------------- */
    const couponDiscount = coupon?.discount || 0;

    /* ---------------- FINAL AMOUNT ---------------- */
    const finalAmount =
      subtotal + tax + deliveryCharge - couponDiscount;

    /* ---------------- CREATE RAZORPAY ORDER ---------------- */
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: finalAmount * 100, // paise
      currency: "INR",
      notes: {
        userId,
        addressId,
        courier: courier?.name || "N/A",
        deliveryCharge,
        coupon: coupon?.code || "N/A",
      },
    });

    return res.json({
      success: true,
      order: razorpayOrder,
      amount: finalAmount,
      breakdown: {
        subtotal,
        tax,
        deliveryCharge,
        couponDiscount,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createRazorpayOrder error:", error);
    return res.json({ success: false, message: error.message });
  }
};


/* ------------------------------------------------
   VERIFY RAZORPAY PAYMENT
   POST /api/order/razorpay/verify
------------------------------------------------- */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.userId;
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
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const amountData = await calculateAmount({
      items,
      courier,
      coupon,
    });

    const order = await Order.create({
      userId,
      items,
      amount: amountData.total,
      address: addressId,
      courier: courier || null,
      coupon: coupon || null,
      paymentType: "Online",
      isPaid: true,
      status: "Order Placed",
    });

    if (coupon?.code) {
      await Coupon.findOneAndUpdate(
        { code: coupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    res.json({
      success: true,
      message: "Payment successful",
      order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ------------------------------------------------
   GET USER ORDERS
   GET /api/order/user?userId=
------------------------------------------------- */
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID required",
      });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ------------------------------------------------
   GET ALL ORDERS (ADMIN / SELLER)
------------------------------------------------- */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
