import express from "express";
import authUser from "../middleware/authUser.js";
import { isAuth, logout, toggleWishlist } from "../controllers/userController.js";

const router = express.Router();

router.get("/is-auth", authUser, isAuth);
router.get("/logout", logout);
router.post('/wishlist', authUser, toggleWishlist);

export default router;
