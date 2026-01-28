import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
  getOrderInvoiceAdmin,
  getShippingLabel,
  createAdminOrder,
  getAdminOrderDetails,
} from "../controllers/orderController.js";

import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

/* ADMIN ORDERS */
router.get("/orders", authUser, adminOnly, getAllOrders);
router.get("/order/:orderId", authUser, adminOnly, getAdminOrderDetails);
router.post("/create", authUser, adminOnly, createAdminOrder);
router.patch("/order/status", authUser, adminOnly, updateOrderStatus);

router.patch("/order/payment", authUser, adminOnly, updateOrderPayment);

router.get("/order/invoice/:orderId", authUser, adminOnly, getOrderInvoiceAdmin);
router.get("/order/label/:orderId", authUser, adminOnly, getShippingLabel);

export default router;
