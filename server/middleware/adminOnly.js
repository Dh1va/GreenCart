const adminOnly = (req, res, next) => {
   console.log("AUTH USER:", req.user);
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
  next();
};

export default adminOnly;
