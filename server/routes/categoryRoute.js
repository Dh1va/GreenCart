import express from "express";
import { addCategory, listCategories, removeCategory } from "../controllers/categoryController.js";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";

const categoryRouter = express.Router();

categoryRouter.post("/add", authUser, adminOnly, addCategory);
categoryRouter.post("/remove", authUser, adminOnly, removeCategory);
categoryRouter.get("/list", listCategories);

export default categoryRouter;