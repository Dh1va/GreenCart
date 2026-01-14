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
