import Order from "../models/Order.js";
import Product from "../models/product.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// place order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body;

    if (!items || items.length === 0) {
      return res.json({ success: false, message: "No items in order" });
    }

    if (!address) {
      return res.json({ success: false, message: "Address required" });
    }

    // ✅ Calculate amount from DB
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      amount += product.offerPrice * item.quantity;
    }

    // ✅ Add tax (2%)
    amount += Math.floor(amount * 0.02);

    console.log("Creating order with:", {
      userId,
      items,
      amount,
      address,
    })

    const order = await Order.create({
      userId,
      items,
      amount,               // ✅ REQUIRED
      address,
      paymentType: "COD",   // ✅ MATCH SCHEMA
      isPaid: false,        // ✅ REQUIRED
      status: "Order Placed",
    });

    return res.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Order error:", error);
    return res.json({ success: false, message: error.message });
  }
  
};

// POST /api/order/razorpay/order
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id; // from authUser middleware
    const { items, addressId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    if (!items || items.length === 0 || !addressId) {
      return res.json({
        success: false,
        message: "Items and address are required",
      });
    }

    // Calculate amount from DB (same logic as COD)
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      amount += product.offerPrice * item.quantity;
    }

    const tax = Math.floor(amount * 0.02);
    const totalAmount = amount + tax; // in rupees

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmount * 100, // convert to paise
      currency: "INR",
      notes: {
        userId,
        addressId,
      },
    });

    return res.json({
      success: true,
      order: razorpayOrder,
      amount: totalAmount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createRazorpayOrder error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// POST /api/order/razorpay/verify
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      addressId,
    } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    // 1. Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 2. Recalculate amount (same as before)
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      amount += product.offerPrice * item.quantity;
    }
    amount += Math.floor(amount * 0.02);

    // 3. Create order in DB
    const order = await Order.create({
      userId,
      items,
      amount,
      address: addressId,
      paymentType: "Online",
      isPaid: true,
      status: "Order Placed",
    });

    return res.json({
      success: true,
      message: "Payment successful and order created",
      order,
    });
  } catch (error) {
    console.error("verifyRazorpayPayment error:", error);
    return res.json({ success: false, message: error.message });
  }
};



//get orders by user ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    // ✅ read userId from query, NOT body
     console.log("📦 [getUserOrders] HIT", {
      method: req.method,
      query: req.query,
      body: req.body,
    });
    const { userId } = req.query;

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required",
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


//get all orders : /api/order/seller

export const getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find({
        $or: [{paymentType:'COD'}, {isPaid:true}]
    }).populate('items.product address').sort({createdAt: -1});
    res.json({success: true, orders}); 
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}