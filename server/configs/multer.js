// configs/multer.js
import multer from 'multer';

// Use memory storage or disk storage. 
// Standard disk storage is safest for simple uploads before sending to Cloudinary.
const storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

export const upload = multer({ storage });