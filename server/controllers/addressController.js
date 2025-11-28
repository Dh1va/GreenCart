import Address from "../models/Address.js";


//add Address : /api/address/add
export const addAddress = async (req, res) => {
    try {
        console.log("Address request body:", req.body);
        console.log("UserId from auth:", req.userId);

        const userId = req.userId; // ✅ get from auth middleware
        const { address } = req.body
        await Address.create({...address, userId});
        res.json({success: true, message: 'Address added successfully'});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: 'Failed to add address'});
    }
}

//get Address : /api/address/get
export const getAddress = async(req, res) => {
    try {
        const userId = req.userId; // ✅ get userId from auth
        const addresses = await Address.find({userId});
        res.json({success: true, addresses});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: 'Failed to fetch addresses'});
    }
}