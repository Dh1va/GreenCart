import express from 'express';
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js';
import multer from 'multer';
import { upload } from '../configs/multer.js';
import adminOnly from '../middleware/adminOnly.js';

const  productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), adminOnly, addProduct);
productRouter.get('/list', productList);
productRouter.get('/id', productById);
productRouter.post('/stock', adminOnly, changeStock);

export default productRouter;