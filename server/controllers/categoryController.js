import Category from '../models/category.js';

// Add Category
export const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.json({ success: false, message: "Name is required" });

        // Check duplicates
        const exists = await Category.findOne({ name });
        if (exists) return res.json({ success: false, message: "Category already exists" });

        await Category.create({ name, description });
        res.json({ success: true, message: "Category created successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// List Categories
export const listCategories = async (req, res) => {
    try {
        // Sort alphabetically
        const categories = await Category.find({}).sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Remove Category
export const removeCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndDelete(id);
        res.json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

