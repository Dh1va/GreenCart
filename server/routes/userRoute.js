import express from "express";
import authUser from "../middleware/authUser.js";
import { isAuth, logout } from "../controllers/userController.js";

const router = express.Router();

router.get("/is-auth", authUser, isAuth);
router.get("/logout", authUser, logout);

export default router;
