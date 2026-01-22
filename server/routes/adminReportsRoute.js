import express from "express";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";
import { getReportsOverview, exportReportsCSV } from "../controllers/adminReportsController.js";

const router = express.Router();

router.get("/overview", authUser, adminOnly, getReportsOverview);
router.get("/export", authUser, adminOnly, exportReportsCSV);

export default router;
