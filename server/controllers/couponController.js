import Coupon from "../models/Coupon.js";

/* CREATE */
export const createCoupon = async (req, res) => {
  try {
    const exists = await Coupon.findOne({
      code: req.body.code.toUpperCase(),
    });

    if (exists) {
      return res.json({ success: false, message: "Coupon already exists" });
    }

    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase(),
      maxDiscount:
        req.body.type === "PERCENT" ? req.body.maxDiscount : null,
    });

    res.json({ success: true, coupon });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

/* LIST */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

/* UPDATE */
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, coupon });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

/* DELETE */
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.json({ success: false, message: "Coupon not found" });
    }

    if (!coupon.isActive) {
      return res.json({ success: false, message: "Coupon is inactive" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.json({ success: false, message: "Coupon expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ success: false, message: "Coupon usage limit reached" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }

    let discount = 0;

    if (coupon.type === "PERCENT") {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    if (coupon.type === "FLAT") {
      discount = coupon.value;
    }

    if (discount > orderAmount) discount = orderAmount;

    return res.json({ success: true, discount });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
