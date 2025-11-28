import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';


//Register User : /api/user/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({success: false, message: 'All fields are required'});
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({success: false, message: 'User already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, email, password: hashedPassword
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true, //prevent Javascript to access the cookie
            secure: process.env.NODE_ENV === 'production', //use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //allow cross-site cookies in production
            maxAge: 7 * 24 * 60 * 60 * 1000  //7 days
        })

        return res.json({
            success: true,
            message: 'User registered successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log('Error in user registration:', error);
        
        res.json({success: false, message: error.message});
    }
}

//Login User : /api/user/login

export const login = async (req,res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.json({success: false, message: 'All fields are required'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.json({success: false, message: 'Invvalid email or password'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success: false, message: 'Invalid email or password'});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true, //prevent Javascript to access the cookie
            secure: process.env.NODE_ENV === 'production', //use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //allow cross-site cookies in production
            maxAge: 7 * 24 * 60 * 60 * 1000  //7 days
        })
        return res.json({
            success: true,
            message: 'logged in successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch(error){
        console.log('Error in user login:', error);
        res.json({success: false, message: error.message});
    }
}

//check user authentication : /api/user/is-auth

export const isAuth = async (req, res) => {
    try{
        
        const user = await User.findById(req.userId).select('-password');
        return res.json({success: true, user});
    }catch(error){
        console.log('Error in user authentication:', error);
        res.json({success: false, message: error.message});
    }
}

//Logout user : /api/user/logout
export const logout = async (req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success: true, message: 'logged out successfully'});
    }
    catch(error){
        console.log('Error in user logout:', error);
        res.json({success: false, message: error.message});
    }
}