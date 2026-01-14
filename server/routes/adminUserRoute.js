import express from "express";
import { 
    listUsers, 
    toggleBlock, 
    createUser, 
    getUserWithAddresses,
    getOrdersByUserAdmin,
} from "../controllers/adminUserController.js";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";

const adminUserRouter = express.Router();

// ⚠️ static routes FIRST
adminUserRouter.get("/user/:userId", authUser, adminOnly, getOrdersByUserAdmin);

// dynamic routes AFTER
adminUserRouter.get("/:userId/details", authUser, adminOnly, getUserWithAddresses);

adminUserRouter.get("/users", authUser, adminOnly, listUsers);
adminUserRouter.post("/block", authUser, adminOnly, toggleBlock);
adminUserRouter.post("/create", authUser, adminOnly, createUser);

export default adminUserRouter;