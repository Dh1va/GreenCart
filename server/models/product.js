import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    // --- Core Info ---
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    
    // --- Organization ---
    category: { 
        type: [String], 
        required: true,
        index: true,
    },
    subCategory: { type: String },
    brand: { type: String }, 
    
    // --- Inventory & Tracking ---
    
    barcode: { type: String, trim: true },
    
    // --- Pricing (With Validation) ---
    price: { type: Number, required: true, min: 0 }, 
    offerPrice: { type: Number, min: 0 }, 
    
    sku: {
  type: String,
  unique: true,
  required: true,
  trim: true,
},

    // --- Stock ---
    stock: { type: Number, required: true, default: 0, min: 0 },
    inStock: { type: Boolean, default: true },
    
    // --- VARIANTS ---
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    
    // --- SEO (NEW) ---
    metaTitle: { type: String },
    metaDescription: { type: String },
    
    // --- System ---
    status: { type: String, default: 'active' }, 
    images: { type: Array, required: true } 
}, { timestamps: true });

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;