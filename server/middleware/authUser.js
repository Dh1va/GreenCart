import jwt from "jsonwebtoken";
import "dotenv/config.js";

const authUser = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.user = decoded; // 🔥 REQUIRED FOR ADMIN

    next();
  } catch {
    return res.status(401).json({ success: false });
  }
};

export default authUser;
