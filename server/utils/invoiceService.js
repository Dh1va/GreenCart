import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";
import { invoiceTemplate } from "./pdfTemplates.js";
import { generatePDF } from "./pdfGenerator.js";

export const createInvoiceIfNotExists = async (order) => {
  // 1️⃣ Prevent duplicates
  const existing = await Invoice.findOne({ order: order._id });
  if (existing) return existing;

  // 2️⃣ Fetch populated order (IMPORTANT)
  const fullOrder = await Order.findById(order._id)
    .populate("address")
    .populate("items.product", "name")
    .lean();

  if (!fullOrder) throw new Error("Order not found for invoice");

  // 3️⃣ Build data object (THIS WAS MISSING)
  const data = {
    ...fullOrder,
    orderId: fullOrder._id.toString().slice(-6).toUpperCase(),
    date: new Date(fullOrder.createdAt).toLocaleDateString("en-IN"),
  };

  // 4️⃣ Generate PDF
  const pdfUint8 = await generatePDF(invoiceTemplate, data);

  // 5️⃣ Convert Uint8Array → Buffer
  const pdfBuffer = Buffer.from(pdfUint8);

  // 6️⃣ Save invoice
  return await Invoice.create({
    order: fullOrder._id,
    invoiceNumber: `INV-${data.orderId}`,
    issuedAt: new Date(),
    pdfBuffer,
  });
};
