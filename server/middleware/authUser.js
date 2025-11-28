import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
const authUser = async (req, res, next) => {
    console.log("Cookies received:", req.cookies);
    const {token} = req.cookies;
    if(!token){
        return res.json({success: false, message: 'Unauthorized: No token provided'});
    }
    try{
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
         console.log("Decoded token:", tokenDecode);
        if(tokenDecode.id){
            req.userId = tokenDecode.id;
        }else{
            return res.status(401).json({success: false, message: 'Unauthorized: Invalid token'});
        }
       
        next();
    } catch(error){
        console.log("JWT verification error:", error);
        return res.status(401).json({success: false, message: 'Unauthorized: Invalid token'});
    }
}
export default authUser;