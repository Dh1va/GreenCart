import express from "express";
import { 
  createPhonePePayment, 
  validatePhonePePayment, 
  phonepeCallback 
} from "../controllers/gateways/phonepeController.js";
import { createRazorpayPayment, verifyRazorpayPayment } from "../controllers/gateways/razorpayController.js";
import authUser from "../middleware/authUser.js"; 
import { getEnabledGateway } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

// ✅ FIX: Add authUser to create/validate routes
paymentRouter.post("/phonepe/create", authUser, createPhonePePayment);
paymentRouter.post("/phonepe/validate", authUser, validatePhonePePayment);
paymentRouter.get("/phonepe/callback", phonepeCallback); 

// Razorpay
paymentRouter.post("/razorpay/create", authUser, createRazorpayPayment);
paymentRouter.post("/razorpay/verify", authUser, verifyRazorpayPayment);

paymentRouter.get("/enabled", getEnabledGateway);

export default paymentRouter;