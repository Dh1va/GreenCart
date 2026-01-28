import Settings from "../models/Settings.js";
import { sendMail } from "../utils/mailer.js";
import { orderPlacedEmailTemplate } from "../utils/emailTemplates.js";

export const sendTestOrderEmail = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const settings = (await Settings.findOne().lean()) || {};

    await sendMail({
      to,
      subject: "Test Email - Order Placed",
      replyTo: settings.storeEmail || undefined,
      html: orderPlacedEmailTemplate({
        storeName: settings.storeName || "Store",
        orderId: "TEST123",
        total: 999,
        supportEmail: settings.storeEmail,
      }),
    });

    return res.json({ success: true, message: "Test email sent" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
