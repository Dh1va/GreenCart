// server/controllers/gateways/razorpayController.js
import Order from "../../models/Order.js";
import Product from "../../models/product.js";
import Address from "../../models/Address.js";
import Settings from "../../models/Settings.js";

import { createInvoiceIfNotExists } from "../../utils/invoiceService.js";
import { getRazorpayInstance, verifyRazorpaySignature } from "../../utils/razorpay.js";

const getSettingsSafe = async () => {
  try {
    const s = await Settings.findOne().lean();
    return s || {};
  } catch {
    return {};
  }
};

/* =====================================================
   CREATE RAZORPAY ORDER (FOR FRONTEND CHECKOUT)
===================================================== */
export const createRazorpayPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, addressId, courier } = req.body;

    const settings = await getSettingsSafe();

    // ✅ gateway enabled check
    if (!settings?.enableRazorpay) {
      return res.status(403).json({ success: false, message: "Razorpay is disabled" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address required" });
    }

    const address = await Address.findOne({ _id: addressId, userId: String(userId) }).lean();
    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    // secure totals from DB
    const taxPercent = Number(settings?.taxPercent ?? 2);
    const totalQuantity = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product).lean();
      if (!product) {
        return res.status(400).json({ success: false, message: "Product not found" });
      }

      const unitPrice = Number(product.offerPrice ?? product.price ?? 0);
      const qty = Number(item.quantity || 0);

      if (!unitPrice || unitPrice <= 0 || qty < 1) {
        return res.status(400).json({ success: false, message: "Invalid cart item" });
      }

      subtotal += unitPrice * qty;
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

    const razorpay = getRazorpayInstance();

    // create Razorpay order (gateway order, not DB order)
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      notes: {
        userId: String(userId),
        addressId: String(addressId),
      },
    });

    return res.json({
      success: true,
      gateway: "razorpay",
      key: process.env.RAZORPAY_KEY_ID,
      amount: total,
      order: rpOrder,
    });
  } catch (e) {
    console.error("RAZORPAY CREATE ERROR:", e);
    return res.status(500).json({ success: false, message: "Razorpay create failed" });
  }
};

/* =====================================================
   VERIFY RAZORPAY PAYMENT + CREATE ORDER IN DB
===================================================== */
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
    } = req.body;

    const settings = await getSettingsSafe();

    // ✅ gateway enabled check
    if (!settings?.paymentGateways?.razorpay) {
      return res.status(403).json({ success: false, message: "Razorpay is disabled" });
    }

    // signature check
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // address ownership check
    const address = await Address.findOne({ _id: addressId, userId: String(userId) }).lean();
    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    // secure totals from DB
    const taxPercent = Number(settings?.taxPercent ?? 2);
    const totalQuantity = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).lean();
      if (!product) {
        return res.status(400).json({ success: false, message: "Product not found" });
      }

      const unitPrice = Number(product.offerPrice ?? product.price ?? 0);
      const qty = Number(item.quantity || 0);

      if (!unitPrice || unitPrice <= 0 || qty < 1) {
        return res.status(400).json({ success: false, message: "Invalid cart item" });
      }

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

    // ✅ create DB order (paid)
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
        method: "razorpay",
        status: "paid",
        transactionId: razorpay_payment_id,
        gatewayOrderId: razorpay_order_id, // optional extra field if your schema allows
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

    // invoice safe
    if (settings?.autoInvoice) {
      try {
        await createInvoiceIfNotExists(order);
      } catch (e) {
        console.error("Invoice creation failed (ignored):", e.message);
      }
    }

    // socket emit optional
    try {
      const io = req.app.get("io");
      io?.to("admins")?.emit("order:update", order);
      io?.to(`user_${userId}`)?.emit("order:update", order);
    } catch {}

    return res.json({ success: true, order });
  } catch (e) {
    console.error("RAZORPAY VERIFY ERROR:", e);
    return res.status(500).json({ success: false, message: "Razorpay verify failed" });
  }
};
