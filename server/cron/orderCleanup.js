import cron from "node-cron";
import Order from "../models/Order.js";

export const startOrderCleanup = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("🧹 Running Abandoned Order Cleanup...");
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    try {
      const result = await Order.deleteMany({
        createdAt: { $lt: oneHourAgo }, // Older than 1 hour
        "payment.status": "pending",    // Still pending
        "payment.method": { $ne: "cod" } // NOT Cash on Delivery
      });

      if (result.deletedCount > 0) {
        console.log(`🗑️ Deleted ${result.deletedCount} abandoned orders.`);
      }
    } catch (error) {
      console.error("Cleanup Error:", error);
    }
  });
};