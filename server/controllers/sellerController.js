import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
//login seller : /api/seller/login

export const sellerLogin = async (req,res)=>{
    const {email, password} = req.body;

    try {
        if(!email || !password){
        return res.json({success: false, message: 'All fields are required'});
    }
    if(email !== process.env.SELLER_EMAIL || password !== process.env.SELLER_PASSWORD){
        return res.json({success: false, message: 'Invalid email or password'});
    }
    const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});

    res.cookie('sellerToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000  //7 days
    });
    return res.json({success: true, message: 'Seller logged in successfully'});
    } catch (error) {
        console.log('Error in seller login:', error);
        res.json({success: false, message: error.message});
    }
}

//check auth: /api/seller/is-auth
export const isSellerAuth = async (req,res) =>{
    try {
        return res.json({success: true});
    } catch (error) {   
        console.log('Error in seller authentication:', error);
        res.json({success: false, message: error.message});
    }
} 

//logout seller : /api/seller/logout
export const sellerLogout = async (req,res) =>{
    try {
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success: true, message: 'Seller logged out successfully'});
    }
    catch (error) {
        console.log('Error in seller logout:', error);
        res.json({success: false, message: error.message});
    }
}