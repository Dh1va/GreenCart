import User from "../models/user.js";

export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/", // Ensure the path matches where it was set
  });

  res.json({ success: true, message: "Logged out" });
};
