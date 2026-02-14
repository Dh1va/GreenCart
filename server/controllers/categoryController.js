import Category from "../models/category.js";
import { v2 as cloudinary } from "cloudinary";

export const addCategory = async (req, res) => {
  try {
    const { name, description, groupId } = req.body;
    const imageFile = req.file;

    if (!name) return res.json({ success: false, message: "Name is required" });
    
    const exists = await Category.findOne({ name });
    if (exists)
      return res.json({ success: false, message: "Category already exists" });

    let image = ""; // Default empty

    // 👈 Only upload if imageFile exists
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      image = imageUpload.secure_url;
    }

    await Category.create({ name, description, image, groupId: groupId || null });
    res.json({ success: true, message: "Category created successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// List Categories
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate("groupId", "name slug order")
      .sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id, name, description, groupId } = req.body; // ✅ include groupId
    const imageFile = req.file;

    const category = await Category.findById(id);
    if (!category) {
      return res.json({ success: false, message: "Category not found" });
    }


    await category.save();

    res.json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// Remove Category
export const removeCategory = async (req, res) => {
  try {
    const { id } = req.body;
    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
