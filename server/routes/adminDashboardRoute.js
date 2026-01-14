import express from "express";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";
import { getDashboardStats } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/dashboard", authUser, adminOnly, getDashboardStats);

export default router;
