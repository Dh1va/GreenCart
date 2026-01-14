import Order from "../models/Order.js";
import Product from "../models/product.js";
import Coupon from "../models/Coupon.js";
import Address from "../models/Address.js";
import User from "../models/user.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { invoiceTemplate, labelTemplate } from "../utils/pdfTemplates.js";
import { generatePDF } from "../utils/pdfGenerator.js";
import { createInvoiceIfNotExists } from "../utils/invoiceService.js";

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

  return { subtotal, tax, courierPrice, couponDiscount, total };
};

/* ---------------- PLACE ORDER — COD ---------------- */
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, addressId, courier } = req.body;

    if (!items?.length) return res.status(400).json({ success: false, message: "Cart is empty" });
    if (!addressId) return res.status(400).json({ success: false, message: "Address required" });

    // ✅ FIX: Strict Address Validation (Matches userId as String)
    const address = await Address.findOne({
      _id: addressId,
      userId: String(userId) 
    });

    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ success: false, message: "Product not found" });

      subtotal += product.offerPrice * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.offerPrice,
      });
    }

    const tax = Math.floor(subtotal * 0.02);
    let deliveryFee = courier?.price || 0;

    if (courier?.chargePerItem === true) {
        deliveryFee = (courier.price * totalQuantity);
    }

    const total = subtotal + tax + deliveryFee;

    const order = await Order.create({
      user: userId,
      items: orderItems,
      address: address._id, 
      courier: {
        courierId: courier?._id || null, // Optional if you pass ID
        name: courier?.name || "Standard Delivery",
        price: courier?.price || 0,
        minDays: courier?.minDays || 0,
        maxDays: courier?.maxDays || 0
      },
      payment: { method: "cod", status: "pending" },
      pricing: { subtotal, tax, deliveryFee, total },
      delivery: { 
        status: "order_placed",
        trackingId: "",
        trackingUrl: ""
      },
    });

    await createInvoiceIfNotExists(order);


    const io = req.app.get("io");
    io.to("admins").emit("order:update", order);
    io.to(`user_${userId}`).emit("order:update", order);

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



/* ------------------------------------------------
   CREATE RAZORPAY ORDER
------------------------------------------------- */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, addressId, courier, coupon } = req.body;

    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      subtotal += product.offerPrice * item.quantity;
    }

    const tax = Math.floor(subtotal * 0.02);
    let deliveryFee = courier?.price || 0;

      if (courier?.chargePerItem === true) {
          deliveryFee = (courier.price * totalQuantity);
      }
    const discount = coupon?.discount || 0;
    const total = subtotal + tax + deliveryFee - discount;

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: total * 100,
      currency: "INR",
      notes: {
        userId: req.userId,
        addressId,
      },
    });

    res.json({
      success: true,
      order: razorpayOrder,
      amount: total,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ---------------- RAZORPAY VERIFICATION ---------------- */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, addressId, courier } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      subtotal += product.offerPrice * item.quantity;
      orderItems.push({ product: product._id, quantity: item.quantity, price: product.offerPrice });
    }

    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      address: addressId,
      courier: {
        courierId: courier?._id || null,
        name: courier?.name || "Standard Delivery",
        price: courier?.price || 0,
        minDays: courier?.minDays || 0,
        maxDays: courier?.maxDays || 0
      },
      payment: { method: "razorpay", status: "paid", transactionId: razorpay_payment_id },
      pricing: { subtotal, total: subtotal + Math.floor(subtotal * 0.02) + (courier?.price || 0) },
      delivery: { 
        status: "order_placed",
        trackingId: "",
        trackingUrl: ""
      },
    });

    await createInvoiceIfNotExists(order);


    const io = req.app.get("io");
    io.to("admins").emit("order:update", order);
    io.to(`user_${req.userId}`).emit("order:update", order);

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------- DOCUMENTS (INVOICE & LABEL) ---------------- */
export const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("address")
      .populate("items.product", "name") // Only fetch name for speed
      .lean(); // .lean() makes the query 5x faster by returning a plain JS object

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const data = {
      ...order,
      orderId: order._id.toString().slice(-6).toUpperCase(),
      date: new Date(order.createdAt).toLocaleDateString('en-IN'),
    };

    // Use your imported invoiceTemplate
    const pdfBuffer = await generatePDF(invoiceTemplate, data);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=invoice_${data.orderId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Invoice Gen Error:", error);
    res.status(500).send("Error generating invoice");
  }
};

