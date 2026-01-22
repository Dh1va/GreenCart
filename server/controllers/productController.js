import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/product.js';

// Add Product
export const addProduct = async (req, res) => {
  try {
    let data = JSON.parse(req.body.productData);

    data.description = String(data.description || "");
    data.stock = Number(data.stock || 0);
    data.inStock = data.stock > 0;

    // SKU auto-generate (see Part 3)
    if (!data.sku) {
  let prefix = "PRD";

  if (Array.isArray(data.category) && data.category.length > 0) {
    prefix = data.category[0]
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();
  }

  const count = await Product.countDocuments();
  data.sku = `${prefix}-${count + 1}`;
}


    const images = req.files || [];
    const imagesUrl = await Promise.all(
      images.map(img =>
        cloudinary.uploader.upload(img.path).then(r => r.secure_url)
      )
    );

    const product = new Product({ ...data, images: imagesUrl });
    await product.save();

    res.json({ success: true, message: "Product created" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    let data = JSON.parse(req.body.productData);

    data.description = String(data.description || "");
    data.stock = Number(data.stock || 0);
    data.inStock = data.stock > 0;

    // AUTO-GENERATE SKU IF MISSING (OLD PRODUCTS)
if (!data.sku) {
  let prefix = "PRD";

  if (Array.isArray(data.category) && data.category.length > 0) {
    prefix = data.category[0]
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();
  }

  const count = await Product.countDocuments();
  data.sku = `${prefix}-${count + 1}`;
}


    const { id } = data;

    let finalImages = data.images || [];

    if (req.files?.length) {
      const urls = await Promise.all(
        req.files.map(f =>
          cloudinary.uploader.upload(f.path).then(r => r.secure_url)
        )
      );
      finalImages = [...finalImages, ...urls];
    }

    await Product.findByIdAndUpdate(id, {
      ...data,
      images: finalImages,
    });

    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// List Products
export const productList = async (req, res) => {
    try {
        // Sort by newest first
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get Single Product
export const productById = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//add product to category 
export const assignCategory = async (req, res) => {
    try {
        const { productId, newCategory } = req.body;
        
        if (!productId || !newCategory) {
            return res.json({ success: false, message: "Missing details" });
        }

        await Product.findByIdAndUpdate(productId, { category: newCategory });
        
        res.json({ success: true, message: "Category updated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const toggleCategory = async (req, res) => {
    try {
        const { productId, categoryName, action } = req.body; // action = 'add' or 'remove'
        
        const product = await Product.findById(productId);
        if (!product) return res.json({ success: false, message: "Product not found" });

        let categories = [];

        // Normalize current categories to Array
        if (Array.isArray(product.category)) {
            categories = [...product.category];
        } else if (product.category) {
            categories = [product.category];
        }

        if (action === 'add') {
            if (!categories.includes(categoryName)) {
                categories.push(categoryName);
            }
        } else if (action === 'remove') {
            categories = categories.filter(c => c !== categoryName);
            // If empty, set to Uncategorized or empty string depending on your logic
            if (categories.length === 0) categories = ["Uncategorized"]; 
        }

        // Save back
        product.category = categories;
        await product.save();
        
        res.json({ success: true, message: `Product ${action === 'add' ? 'added to' : 'removed from'} ${categoryName}` });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};