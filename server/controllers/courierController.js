import Courier from "../models/Courier.js";

export const getActiveCouriers = async (req, res) => {
  const couriers = await Courier.find({ isActive: true }).sort({
    isDefault: -1,
  });
  res.json({ success: true, couriers });
};
