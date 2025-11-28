import User from "../models/user.js";

//update user cartData: /api/cart/update

export const updateCart = async (req, res) => {
    try {
         console.log("Request body:", req.body);
         console.log("Decoded userId:", req.userId);
         
        const { cartItems } = req.body;
        const userId = req.userId; // ✅ comes from authUser
        await User.findByIdAndUpdate(userId, {cartItems});
        res.json({success: true, message: 'Cart updated successfully'});
    } catch (error) {
        console.log('Error in updating cart:', error);
        res.json({success: false, message: 'Failed to update cart'});
    }
}