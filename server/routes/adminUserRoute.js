import express from "express";
import { listUsers } from "../controllers/adminUserController.js";
import authSeller from "../middleware/authSeller.js";

const router = express.Router();

router.get("/users", authSeller, listUsers);

export default router;
