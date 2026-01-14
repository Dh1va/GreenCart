import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Otp from "../models/Otp.js";
import { sendOtpSms } from "../utils/sendOtpSms.js";

/* =====================================================
   SEND OTP
   ===================================================== */
export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.json({
        success: false,
        message: "Enter a valid Indian mobile number",
      });
    }

    /* 🔥 DEV MODE — SKIP OTP */
    if (process.env.NODE_ENV === "development") {
      return res.json({
        success: true,
        message: "OTP skipped in development",
      });
    }

    /* ---------- PRODUCTION OTP FLOW ---------- */
    const existing = await Otp.findOne({ mobile });

    if (existing && existing.lastSentAt > new Date(Date.now() - 30 * 1000)) {
      return res.json({
        success: false,
        message: "Please wait before requesting another OTP",
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

/* =====================================================
   VERIFY OTP (FINAL FIX)
   ===================================================== */
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, name } = req.body;

    if (process.env.NODE_ENV === "development") {
  let user = await User.findOne({ mobile });

  if (!user) {
    user = await User.create({
      mobile,
      name: name || "Dev User",
      role: "user", // ✅ SAFE DEFAULT
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role, // 🔐 REAL ROLE FROM DB
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    user,
    devBypass: true,
  });
}

    /* =================================================
       🚀 PRODUCTION MODE — OTP FLOW
       ================================================= */
    const record = await Otp.findOne({ mobile });
    if (!record) {
      return res.json({ success: false, message: "OTP expired" });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ mobile });
      return res.json({ success: false, message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    let user = await User.findOne({ mobile });

    if (!user) {
      if (!name) {
        return res.json({ success: false, requireName: true });
      }
      user = await User.create({ mobile, name, role: "user" });
    }

    await Otp.deleteMany({ mobile });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   LOGOUT
   ===================================================== */
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
  });

  res.json({ success: true, message: "Logged out" });
};
