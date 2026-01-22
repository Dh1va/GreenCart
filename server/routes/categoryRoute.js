import express from "express";
import { addCategory, listCategories, removeCategory, updateCategory } from "../controllers/categoryController.js";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";
import { upload } from "../configs/multer.js";

const categoryRouter = express.Router();

categoryRouter.post("/add", authUser, adminOnly, upload.single("image"), addCategory);
categoryRouter.post("/remove", authUser, adminOnly, removeCategory);
categoryRouter.get("/list", listCategories);
categoryRouter.post("/update", authUser, adminOnly, upload.single("image"), updateCategory);

export default categoryRouter;