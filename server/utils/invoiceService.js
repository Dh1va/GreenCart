import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";
import Settings from "../models/Settings.js";
import { invoiceTemplate } from "./pdfTemplates.js";
import { generatePDF } from "./pdfGenerator.js";

export const createInvoiceIfNotExists = async (orderDoc) => {
  const orderId = orderDoc?._id || orderDoc;

  const existing = await Invoice.findOne({ order: orderId });
  if (existing) return existing;

  const order = await Order.findById(orderId)
    .populate("address")
    .populate("items.product", "name")
    .lean();

  if (!order) throw new Error("Order not found for invoice generation");

  const settings = await Settings.findOne().lean();

  const prefix = settings?.invoicePrefix || "INV";
  const start = Number(settings?.invoiceStartNumber || 1001);

  const count = await Invoice.countDocuments();
  const invoiceNumber = `${prefix}-${start + count}`;

  const data = {
    ...order,
    storeName: settings?.storeName || "My Store",
    storeEmail: settings?.storeEmail || "",
    supportPhone: settings?.supportPhone || "",
    gstNumber: settings?.gstNumber || "",
    invoiceTerms: settings?.invoiceTerms || "",
    returnPolicy: settings?.returnPolicy || "",
    currencySymbol: settings?.currencySymbol || "₹",

    orderId: order._id.toString().slice(-6).toUpperCase(),
    invoiceNumber,
    date: new Date(order.createdAt).toLocaleDateString("en-IN"),
  };

  // generatePDF returns Uint8Array in your case
  const pdfRaw = await generatePDF(invoiceTemplate, data);

  // ✅ FIX: Always convert to Buffer before saving in Mongo
  const pdfBuffer = Buffer.isBuffer(pdfRaw) ? pdfRaw : Buffer.from(pdfRaw);

  const invoice = await Invoice.create({
    order: order._id,
    invoiceNumber,
    pdfBuffer,
  });

  return invoice;
};
