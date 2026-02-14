import express from "express";
import authUser from "../middleware/authUser.js";
import {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress, 
} from "../controllers/addressController.js";

const addressRouter = express.Router();

addressRouter.post("/add", authUser, addAddress);

addressRouter.get("/get", authUser, getAddress);

// Update address
addressRouter.put("/:id", authUser, updateAddress);

addressRouter.delete("/:id", authUser, deleteAddress);

export default addressRouter;
