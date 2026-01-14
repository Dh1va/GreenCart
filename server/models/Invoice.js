import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    unique: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  pdfBuffer: {
    type: Buffer, // store PDF snapshot
    required: true,
  },
});

export default mongoose.model("Invoice", invoiceSchema);
