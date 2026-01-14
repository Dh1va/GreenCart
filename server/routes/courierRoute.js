import express from "express";
import { getActiveCouriers, addCourier, deleteCourier, getAllCouriers, updateCourier } from "../controllers/courierController.js";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";

const courierRouter = express.Router();

courierRouter.get("/active", getActiveCouriers); // Public (for checkout)
courierRouter.get("/list", authUser, adminOnly, getAllCouriers);      // Admin (view all)
courierRouter.post("/add", authUser, adminOnly, addCourier);          // Admin (create)
courierRouter.post("/delete", authUser, adminOnly, deleteCourier);    // Admin (delete)
courierRouter.put("/update", authUser, adminOnly, updateCourier);    // Admin (update)

export default courierRouter;