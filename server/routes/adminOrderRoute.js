import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  updateOrderPayment,
} from "../controllers/orderController.js";

import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";

const adminOrderRouter = express.Router();

/* ---------------- ADMIN ORDER ROUTES ---------------- */

// Get all orders
adminOrderRouter.get("/orders", authUser, adminOnly, getAllOrders);

// Update delivery status
adminOrderRouter.patch("/order/status", authUser, adminOnly, updateOrderStatus);

// Update tracking ID
adminOrderRouter.patch("/order/shipping", authUser, adminOnly, updateOrderTracking);

// Update payment status
adminOrderRouter.patch("/order/payment", authUser, adminOnly, updateOrderPayment);

export default adminOrderRouter;
