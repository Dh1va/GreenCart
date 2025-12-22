import Coupon from "../models/Coupon.js";

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.json({ success: false, message: "Invalid coupon" });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.json({ success: false, message: "Coupon expired" });
    }

    if (
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.json({ success: false, message: "Coupon usage limit reached" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.json({
        success: false,
        message: `Minimum order ${coupon.minOrderAmount} required`,
      });
    }

    let discount = 0;

    if (coupon.type === "PERCENT") {
      discount = Math.floor((orderAmount * coupon.value) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    return res.json({
      success: true,
      discount,
      coupon,
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
