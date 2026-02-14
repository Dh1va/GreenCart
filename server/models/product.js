import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { 
        type: [String], 
        required: true,
        index: true,
    },
    subCategory: { type: String },
    brand: { type: String }, 
    
    barcode: { type: String, trim: true },
    
    price: { type: Number, required: true, min: 0 }, 
    offerPrice: { type: Number, min: 0 }, 
    
    sku: {
  type: String,
  unique: true,
  required: true,
  trim: true,
},

    stock: { type: Number, required: true, default: 0, min: 0 },
    inStock: { type: Boolean, default: true },
    
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    
    metaTitle: { type: String },
    metaDescription: { type: String },
    
    status: { type: String, default: 'active' }, 
    images: { type: Array, required: true } 
}, { timestamps: true });

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;