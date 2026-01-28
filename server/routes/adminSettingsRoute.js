import express from "express";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";
import { getAdminSettings, updateAdminSettings,  } from "../controllers/adminSettingsController.js";
import { sendTestOrderEmail } from "../controllers/adminSettingsTestController.js";

const router = express.Router();

router.get("/settings", authUser, adminOnly, getAdminSettings);
router.put("/settings", authUser, adminOnly, updateAdminSettings);
router.post("/settings/test-email", authUser, adminOnly, sendTestOrderEmail);

export default router;
