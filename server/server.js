import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config.js";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import authRouter from "./routes/authRoutes.js";
import adminUserRouter from "./routes/adminUserRoute.js";
import userRouter from "./routes/userRoute.js";
import profileRouter from "./routes/profileRoute.js";
import courierRouter from "./routes/courierRoute.js";

import adminOrderRouter from "./routes/adminOrderRoute.js";
import adminDashboardRouter from "./routes/adminDashboardRoute.js"; 
import categoryRouter from "./routes/categoryRoute.js";
import couponRouter from "./routes/couponRoute.js";


import { startOtpCleanup } from "./cron/otpCleanup.js";
import { startOrderCleanup } from "./cron/orderCleanup.js";
import { Server } from "socket.io";
import invoiceRouter from "./routes/adminInvoiceRoute.js";
import adminReportsRoute from "./routes/adminReportsRoute.js";
import categoryGroupRouter from "./routes/categoryGroupRoute.js";
import adminSettingsRoute from "./routes/adminSettingsRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import publicSettingsRoute from "./routes/publicSettingsRoute.js";

// ---------- INIT ----------
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// ---------- DB ----------
await connectDB();
await connectCloudinary();

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);


// ---------- SOCKET ----------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ---------- ROUTES ----------
app.get("/", (req, res) => res.send("API is working"));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin-users", adminUserRouter);
app.use("/api/profile", profileRouter);
app.use("/api/courier", courierRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/admin-orders", adminOrderRouter);
app.use("/api/admin", adminDashboardRouter);
app.use("/api/category", categoryRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/admin-invoices", invoiceRouter);
app.use("/api/admin/reports", adminReportsRoute);
app.use("/api/category-group", categoryGroupRouter);
app.use("/api/admin", adminSettingsRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/settings", publicSettingsRoute);




// ---------- CRON ----------
startOtpCleanup();
startOrderCleanup();

// ---------- START ----------
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
