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

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.userId; // from authUser middleware
    const { productId } = req.body;

    const user = await User.findById(userId); // ✅ FIXED HERE

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!Array.isArray(user.wishlist)) user.wishlist = [];

    const exists = user.wishlist.some((id) => id.toString() === productId);

    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
      await user.save();
      return res.json({
        success: true,
        message: "Removed from Wishlist",
        wishlist: user.wishlist,
      });
    } else {
      user.wishlist.push(productId);
      await user.save();
      return res.json({
        success: true,
        message: "Added to Wishlist",
        wishlist: user.wishlist,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};