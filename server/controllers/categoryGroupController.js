import CategoryGroup from "../models/categoryGroup.js";

const makeSlug = (text = "") =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

export const addCategoryGroup = async (req, res) => {
  try {
    const { name, order } = req.body;
    if (!name) return res.json({ success: false, message: "Group name is required" });

    const slug = makeSlug(name);

    const exists = await CategoryGroup.findOne({ $or: [{ name }, { slug }] });
    if (exists) return res.json({ success: false, message: "Group already exists" });

    await CategoryGroup.create({ name, slug, order: Number(order || 0) });

    res.json({ success: true, message: "Group created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const listCategoryGroups = async (req, res) => {
  try {
    const groups = await CategoryGroup.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, groups });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const removeCategoryGroup = async (req, res) => {
  try {
    const { id } = req.body;
    await CategoryGroup.findByIdAndDelete(id);
    res.json({ success: true, message: "Group deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateCategoryGroup = async (req, res) => {
  try {
    const { id, name, order } = req.body;
    
    if (!id) return res.json({ success: false, message: "Group ID is required" });

    const group = await CategoryGroup.findById(id);
    if (!group) return res.json({ success: false, message: "Group not found" });

    if (name) group.name = name;
    if (order !== undefined) group.order = Number(order);

    await group.save();
    res.json({ success: true, message: "Group updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};