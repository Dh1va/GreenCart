// server/controllers/paymentController.js
import Settings from "../models/Settings.js";

export const getEnabledGateway = async (req, res) => {
  try {
    const settings = (await Settings.findOne().lean()) || {};

    const phonepe = !!settings?.enablePhonePe;
    const razorpay = !!settings?.enableRazorpay;
    const cod = !!settings?.enableCOD;

    let enabledGateway = null;
    if (phonepe) enabledGateway = "phonepe";
    else if (razorpay) enabledGateway = "razorpay";

    return res.json({
      success: true,
      enabledGateway,
      paymentGateways: { phonepe, razorpay },
      codEnabled: cod,
      taxPercent: settings?.taxPercent ?? 0,
      currencySymbol: settings?.currencySymbol ?? "₹",
      maintenanceMode: settings?.maintenanceMode ?? false,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};