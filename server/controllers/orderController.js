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

import Settings from "../models/Settings.js";
import { sendMail } from "../utils/mailer.js";
import { orderPlacedEmailTemplate } from "../utils/emailTemplates.js";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =====================================================
   SETTINGS SAFE HELPER
===================================================== */
const getSettingsSafe = async () => {
  try {
    const s = await Settings.findOne().lean();
    return s || {};
  } catch {
    return {};
  }
};

/* =====================================================
   EMAIL HELPER (ORDER PLACED)
===================================================== */
const sendOrderPlacedEmailIfEnabled = async ({ userId, order }) => {
  try {
    const settings = await getSettingsSafe();
    if (!settings?.autoOrderNotification?.email) return;

    const user = await User.findById(userId).lean();
    if (!user?.email) return;

    await sendMail({
      to: user.email,
      subject: `Order Placed - ${order._id.toString().slice(-6).toUpperCase()}`,
      replyTo: settings.storeEmail || undefined,
      html: orderPlacedEmailTemplate({
        storeName: settings.storeName || "Store",
        orderId: order._id.toString().slice(-6).toUpperCase(),
        total: order?.pricing?.total || 0,
        supportEmail: settings.storeEmail || "",
      }),
    });
  } catch (e) {
    console.error("Order Email Error:", e.message);
  }
};

/* =====================================================
   USER: GET ORDER DETAILS
===================================================== */
export const getUserOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("address")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ SECURITY: Only order owner can view
    if (String(order.user) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   USER: CANCEL ORDER (USES SETTINGS cancelWindowHours)
===================================================== */
export const cancelUserOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    const settings = await getSettingsSafe();
    const CANCEL_WINDOW_HOURS = Number(settings?.cancelWindowHours ?? 24);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Security
    if (String(order.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    // Can cancel only before shipped
    if (order.delivery.status !== "order_placed" && order.delivery.status !== "processing") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage (Already shipped or delivered).",
      });
    }

    // Time check
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const diffInHours = Math.abs(currentDate - orderDate) / 36e5;

    if (diffInHours > CANCEL_WINDOW_HOURS) {
      return res.status(400).json({
        success: false,
        message: `Cancellation window closed. You can only cancel within ${CANCEL_WINDOW_HOURS} hours.`,
      });
    }

    order.delivery.status = "cancelled";
    await order.save();

    const io = req.app.get("io");
    io.to("admins").emit("order:update", order);
    io.to(`user_${userId}`).emit("order:update", order);

    return res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Cancel Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   USER: PLACE ORDER — COD
