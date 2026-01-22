import express from "express";
import {
  addProduct,
  
  assignCategory,
  
  productById,
  productList,
  toggleCategory,
  updateProduct,
} from "../controllers/productController.js";

import { upload } from "../configs/multer.js";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";

const productRouter = express.Router();

/* =====================================================
   ADMIN ONLY ROUTES
   ===================================================== */

// ➕ Add Product (ADMIN)
productRouter.post(
  "/add",
  authUser,
  adminOnly,
  upload.array("images"),
  addProduct
);

// ✏️ Update Product (ADMIN)
productRouter.post(
  "/update",
  authUser,
  adminOnly,
  upload.array("images"),
  updateProduct
);

productRouter.patch('/assign-category',authUser, adminOnly, assignCategory);


productRouter.post("/toggle-category", authUser, adminOnly, toggleCategory);


/* =====================================================
   PUBLIC / AUTH ROUTES
   ===================================================== */

// 📦 List Products (PUBLIC)
productRouter.get("/list", productList);

// 🔍 Single Product (PUBLIC)
productRouter.post("/single", productById);

export default productRouter;
