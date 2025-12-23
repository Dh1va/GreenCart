import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Otp from "../models/Otp.js";
import { sendOtpSms } from "../utils/sendOtpSms.js";

/* SEND OTP */
export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    // 🇮🇳 Indian mobile validation (starts with 6–9)
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.json({
        success: false,
        message: "Enter a valid Indian mobile number",
      });
    }

    const existing = await Otp.findOne({ mobile });

    if (
      existing &&
      existing.lastSentAt > new Date(Date.now() - 30 * 1000)
    ) {
      return res.json({
        success: false,
        message: "Please wait before requesting another OTP",
      });
    }

    if (
      existing &&
      existing.createdAt > new Date(Date.now() - 10 * 60 * 1000)
    ) {
      return res.json({
        success: false,
        message: "Too many OTP requests. Please try again after 10 minutes.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ mobile });

    await Otp.create({
      mobile,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      lastSentAt: new Date(),
    });

    await sendOtpSms(mobile, otp);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

/* VERIFY OTP */
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, name } = req.body;

    const record = await Otp.findOne({ mobile });
    if (!record) {
      return res.json({ success: false, message: "OTP expired" });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ mobile });
      return res.json({ success: false, message: "OTP expired" });
    }

    if (record.attempts >= 5) {
      return res.json({
        success: false,
        message: "Too many wrong attempts. Try later.",
      });
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      record.attempts += 1;
      await record.save();
      return res.json({ success: false, message: "Invalid OTP" });
    }

    let user = await User.findOne({ mobile });

    // 🆕 FIRST TIME USER → NAME REQUIRED
    if (!user) {
      if (!name || name.trim().length < 2) {
        return res.json({
          success: false,
          requireName: true,
          message: "Name required for first-time login",
        });
      }

      user = await User.create({
        mobile,
        name: name.trim(),
      });
    }

    await Otp.deleteMany({ mobile });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user,
      hasMergedGuestCart: user.hasMergedGuestCart
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};


