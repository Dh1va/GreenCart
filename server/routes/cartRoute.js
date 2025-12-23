import express from "express";
import authUser from "../middleware/authUser.js";
import User from "../models/user.js";
import { updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/update", authUser, updateCart);

cartRouter.post("/mark-cart-merged", authUser, async (req, res) => {
  await User.findByIdAndUpdate(req.userId, {
    hasMergedGuestCart: true,
  });
  res.json({ success: true });
});

export default cartRouter;
