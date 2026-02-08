import express from 'express';
import { 
  getAllOrders, 
  getUserOrders, 
  placeOrderCOD, 
  getOrderInvoice, 
  getUserOrderDetails, 
  cancelUserOrder, 
  getPublicOrderDetails, 
  downloadPublicInvoice 
} from '../controllers/orderController.js';
import authUser from '../middleware/authUser.js';

const orderRouter = express.Router();

// ✅ FIX: Add authUser middleware here so req.userId is set
orderRouter.post('/cod', authUser, placeOrderCOD);

// Other routes
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get("/invoice/:orderId", authUser, getOrderInvoice);
orderRouter.get("/details/:orderId", authUser, getUserOrderDetails);
orderRouter.post("/cancel", authUser, cancelUserOrder);
orderRouter.get("/public/:orderId", getPublicOrderDetails);
orderRouter.get("/public/invoice/:orderId", downloadPublicInvoice);

export default orderRouter;