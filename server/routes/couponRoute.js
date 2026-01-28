import express from "express";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";

const couponRouter = express.Router();

couponRouter.post("/create", authUser, adminOnly, createCoupon);
couponRouter.get("/list", authUser, adminOnly, getAllCoupons);
couponRouter.put("/:id", authUser, adminOnly, updateCoupon);
couponRouter.delete("/:id", authUser, adminOnly, deleteCoupon);
couponRouter.post("/validate", authUser, validateCoupon);

export default couponRouter;