===================================================== */
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, addressId, courier } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address required" });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId: String(userId),
    });

    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    const settings = await getSettingsSafe();
    const taxPercent = Number(settings?.taxPercent ?? 2);

    const totalQuantity = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item?.product || !item?.quantity) {
        return res.status(400).json({ success: false, message: "Invalid cart item" });
      }

      const product = await Product.findById(item.product).lean();

      if (!product) {
        return res.status(400).json({ success: false, message: "Product not found" });
      }

      // ✅ SAFE PRICE PICK (offerPrice OR price)
      const unitPrice = Number(product.offerPrice ?? product.price ?? 0);

      if (!unitPrice || unitPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid product price for: ${product.name || product._id}`,
        });
      }

      const qty = Number(item.quantity);

      subtotal += unitPrice * qty;

      orderItems.push({
        product: product._id,
        quantity: qty,
        price: unitPrice,
      });
    }

    const tax = Math.floor(subtotal * (taxPercent / 100));

    let deliveryFee = Number(courier?.price || 0);
    if (courier?.chargePerItem === true) {
      deliveryFee = Number(courier?.price || 0) * totalQuantity;
    }

    const total = subtotal + tax + deliveryFee;

    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ success: false, message: "Invalid total amount" });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      address: address._id,

      courier: {
        courierId: courier?._id || null,
        name: courier?.name || "Standard Delivery",
        price: deliveryFee,
        minDays: courier?.minDays || 0,
        maxDays: courier?.maxDays || 0,
      },

      payment: {
        method: "cod", // ✅ must match enum
        status: "pending",
      },

      pricing: {
        subtotal,
        tax,
        deliveryFee,
        discount: 0,
        total,
      },

      delivery: {
        status: "order_placed",
        trackingId: "",
        trackingUrl: "",
      },
    });

   if (settings?.autoInvoice) {
  try {
    await createInvoiceIfNotExists(order);
  } catch (e) {
    console.error("Invoice creation failed (ignored):", e.message);
  }
}

    await sendOrderPlacedEmailIfEnabled({ userId, order });

    const io = req.app.get("io");
    io?.to("admins")?.emit("order:update", order);
    io?.to(`user_${userId}`)?.emit("order:update", order);

    return res.json({ success: true, order });
  } catch (err) {
    console.error("COD ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error placing COD order",
      error: err.message,
    });
  }
};

/* =====================================================
   CREATE RAZORPAY ORDER
===================================================== */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, addressId, courier, coupon } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const settings = await getSettingsSafe();
    const taxPercent = Number(settings?.taxPercent ?? 2);

    const totalQuantity = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ success: false, message: "Product not found" });
      }
      subtotal += product.offerPrice * item.quantity;
    }

    const tax = Math.floor(subtotal * (taxPercent / 100));

    let deliveryFee = Number(courier?.price || 0);
    if (courier?.chargePerItem === true) {
      deliveryFee = Number(courier?.price || 0) * totalQuantity;
    }

    const discount = Number(coupon?.discount || 0);
    const total = subtotal + tax + deliveryFee - discount;

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: total * 100,
      currency: "INR",
      notes: {
        userId: req.userId,
        addressId,
      },
    });

    return res.json({
      success: true,
      order: razorpayOrder,
      amount: total,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   VERIFY RAZORPAY PAYMENT
===================================================== */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, addressId, courier } =
      req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const settings = await getSettingsSafe();
    const taxPercent = Number(settings?.taxPercent ?? 2);

    const totalQuantity = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

    const orderItems = [];
    let subtotal = 0;

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

    const tax = Math.floor(subtotal * (taxPercent / 100));

    let deliveryFee = Number(courier?.price || 0);
    if (courier?.chargePerItem === true) {
      deliveryFee = Number(courier?.price || 0) * totalQuantity;
    }

    const total = subtotal + tax + deliveryFee;

    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      address: addressId,
      courier: {
        courierId: courier?._id || null,
        name: courier?.name || "Standard Delivery",
        price: deliveryFee,
        minDays: courier?.minDays || 0,
        maxDays: courier?.maxDays || 0,
      },
      payment: {
        method: "razorpay",
        status: "paid",
        transactionId: razorpay_payment_id,
      },
      pricing: { subtotal, tax, deliveryFee, total },
      delivery: { status: "order_placed", trackingId: "", trackingUrl: "" },
    });

    // Auto invoice
    if (settings?.autoInvoice) {
      await createInvoiceIfNotExists(order);
    }

    // Auto email
    await sendOrderPlacedEmailIfEnabled({ userId: req.userId, order });

    const io = req.app.get("io");
    io.to("admins").emit("order:update", order);
    io.to(`user_${req.userId}`).emit("order:update", order);

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   USER INVOICE VIEW (INTEGRATE SETTINGS INTO TEMPLATE)
===================================================== */
export const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("address")
      .populate("items.product", "name")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Owner check
    if (String(order.user) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const settings = await getSettingsSafe();

    const data = {
      ...order,
      orderId: order._id.toString().slice(-6).toUpperCase(),
      date: new Date(order.createdAt).toLocaleDateString("en-IN"),

      // Settings injected into invoice template
      storeName: settings?.storeName || "Store",
      storeEmail: settings?.storeEmail || "",
      supportPhone: settings?.supportPhone || "",
      currencySymbol: settings?.currencySymbol || "₹",
      gstNumber: settings?.gstNumber || "",
      invoiceTerms: settings?.invoiceTerms || "",
      returnPolicy: settings?.returnPolicy || "",
    };

    const pdfRaw = await generatePDF(invoiceTemplate, data);
const pdfBuffer = Buffer.isBuffer(pdfRaw) ? pdfRaw : Buffer.from(pdfRaw);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=invoice_${data.orderId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Invoice Gen Error:", error);
    return res.status(500).send("Error generating invoice");
  }
};

/* =====================================================
   ADMIN INVOICE VIEW
===================================================== */
export const getOrderInvoiceAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("address")
      .populate("items.product", "name")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const settings = await getSettingsSafe();

    const data = {
      ...order,
      orderId: order._id.toString().slice(-6).toUpperCase(),
      date: new Date(order.createdAt).toLocaleDateString("en-IN"),

      storeName: settings?.storeName || "Store",
      storeEmail: settings?.storeEmail || "",
      supportPhone: settings?.supportPhone || "",
      currencySymbol: settings?.currencySymbol || "₹",
      gstNumber: settings?.gstNumber || "",
      invoiceTerms: settings?.invoiceTerms || "",
      returnPolicy: settings?.returnPolicy || "",
    };

    const pdfRaw = await generatePDF(invoiceTemplate, data);
const pdfBuffer = Buffer.isBuffer(pdfRaw) ? pdfRaw : Buffer.from(pdfRaw);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=invoice_${data.orderId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Invoice Gen Error:", error);
    return res.status(500).send("Error generating invoice");
  }
};

/* =====================================================
   SHIPPING LABEL
===================================================== */
export const getShippingLabel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("address").lean();

    if (!order) return res.status(404).send("Order not found");

    const totalQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

    const data = {
      ...order,
      totalQty,
    };

    const pdfBuffer = await generatePDF(labelTemplate, data, {
      width: "4in",
      height: "6in",
      printBackground: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=label_${order._id}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).send("Error generating label");
  }
};

/* =====================================================
   ADMIN: UPDATE ORDER STATUS
===================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, trackingId, trackingUrl } = req.body;

    const updateData = { "delivery.status": status };

    if (status === "shipped") {
      updateData["delivery.shippedAt"] = new Date();
      if (trackingId) updateData["delivery.trackingId"] = trackingId;
      if (trackingUrl) updateData["delivery.trackingUrl"] = trackingUrl;
    }

    if (status === "delivered") {
      updateData["delivery.deliveredAt"] = new Date();
    }

    const order = await Order.findByIdAndUpdate(orderId, { $set: updateData }, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const io = req.app.get("io");
    io.to("admins").emit("order:update", order);
    io.to(`user_${order.user}`).emit("order:update", order);

    return res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Status Update Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   ADMIN: UPDATE PAYMENT STATUS
===================================================== */
export const updateOrderPayment = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, { "payment.status": status }, { new: true });

    const io = req.app.get("io");
    io.to("admins").emit("order:update", order);
    io.to(`user_${order.user}`).emit("order:update", order);

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/* =====================================================
   ADMIN: CREATE ORDER
===================================================== */
export const createAdminOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod, courier } = req.body;

    if (!userId || !items?.length) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

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

    const settings = await getSettingsSafe();
    const taxPercent = Number(settings?.taxPercent ?? 2);

    const totalQuantity = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

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

    const tax = Math.floor(subtotal * (taxPercent / 100));

    let deliveryFee = Number(courier?.price || 0);
    if (courier?.chargePerItem === true) {
      deliveryFee = Number(courier?.price || 0) * totalQuantity;
    }

    const total = subtotal + tax + deliveryFee;

    const order = await Order.create({
      user: userId,
      items: orderItems,
      address: adminAddress._id,

      courier: {
        courierId: courier?._id || null,
        name: courier?.name || "Standard",
        price: deliveryFee,
        minDays: courier?.minDays || 0,
        maxDays: courier?.maxDays || 0,
      },

      pricing: { subtotal, tax, deliveryFee, total },

      payment: {
        method: (paymentMethod || "cod").toLowerCase(),
        status: "pending",
      },

      delivery: { status: "order_placed" },

      // Your auth middleware sets req.userId
      createdByAdmin: req.userId,
    });

    if (settings?.autoInvoice) {
      await createInvoiceIfNotExists(order);
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("address")
      .populate("items.product", "name");

    const io = req.app.get("io");
    io.to("admins").emit("order:update", populatedOrder);
    io.to(`user_${userId}`).emit("order:update", populatedOrder);

    return res.json({ success: true, order: populatedOrder });
  } catch (err) {
    console.error("ADMIN ORDER ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   ADMIN: GET ORDER DETAILS
===================================================== */
export const getAdminOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("address")
      .populate("user", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET ORDERS
===================================================== */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId,
      $or: [
        { "payment.status": "paid" },       // Show Paid Orders
        { "payment.method": "cod" }         // Show COD Orders (even if pending)
      ]
    })
    .populate("items.product")
    .populate("address")
    .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, orders: [] });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { "payment.status": "paid" },      
        { "payment.status": "failed" },     
        { "payment.method": "cod" }         
      ]
     
    })
    .populate("address")
    .populate("items.product", "name")
    .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Admin Order Fetch Error:", error);
    return res.json({ success: false, message: error.message });
  }
};