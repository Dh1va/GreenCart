import express from "express";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  addCategoryGroup,
  listCategoryGroups,
  removeCategoryGroup,
  updateCategoryGroup
} from "../controllers/categoryGroupController.js";

const categoryGroupRouter = express.Router();

categoryGroupRouter.post("/add", authUser, adminOnly, addCategoryGroup);
categoryGroupRouter.get("/list", listCategoryGroups);
categoryGroupRouter.post("/remove", authUser, adminOnly, removeCategoryGroup);
categoryGroupRouter.post("/update", authUser, adminOnly, updateCategoryGroup);
export default categoryGroupRouter;
