import express from "express";
import authUser from "../middleware/authUser.js";
import {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress, // ✅ REQUIRED
} from "../controllers/addressController.js";

const addressRouter = express.Router();

// Add new address
addressRouter.post("/add", authUser, addAddress);

// Get all addresses
addressRouter.get("/get", authUser, getAddress);

// Update address
addressRouter.put("/:id", authUser, updateAddress);

// Delete address
addressRouter.delete("/:id", authUser, deleteAddress);

export default addressRouter;
