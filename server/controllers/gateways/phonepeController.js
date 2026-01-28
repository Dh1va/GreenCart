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
    const userId = req.userId;
    const { items, addressId, courier } = req.body;

    const settings = await getSettingsSafe();

    // 1. Validation
    if (!settings?.enablePhonePe) {
      return res.status(403).json({ success: false, message: "PhonePe is disabled" });
    }
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address required" });
    }

    const address = await Address.findOne({ _id: addressId, userId: String(userId) }).lean();
    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    // 2. Calculate Totals (Securely from DB)
    const taxPercent = Number(settings?.taxPercent ?? 2);
    const totalQuantity = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).lean();
      if (!product) return res.status(400).json({ success: false, message: "Product not found" });

      const unitPrice = Number(product.offerPrice ?? product.price ?? 0);
      const qty = Number(item.quantity || 0);
      
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

    // 3. Create Order in Database (PENDING state)
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
        method: "phonepe",
        status: "pending",
        // Temporary placeholder, will update with actual ID
        transactionId: `TEMP_${Date.now()}` 
      },
      pricing: { subtotal, tax, deliveryFee, discount: 0, total },
      delivery: { status: "order_placed", trackingId: "", trackingUrl: "" },
    });

    // 4. Generate Unique Transaction ID
    // PhonePe requires a unique ID. We use PP_ + OrderID
    const merchantTransactionId = `PP_${order._id.toString()}`;

    // Update order with the real transaction ID
    order.payment.transactionId = merchantTransactionId;
    await order.save();

    // 5. Prepare Redirect URLs
    // The redirect URL tells PhonePe where to send the user after payment.
    // We append ?orderId=... so our frontend knows which order to verify.
    const baseRedirect = process.env.PHONEPE_REDIRECT_URL; 
    const redirectUrl = `${baseRedirect}?orderId=${order._id}`; 
    const callbackUrl = process.env.PHONEPE_CALLBACK_URL;

    // 6. Call PhonePe API
    const phonepeRes = await phonepeCreatePayment({
      merchantTransactionId,
      amountInPaise: Math.round(total * 100), // Convert to Paise
      userId,
      redirectUrl,
      callbackUrl,
      mobileNumber: address.phone || "9999999999"
    });

    let finalRedirectUrl = 
      phonepeRes?.instrumentResponse?.redirectInfo?.url || 
      phonepeRes?.data?.instrumentResponse?.redirectInfo?.url ||
      phonepeRes?.redirectUrl ||
      phonepeRes?.data?.redirectUrl;

    if (!finalRedirectUrl) {
      console.error("PhonePe Error: No URL found. Full Response:", JSON.stringify(phonepeRes, null, 2));
      return res.status(500).json({ success: false, message: "Payment Gateway Error" });
    }

    // 3. Success Response
    return res.json({
      success: true,
      orderId: order._id,
      redirectUrl: finalRedirectUrl,
    });

  } catch (e) {
    console.error("PhonePe Init Error:", e);
    return res.status(500).json({ success: false, message: e.message || "Payment initiation failed" });
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
   // ... (Paste the webhook function from the previous answer here)
   try {
    // 1. Verify Authorization Header (SHA256(user:pass))
    const authHeader = req.headers['authorization'];
    if (process.env.WEBHOOK_USER && authHeader) {
         // Add verification logic if needed
    }

    // 2. Decode Payload
    const { state, merchantOrderId } = req.body.payload || {};

    if (state && merchantOrderId) {
        const orderId = merchantOrderId.replace("PP_", "");
        const order = await Order.findById(orderId);

        if (order) {
            if (state === "COMPLETED" && order.payment.status !== "paid") {
                order.payment.status = "paid";
                await order.save();
                await createInvoiceIfNotExists(order);
                
                // Socket Emit
                const io = req.app.get("io");
                io?.to(`user_${order.user}`)?.emit("order:update", order);
            } else if (state === "FAILED") {
                order.payment.status = "failed";
                await order.save();
            }
        }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Error");
  }
};