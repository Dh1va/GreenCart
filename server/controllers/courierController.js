import Courier from "../models/Courier.js";

// PUBLIC: Get active couriers for Checkout Page
export const getActiveCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, couriers });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ADMIN: Add a new courier option
export const addCourier = async (req, res) => {
  try {
    const { name, price, minDays, maxDays } = req.body;
    
    const newCourier = new Courier({
      name,
      price: Number(price),
      minDays: Number(minDays),
      maxDays: Number(maxDays),
      chargePerItem: Boolean(chargePerItem),
      isActive: true
    });

    await newCourier.save();
    res.json({ success: true, message: "Courier Added Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ADMIN: Delete a courier
export const deleteCourier = async (req, res) => {
  try {
    await Courier.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Courier Deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ADMIN: List all (for management table)
export const getAllCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find({});
    res.json({ success: true, couriers });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



// ADMIN: Update an existing courier
export const updateCourier = async (req, res) => {
  try {
    const { id, name, price, minDays, maxDays } = req.body;

    await Courier.findByIdAndUpdate(id, {
      name,
      price: Number(price),
      minDays: Number(minDays),
      maxDays: Number(maxDays),
      chargePerItem: Boolean(chargePerItem),
    });

    res.json({ success: true, message: "Courier Updated Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};