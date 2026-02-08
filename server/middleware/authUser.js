import jwt from "jsonwebtoken";
import "dotenv/config.js";

const authUser = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(); // No token? Proceed as Guest
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Token valid? Set User ID
    req.user = decoded; 
    
    next();
  } catch (error) {
    // If token is invalid/expired, ignore it and treat as Guest
    // instead of blocking the request with 401
    req.userId = null;
    next();
  }
};

export default authUser;