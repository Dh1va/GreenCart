import User from "../models/user.js";

export const listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name mobile createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
