import express from "express";
import authUser from "../middleware/authUser.js";
import {
  getProfile,
  updateBasicInfo,
  sendMobileChangeOtp,
  verifyMobileChange
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", authUser, getProfile);
router.put("/basic", authUser, updateBasicInfo);
router.post("/mobile/send-otp", authUser, sendMobileChangeOtp);
router.post("/mobile/verify", authUser, verifyMobileChange);

export default router;
