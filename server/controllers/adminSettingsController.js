import Settings from "../models/Settings.js";

const getSingletonSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

export const getAdminSettings = async (req, res) => {
  try {
    const settings = await getSingletonSettings();
    return res.json({ success: true, settings });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const allowed = [
      "storeName",
      "storeEmail",
      "supportPhone",
      "storeAddress",
      "currencySymbol",
      "taxPercent",
      "minimumOrderAmount",
      "defaultOrderStatus",
      "enableCOD",
      "enableRazorpay",
      "enablePhonePe",
      "autoInvoice",
      "autoOrderNotification",
      "defaultCourierId",
      "freeShippingThreshold",
      "shippingTaxPercent",
      "invoicePrefix",
      "invoiceStartNumber",
      "gstNumber",
      "invoiceTerms",
      "returnPolicy",
      "enableCoupons",
      "allowCouponStacking",
      "maxDiscountPerOrder",
      "enableOtpLogin",
      "enablePasswordLogin",
      "sessionDays",
      "maintenanceMode",
      "cancelWindowHours",
    ];

    const payload = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }

    const settings = await getSingletonSettings();
    Object.assign(settings, payload);
    await settings.save();

    return res.json({ success: true, settings });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
