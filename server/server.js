import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import "dotenv/config.js";

import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import authRouter from "./routes/authRoutes.js";
import adminUserRouter from "./routes/adminUserRoute.js";
import userRouter from "./routes/userRoute.js";
import { startOtpCleanup } from "./cron/otpCleanup.js";
import profileRouter from "./routes/profileRoute.js";
import courierRouter from "./routes/courierRoute.js";
import couponRouter from "./routes/couponRoute.js";

import adminOrderRouter from "./routes/adminOrderRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// DB & Cloudinary
await connectDB();
await connectCloudinary();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://green-cart-silk-sigma.vercel.app",
];

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => res.send("API is working"));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminUserRouter);
app.use("/api/profile", profileRouter);
app.use("/api/courier", courierRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/admin", adminOrderRouter);
// OTP cleanup cron
startOtpCleanup();

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
