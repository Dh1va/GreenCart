// server/controllers/publicSettingsController.js
import Settings from "../models/Settings.js";

export const getPublicSettings = async (req, res) => {
  try {
    const settings = (await Settings.findOne().lean()) || {};

    return res.json({
      success: true,
      settings: {
        taxPercent: settings?.taxPercent ?? 0,
        currencySymbol: settings?.currencySymbol ?? "₹",
        enableCOD: settings?.enableCOD ?? true,
        enableRazorpay: settings?.enableRazorpay ?? false,
        enablePhonePe: settings?.enablePhonePe ?? false,
        enableOtpLogin: settings?.enableOtpLogin ?? true,
        enablePasswordLogin: settings?.enablePasswordLogin ?? false,
        maintenanceMode: settings?.maintenanceMode ?? false,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
