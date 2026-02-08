import Order from "../../models/Order.js";
import Product from "../../models/product.js";
import Address from "../../models/Address.js";
import Settings from "../../models/Settings.js";
import { phonepeCreatePayment, phonepeCheckStatus } from "../../utils/phonepe.js";
import { createInvoiceIfNotExists } from "../../utils/invoiceService.js";

// Helper: Get Settings
const getSettingsSafe = async () => {
  try {
    const s = await Settings.findOne().lean();
    return s || {};
  } catch {
    return {};
  }
};

/* =====================================================
   1. INITIATE PAYMENT
===================================================== */
export const createPhonePePayment = async (req, res) => {
 try {
    const userId = req.userId; // Now correctly set
    const { items, addressId, guestAddress, courier } = req.body;

    const settings = await getSettingsSafe();
    if (!settings?.enablePhonePe) return res.status(403).json({ success: false, message: "PhonePe is disabled" });

    let finalAddress;

    if (userId) {
      // 🟢 LOGGED IN
      if (!addressId) return res.status(400).json({ success: false, message: "Address ID required" });
      finalAddress = await Address.findOne({ _id: addressId, userId: String(userId) }).lean();
    } else {
      // 🟡 GUEST
      if (!guestAddress) return res.status(400).json({ success: false, message: "Shipping details required" });

      // 🔥 FIX: Sanitize input
      const { _id, ...cleanAddress } = guestAddress;

      finalAddress = await Address.create({
        ...cleanAddress,
        userId: null,
        isGuest: true,
      });
    }

    if (!finalAddress) return res.status(400).json({ success: false, message: "Invalid address" });

    // --- PRICING LOGIC ---
    const taxPercent = Number(settings?.taxPercent ?? 2);
    const totalQuantity = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).lean();
      if (!product) continue;
      const unitPrice = Number(product.offerPrice ?? product.price ?? 0);
      subtotal += unitPrice * Number(item.quantity);
      orderItems.push({ product: product._id, quantity: item.quantity, price: unitPrice });
    }

    const tax = Math.floor(subtotal * (taxPercent / 100));
    let deliveryFee = Number(courier?.price || 0);
    if (courier?.chargePerItem) deliveryFee *= totalQuantity;

    const total = subtotal + tax + deliveryFee;
    const merchantTransactionId = `PP_${Date.now()}`;

    // --- CREATE PENDING ORDER ---
    const order = await Order.create({
      user: userId || null,
      isGuest: !userId,
      items: orderItems,
      address: finalAddress._id,
      courier: {
        courierId: courier?._id || null,
        name: courier?.name || "Standard",
        price: deliveryFee,
      },
      payment: { method: "phonepe", status: "pending", transactionId: merchantTransactionId },
      pricing: { subtotal, tax, deliveryFee, total },
      delivery: { status: "order_placed" },
    });

    // --- CALL PHONEPE UTILITY ---
    const redirectUrl = `${process.env.PHONEPE_REDIRECT_URL}?orderId=${order._id}`;
    
    const phonepeRes = await phonepeCreatePayment({
      merchantTransactionId,
      amountInPaise: Math.round(total * 100),
      userId: userId || "GUEST_USER",
      redirectUrl,
      callbackUrl: process.env.PHONEPE_CALLBACK_URL,
      mobileNumber: finalAddress.phone || "9999999999"
    });

    // Handle different response structures from utility
    const finalUrl = phonepeRes?.data?.instrumentResponse?.redirectInfo?.url || phonepeRes?.redirectUrl;

    if (!finalUrl) throw new Error("Gateway failed to provide redirect URL");

    return res.json({ success: true, redirectUrl: finalUrl });

  } catch (e) {
    console.error("PHONEPE_INIT_ERROR:", e);
    return res.status(500).json({ success: false, message: e.message || "Payment Failed" });
  }
};

/* =====================================================
   2. VALIDATE PAYMENT (Remains the same as previous)
===================================================== */
export const validatePhonePePayment = async (req, res) => {
   // ... (Paste the validation function from the previous answer here)
   // If you need it again, I can paste it below.
   try {
    const { orderId } = req.body; // Frontend sends DB Order ID

    if (!orderId) return res.status(400).json({ success: false, message: "Order ID missing" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // If already paid, return success immediately
    if (order.payment.status === "paid") {
      return res.json({ success: true, message: "Payment already verified" });
    }

    // Call PhonePe Status API
    const merchantTransactionId = order.payment.transactionId || `PP_${orderId}`;
    
    const statusData = await phonepeCheckStatus({ merchantTransactionId });

    if (statusData?.state === "COMPLETED") {
      // SUCCESS
      order.payment.status = "paid";
      await order.save();
      
      const settings = await getSettingsSafe();
      if (settings?.autoInvoice) await createInvoiceIfNotExists(order);

      return res.json({ success: true, message: "Payment Successful" });

    } else if (statusData?.state === "FAILED") {
      // FAILED
      order.payment.status = "failed";
      await order.save();
      return res.json({ success: false, message: "Payment Failed" });

    } else {
      // PENDING
      return res.json({ success: false, message: "Payment is still processing. Please wait." });
    }

  } catch (error) {
    console.error("Validation Error:", error);
    return res.status(500).json({ success: false, message: "Validation Failed" });
  }
};

/* =====================================================
   3. WEBHOOK (Remains the same)
===================================================== */
export const phonepeCallback = async (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || "http://3.80.71.191";

    // 1. HANDLE BROWSER REDIRECT (GET)
    if (req.method === 'GET') {
      const { code, merchantOrderId, orderId } = req.query;
      const targetOrderId = orderId || (merchantOrderId ? merchantOrderId.replace("PP_", "") : "");
      
      // Redirect to React Frontend
      return res.redirect(`${clientUrl}/payment/phonepe?orderId=${targetOrderId}`);
    }

    // 2. HANDLE WEBHOOK (POST)
    if (req.method === 'POST') {
        const { response } = req.body;
        if (!response) return res.status(200).send("OK");

        const decodedBuffer = Buffer.from(response, 'base64');
        const decodedBody = JSON.parse(decodedBuffer.toString('utf-8'));
        const { state, merchantTransactionId, code } = decodedBody.data || {};

        if (merchantTransactionId) {
             const order = await Order.findOne({ 'payment.transactionId': merchantTransactionId });
             if (order) {
                 if (code === "PAYMENT_SUCCESS" && state === "COMPLETED" && order.payment.status !== "paid") {
                     order.payment.status = "paid";
                     await order.save();
                     await createInvoiceIfNotExists(order);
                 } else if (code === "PAYMENT_ERROR" || state === "FAILED") {
                     order.payment.status = "failed";
                     await order.save();
                 }
             }
        }
        return res.status(200).send("OK");
    }

  } catch (error) {
    console.error("Callback Error:", error);
    if (req.method === 'GET') {
        return res.redirect(process.env.CLIENT_URL || "/");
    }
    res.status(500).json({ error: "Internal Error" });
  }
}
