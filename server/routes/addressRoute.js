import express from "express";
import authUser from "../middleware/authUser.js";
import { addAddress, getAddress } from "../controllers/addressController.js";

const addressRouter = express.Router();

// Add address routes here
addressRouter.post('/add', authUser, addAddress);
addressRouter.get('/get', authUser, getAddress);

export default addressRouter;

