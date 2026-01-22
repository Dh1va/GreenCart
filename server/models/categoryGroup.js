import mongoose from "mongoose";

const categoryGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    order: { type: Number, default: 0 }, // for mega menu sorting
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategoryGroup =
  mongoose.models.categoryGroup || mongoose.model("categoryGroup", categoryGroupSchema);

export default CategoryGroup;
