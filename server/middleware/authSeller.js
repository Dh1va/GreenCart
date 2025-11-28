import jwt from 'jsonwebtoken';
import 'dotenv/config.js';

const authSeller = async (req,res,next) =>{
    console.log("Cookies received:", req.cookies);
    const {sellerToken} = req.cookies;
    if(!sellerToken){
        return res.json({success: false, message: 'Unauthorized: No token provided'});
    }
    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if(tokenDecode.email === process.env.SELLER_EMAIL){
            next();
        }else{
            return res.status(401).json({success: false, message: 'Unauthorized: Invalid token'});
        }
      
    } catch (error) {
        res.status(401).json({success: false, message: 'Unauthorized: Invalid token'});
    }
}
export default authSeller;