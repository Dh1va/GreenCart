import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD, 
  getOrderInvoice, getUserOrderDetails, 
  cancelUserOrder} from '../controllers/orderController.js';
import authUser from '../middleware/authUser.js';


const orderRouter = express.Router();

orderRouter.post('/cod', placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get("/invoice/:orderId", authUser, getOrderInvoice);
orderRouter.get("/details/:orderId", authUser, getUserOrderDetails);
orderRouter.post("/cancel", authUser, cancelUserOrder);




export default orderRouter;


