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
paymentRouter.post("/phonepe/create", authUser, createPhonePePayment);
paymentRouter.post("/phonepe/validate", authUser, validatePhonePePayment);
paymentRouter.post("/phonepe/callback", phonepeCallback); // No auth, called by PhonePe

// --- Razorpay Routes ---
paymentRouter.post("/razorpay/create", authUser, createRazorpayPayment);
paymentRouter.post("/razorpay/verify", authUser, verifyRazorpayPayment);

// --- Settings Route (Used by Checkout.jsx) ---
import { getEnabledGateway } from "../controllers/paymentController.js";
paymentRouter.get("/enabled", getEnabledGateway);

export default paymentRouter;