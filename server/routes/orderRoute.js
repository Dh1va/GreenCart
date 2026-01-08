import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD,  createRazorpayOrder,
  verifyRazorpayPayment, } from '../controllers/orderController.js';
import authUser from '../middleware/authUser.js';


const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);


//  Razorpay routes
orderRouter.post('/razorpay/order', authUser, createRazorpayOrder);
orderRouter.post('/razorpay/verify', authUser, verifyRazorpayPayment);

export default orderRouter;


