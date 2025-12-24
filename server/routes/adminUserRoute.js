import express from "express";
import { listUsers } from "../controllers/adminUserController.js";
import authUser from "../middleware/authUser.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

router.get("/users", authUser, adminOnly, listUsers);

export default router;