export const getShippingLabel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("address").lean();

    const totalQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

    const data = {
      ...order,
      totalQty
    };

    // Use your imported labelTemplate with custom 4x6 dimensions
    const pdfBuffer = await generatePDF(labelTemplate, data, { 
        width: '4in', 
        height: '6in',
        printBackground: true 
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=label_${order._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).send("Error generating label");
  }
};

/* ---------------- ADMIN: SMART STATUS UPDATE ---------------- */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, trackingId, trackingUrl } = req.body;

    // 1. Create the update object
    const updateData = {
      "delivery.status": status
    };

    // 2. If status is "Shipped", handle Tracking & Timestamps
    if (status === "shipped") {
      updateData["delivery.shippedAt"] = new Date();
      if (trackingId) updateData["delivery.trackingId"] = trackingId;
      if (trackingUrl) updateData["delivery.trackingUrl"] = trackingUrl;
    }

    // 3. If status is "Delivered", set Timestamp
    if (status === "delivered") {
      updateData["delivery.deliveredAt"] = new Date();
      // Optional: Auto-mark payment as paid if it was COD
      // updateData["payment.status"] = "paid"; 
    }

    // 4. Perform Update
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true } // Return updated doc
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // 5. Emit Socket Event
    const io = req.app.get("io");
    io.to("admins").emit("order:update", order);
    io.to(`user_${order.user}`).emit("order:update", order);

    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderPayment = async (req, res) => {
  const { orderId, status } = req.body;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { "payment.status": status },
    { new: true }
  );

  const io = req.app.get("io");
  io.to("admins").emit("order:update", order);
  io.to(`user_${order.user}`).emit("order:update", order);

  res.json({ success: true });
};

//CREATE ADMIN ORDER  

export const createAdminOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod } = req.body;

    if (!userId || !items?.length) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    // 1️⃣ Create a dummy address record (REQUIRED)
    const adminAddress = await Address.create({
      userId: String(userId),
      firstName: "Admin",
      lastName: "Order",
      email: "admin@system.local",
      street: "Admin Created Order",
      city: "N/A",
      state: "N/A",
      zipCode: 0,
      country: "India",
      phone: "0000000000",
      label: "Other",
      isDefault: false,
    });

    // 2️⃣ Calculate pricing (server authority)
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ success: false, message: "Product not found" });
      }

      subtotal += product.offerPrice * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.offerPrice,
      });
    }

    const tax = Math.floor(subtotal * 0.02);
    const total = subtotal + tax;

    // 3️⃣ Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,

      address: adminAddress._id, // ✅ ObjectId (FIXED)

      pricing: {
        subtotal,
        tax,
        total,
      },

      payment: {
        method: (paymentMethod || "cod").toLowerCase(), // ✅ enum-safe
        status: "pending",
      },

      delivery: {
        status: "order_placed",
      },

      createdByAdmin: req.user.id,
    });

    await createInvoiceIfNotExists(order);

    const io = req.app.get("io");
   const populatedOrder = await Order.findById(order._id)
  .populate("address")
  .populate("items.product", "name");

io.to("admins").emit("order:update", populatedOrder);
    io.to(`user_${userId}`).emit("order:update", order);

    res.json({ success: true, order });
  } catch (err) {
    console.error("ADMIN ORDER ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



/* ------------------------------------------------
   GET ORDERS
------------------------------------------------- */
export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.userId })
    .populate("items.product")
    .populate("address")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("address")
    .populate("items.product", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
};
