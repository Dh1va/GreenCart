import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String }, 
    image: { type: String, default: "" },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categoryGroup",
      
      index: true,
    },
}, { timestamps: true });

const Category = mongoose.models.category || mongoose.model('category', categorySchema);

export default Category;