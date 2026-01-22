import StoreSettings from "../models/StoreSettings.js";

const maintenanceMode = async (req, res, next) => {
  const settings = await StoreSettings.findOne().lean();

  if (settings?.maintenanceMode === true) {
    return res.status(503).json({
      success: false,
      message: "Store is under maintenance. Please try again later.",
    });
  }

  next();
};

export default maintenanceMode;
