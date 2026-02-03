import express from "express";
import { 
  createPhonePePayment, 
  validatePhonePePayment, 
  phonepeCallback 
} from "../controllers/gateways/phonepeController.js";
import { createRazorpayPayment, verifyRazorpayPayment } from "../controllers/gateways/razorpayController.js"; // Assuming you have this
import authUser from "../middleware/authUser.js"; // Your auth middleware

const paymentRouter = express.Router();

// --- PhonePe Routes ---
paymentRouter.post("/phonepe/create",  createPhonePePayment);
paymentRouter.post("/phonepe/validate",  validatePhonePePayment);
paymentRouter.post("/phonepe/callback", phonepeCallback); // No auth, called by PhonePe

// --- Razorpay Routes ---
paymentRouter.post("/razorpay/create",  createRazorpayPayment);
paymentRouter.post("/razorpay/verify",  verifyRazorpayPayment);

// --- Settings Route (Used by Checkout.jsx) ---
import { getEnabledGateway } from "../controllers/paymentController.js";
paymentRouter.get("/enabled", getEnabledGateway);

export default paymentRouter;