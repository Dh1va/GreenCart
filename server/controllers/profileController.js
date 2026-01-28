import User from "../models/user.js";
import bcrypt from "bcryptjs";
import Otp from "../models/Otp.js";
import { sendOtpSms } from "../utils/sendOtpSms.js";

/* GET PROFILE */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-cartItems");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* UPDATE BASIC INFO (Name & Email) */
export const updateBasicInfo = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Valid name is required" });
    }

    // Check if email is being used by another user (if email is provided)
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      { name, email }, 
      { new: true, runValidators: true }
    ).select("-cartItems");

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* SEND OTP FOR MOBILE CHANGE  */
export const sendMobileChangeOtp = async (req, res) => {

  const { mobile } = req.body;

  if (!mobile || mobile.length !== 10) {
    return res.json({ success: false, message: "Invalid mobile number" });
  }

  const exists = await User.findOne({ mobile });
  if (exists) {
    return res.json({ success: false, message: "Mobile already in use" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  await Otp.deleteMany({ mobile });

  await Otp.create({
    mobile,
    otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendOtpSms(mobile, otp);

  res.json({ success: true, message: "OTP sent" });
};

/* VERIFY & UPDATE MOBILE */
export const verifyMobileChange = async (req, res) => {
 
  const { mobile, otp } = req.body;

  const record = await Otp.findOne({ mobile });
  if (!record) return res.json({ success: false });

  const isValid = await bcrypt.compare(otp, record.otpHash);
  if (!isValid) return res.json({ success: false, message: "Invalid OTP" });

  await User.findByIdAndUpdate(req.userId, { mobile });
  await Otp.deleteMany({ mobile });

  res.json({ success: true, message: "Mobile updated" });
};