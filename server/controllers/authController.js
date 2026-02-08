import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Otp from "../models/Otp.js";
import Settings from "../models/Settings.js"; // ✅ New Import
import { sendOtpSms } from "../utils/sendOtpSms.js";

/* =====================================================
   HELPER: TOKEN GENERATOR
   (Reusable for both OTP and Password login)
   ===================================================== */
const generateToken = (res, user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? false : false,
    sameSite: "strict",
    maxAge: 7 * 24 * 3600000,
  });
  
  return token;
};

/* =====================================================
   HELPER: MAINTENANCE CHECK
   (Blocks access unless user is Admin)
   ===================================================== */
const checkMaintenance = async (role = 'user') => {
  const settings = await Settings.findOne().lean();
  
  // If maintenance is ON and user is NOT an admin, block them
  if (settings?.maintenanceMode && role !== 'admin') {
    throw new Error("Store is currently in maintenance mode.");
  }
};

/* =====================================================
   1. SEND OTP (Existing + Maintenance Check)
   ===================================================== */
export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    // 1. Check Global Settings
    const settings = await Settings.findOne().lean();
    if (settings?.enableOtpLogin === false) {
      return res.json({ success: false, message: "OTP Login is currently disabled." });
    }

    // 2. Check Maintenance Mode (Pre-check)
    // We check if the user exists to know if they are an admin
    const user = await User.findOne({ mobile });
    const role = user ? user.role : 'user'; 
    if (settings?.maintenanceMode && role !== 'admin') {
      return res.json({ success: false, message: "Store is currently in maintenance mode." });
    }

    // 3. Validation
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.json({ success: false, message: "Enter a valid Indian mobile number" });
    }

    // 🔥 DEV MODE — SKIP OTP
    if (process.env.NODE_ENV === "development") {
      return res.json({ success: true, message: "OTP skipped in development" });
    }

    // 4. Rate Limiting Logic
    const existing = await Otp.findOne({ mobile });
    if (existing && existing.lastSentAt > new Date(Date.now() - 30 * 1000)) {
      return res.json({ success: false, message: "Please wait before requesting another OTP" });
    }

    // 5. Generate & Send
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
   2. VERIFY OTP (Existing + Maintenance Check)
   ===================================================== */
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, name, email } = req.body;

    /* 🔥 DEV MODE BYPASS */
    if (process.env.NODE_ENV === "development") {
      let user = await User.findOne({ mobile });

      // Maintenance Check for Dev
      await checkMaintenance(user ? user.role : 'user');

      if (!user) {
        if (!name || !email) {
           return res.json({ success: false, requireDetails: true });
        }
        user = await User.create({ mobile, name, email, role: "user" });
      }

      generateToken(res, user);
      return res.json({ success: true, user, devBypass: true });
    }

    /* 🚀 PRODUCTION MODE */
    const record = await Otp.findOne({ mobile });
    if (!record || record.expiresAt < new Date()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    let user = await User.findOne({ mobile });

    // ✅ Maintenance Check
    // If user exists, check role. If new user, role is 'user' (blocked).
    await checkMaintenance(user ? user.role : 'user');

    if (!user) {
      if (!name || !email) {
        return res.json({ success: false, requireDetails: true }); 
      }
      user = await User.create({ mobile, name, email, role: "user" });
    }

    await Otp.deleteMany({ mobile });

    generateToken(res, user);
    res.json({ success: true, user });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.json({ success: false, message: err.message }); // Changed to 200 OK with success:false for cleaner frontend handling
  }
};

/* =====================================================
   3. LOGIN WITH PASSWORD
   ===================================================== */
export const loginWithPassword = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = email OR mobile

    // Check Settings
    const settings = await Settings.findOne().lean();
    if (settings?.enablePasswordLogin === false) {
      return res.json({ success: false, message: "Password Login is disabled." });
    }

    // Find user and explicitly select password
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    }).select("+password");

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Maintenance Check
    await checkMaintenance(user.role);

    // Verify Password
    if (!user.password) {
      return res.json({ success: false, message: "Please login via OTP to set a password first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    generateToken(res, user);

    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, user: userResponse });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

/* =====================================================
   4. REGISTER WITH PASSWORD (✅ NEW)
   ===================================================== */
export const registerWithPassword = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Check Settings
    const settings = await Settings.findOne().lean();
    if (settings?.enablePasswordLogin === false) {
      return res.json({ success: false, message: "Registration is currently disabled." });
    }

    // Maintenance Check (New users are always 'user' role)
    await checkMaintenance('user');

    const exists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (exists) {
      return res.json({ success: false, message: "User already exists. Please login." });
    }

    if (password.length < 6) {
        return res.json({ success: false, message: "Password must be at least 6 characters." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: "user"
    });

    generateToken(res, user);
    
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, user: userResponse });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

/* =====================================================
   LOGOUT 
   ===================================================== */
export const logout = async (req, res) => {
  res.setHeader("Clear-Site-Data", '"cookies", "storage"'); 
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.json({ success: true, message: "Logged out completely" });
};