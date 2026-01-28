// server/routes/publicSettingsRoute.js
import express from "express";
import { getPublicSettings } from "../controllers/publicSettingsController.js";

const router = express.Router();

router.get("/", getPublicSettings);

export default router;
