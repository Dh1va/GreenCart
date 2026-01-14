import express from "express";
import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";

const invoiceRouter = express.Router();

/* LIST INVOICES */
invoiceRouter.get("/", authUser, adminOnly, async (req, res) => {
  const invoices = await Invoice.find()
    .populate({
      path: "order",
      populate: { path: "address items.product" },
    })
    .sort({ issuedAt: -1 });

  res.json({ success: true, invoices });
});

/* VIEW PDF */
invoiceRouter.get("/:id/pdf", authUser, adminOnly, async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).send("Invoice not found");

  res.setHeader("Content-Type", "application/pdf");
  res.send(invoice.pdfBuffer);
});

export default invoiceRouter;
