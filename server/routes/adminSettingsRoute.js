import express from "express";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  getSettings,
  updateSettings,
  forceLogoutAll,
} from "../controllers/adminSettingsController.js";

const router = express.Router();

router.get("/", authUser, adminOnly, getSettings);
router.put("/", authUser, adminOnly, updateSettings);
router.post("/force-logout", authUser, adminOnly, forceLogoutAll);

export default router;
