import express from "express";
import { getActiveCouriers } from "../controllers/courierController.js";

const router = express.Router();

router.get("/active", getActiveCouriers);

export default router;
