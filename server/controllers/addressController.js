import Address from "../models/Address.js";


//add Address : /api/address/add
export const addAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { address } = req.body;

    if (address.isDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    const newAddress = await Address.create({
      ...address,
      userId,
    });

    return res.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Failed to add address",
    });
  }
};


//get Address : /api/address/get
export const getAddress = async(req, res) => {
    try {
        const userId = req.userId; // ✅ get userId from auth
        const addresses = await Address.find({userId});
        res.json({success: true, addresses});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: 'Failed to fetch addresses'});
    }
}

/* --------------------------------
   UPDATE ADDRESS
   PUT /api/address/:id
--------------------------------- */
export const updateAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;
    const { address } = req.body;

    if (address.isDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      address,
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Address not found" });
    }

    return res.json({
      success: true,
      message: "Address updated successfully",
      address: updated,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Failed to update address",
    });
  }
};
 
/* --------------------------------
   SET DEFAULT ADDRESS
   PUT /api/address/set-default/:id
--------------------------------- */
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;

    await Address.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      { isDefault: true },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Address not found" });
    }

    return res.json({
      success: true,
      message: "Default address updated",
      address: updated,
    });
  } catch (error) {
    return res.json({ success: false, message: "Failed to set default" });
  }
};

/* --------------------------------
   DELETE ADDRESS
   DELETE /api/address/:id
--------------------------------- */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.id;

    const deleted = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};
