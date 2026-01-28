import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "My Store" },
    storeEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" },

    storeAddress: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },

    currencySymbol: { type: String, default: "₹" },
    taxPercent: { type: Number, default: 2 },
    minimumOrderAmount: { type: Number, default: 0 },

    freeShippingThreshold: { type: Number, default: 999 },
    shippingTaxPercent: { type: Number, default: 0 },

    invoicePrefix: { type: String, default: "INV" },
    invoiceStartNumber: { type: Number, default: 1001 },
    gstNumber: { type: String, default: "" },
    invoiceTerms: { type: String, default: "" },
    returnPolicy: { type: String, default: "" },

    enableCOD: { type: Boolean, default: true },
    enableRazorpay: { type: Boolean, default: true },
    enablePhonePe: { type: Boolean, default: false },

    enableOtpLogin: { type: Boolean, default: true },
    enablePasswordLogin: { type: Boolean, default: false },

    autoInvoice: { type: Boolean, default: true },

    autoOrderNotification: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },

    cancelWindowHours: { type: Number, default: 24 },

    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
