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

// ADMIN: Add a new courier
export const addCourier = async (req, res) => {
  try {
    const { name, price, minDays, maxDays, chargePerItem, trackingPrefix, trackingSequence } = req.body;
    
    const newCourier = new Courier({
      name,
      price: Number(price),
      minDays: Number(minDays),
      maxDays: Number(maxDays),
      chargePerItem: Boolean(chargePerItem),
      
      trackingPrefix: trackingPrefix || "", 
      trackingSequence: Number(trackingSequence) || 1000, 
      isActive: true
    });

    await newCourier.save();
    res.json({ success: true, message: "Courier Added" });
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



// ADMIN: Update courier
export const updateCourier = async (req, res) => {
  try {
    const { id, name, price, minDays, maxDays, chargePerItem, trackingPrefix, trackingSequence } = req.body;

    await Courier.findByIdAndUpdate(id, {
      name,
      price: Number(price),
      minDays: Number(minDays),
      maxDays: Number(maxDays),
      chargePerItem: Boolean(chargePerItem),
      // ✅ Update fields
      trackingPrefix: trackingPrefix || "",
      trackingSequence: Number(trackingSequence)
    });

    res.json({ success: true, message: "Courier Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};