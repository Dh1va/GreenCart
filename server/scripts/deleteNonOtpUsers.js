import mongoose from "mongoose";
import "dotenv/config.js";
import User from "../models/user.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const count = await User.countDocuments();
    console.log(`Found ${count} users`);

    const result = await User.deleteMany({});
    console.log(`🔥 Deleted ${result.deletedCount} users`);
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();