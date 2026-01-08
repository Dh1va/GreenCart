const invoiceSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "order" },
  invoiceNumber: String,
  issuedAt: Date,
  pdfUrl: String,
});
