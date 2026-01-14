import User from "../models/user.js";
import Address from "../models/Address.js";
import Order from "../models/Order.js";

export const getUserWithAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("name mobile isBlocked createdAt");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const addresses = await Address.find({ userId });

    res.json({
      success: true,
      user,
      addresses,
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const getOrdersByUserAdmin = async (req, res) => {
  const { userId } = req.params;

  const orders = await Order.find({ user: userId })
    .populate("items.product", "name")
    .populate("address")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
};

// List Users
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
  .select("name mobile isBlocked createdAt email addresses")
  .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Toggle Block Status
export const toggleBlock = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Create User
export const createUser = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    if (!mobile) {
      return res.json({ success: false, message: "Mobile number is required" });
    }

    const exists = await User.findOne({ mobile });
    if (exists) {
      return res.json({ success: false, message: "User with this mobile already exists" });
    }

    // Create user (Add password logic here if your schema requires it later)
    const newUser = new User({
      name,
      mobile,
      role: "user",
      isBlocked: false
    });

    await newUser.save();

    res.json({ success: true, message: "Customer created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};