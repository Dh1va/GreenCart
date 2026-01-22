import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Upload } from "lucide-react"; 

const ManageCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, axios, fetchProducts, fetchCategoriesOnce } =
    useAppContext();

  // State for Category Editing
  const [catData, setCatData] = useState({
    name: "",
    description: "",
    image: "",
    groupId: "",
  });
  const [groups, setGroups] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // State for Product Management
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get("/api/category-group/list");
        if (data.success) setGroups(data.groups);
      } catch (error) {}
    };
    fetchGroups();
  }, []);

  // Load Data
  useEffect(() => {
    fetchProducts();
    fetchCategoriesOnce();
  }, []);

  useEffect(() => {
    const cat = categories.find((c) => c._id === id);
    if (cat) {
      // ✅ FIX: Safely handle groupId which can be null, object, or string
      let safeGroupId = "";
      if (cat.groupId) {
          safeGroupId = typeof cat.groupId === "object" ? cat.groupId._id : cat.groupId;
      }

      setCatData({
        name: cat.name,
        description: cat.description,
        image: cat.image,
        groupId: safeGroupId,
      });
    }
  }, [categories, id]);

  // --- 1. HANDLE CATEGORY EDIT ---
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", catData.name);
      formData.append("description", catData.description);
      // Send empty string if no group selected, backend handles this
      formData.append("groupId", catData.groupId || ""); 
      
      if (imageFile) formData.append("image", imageFile);

      const { data } = await axios.post("/api/category/update", formData);
      if (data.success) {
        toast.success("Category details updated");
        fetchCategoriesOnce(true); // reload context
        navigate("/admin/categories");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 2. HANDLE PRODUCT ADD/REMOVE ---
  const handleProductAction = async (productId, action) => {
    setLoadingAction(productId);
    try {
      const { data } = await axios.post("/api/product/toggle-category", {
        productId,
        categoryName: catData.name, // Use current name
        action, // 'add' or 'remove'
      });

      if (data.success) {
        toast.success(data.message);
        fetchProducts(); // Refresh lists
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setLoadingAction(null);
    }
  };

  // Filter Logic
  const { inCategory, notInCategory } = useMemo(() => {
    const term = search.toLowerCase();
    const currentCatName = catData.name; 

    const inCat = [];
    const notInCat = [];

    products.forEach((p) => {
      const matchesSearch = p.name.toLowerCase().includes(term);
      if (!matchesSearch) return;

      const isPresent = Array.isArray(p.category)
        ? p.category.includes(currentCatName)
        : p.category === currentCatName;

      if (isPresent) inCat.push(p);
      else notInCat.push(p);
    });

    return { inCategory: inCat, notInCategory: notInCat };
  }, [products, search, catData.name]);

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col bg-gray-100">
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/categories")}
          className="mb-6 flex items-center text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Categories
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: EDIT DETAILS --- */}
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Edit Details
              </h2>
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                {/* Image Upload */}
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="cat-img"
                    className="cursor-pointer group relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors flex items-center justify-center"
                  >
                    {imageFile ? (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        className="w-full h-full object-cover"
                      />
                    ) : catData.image ? (
                      <img
                        src={catData.image}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">
                          Click to upload
                        </span>
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">
                        Change Image
                      </p>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="cat-img"
                    hidden
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Parent Group
                  </label>
                  <select
                    value={catData.groupId || ""}
                    onChange={(e) =>
                      setCatData({ ...catData, groupId: e.target.value })
                    }
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    // removed required to allow un-grouping
                  >
                    <option value="">Select Group (None)</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={catData.name}
                    onChange={(e) =>
                      setCatData({ ...catData, name: e.target.value })
                    }
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <p className="text-xs text-red-500 mt-1">
                    Warning: Changing name affects products linked by name.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </label>
                  <textarea
                    value={catData.description}
                    onChange={(e) =>
                      setCatData({ ...catData, description: e.target.value })
                    }
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT COLUMN: MANAGE PRODUCTS --- */}
          <div className="xl:col-span-2 space-y-6">
            {/* Search Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Manage Products
                </h2>
                <p className="text-sm text-gray-500">
                  Add or remove products from this category.
                </p>
              </div>
              <input
                type="text"
                placeholder="Search all products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* SECTION A: PRODUCTS IN CATEGORY (REMOVE) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex justify-between items-center">
                <h3 className="font-bold text-emerald-800 text-sm uppercase">
                  In this Category ({inCategory.length})
                </h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-100">
                    {inCategory.length > 0 ? (
                      inCategory.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 flex items-center gap-3">
                            <img
                              src={p.images?.[0]}
                              className="w-8 h-8 rounded object-cover bg-gray-200"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {p.name}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() =>
                                handleProductAction(p._id, "remove")
                              }
                              disabled={loadingAction === p._id}
                              className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition-colors"
                            >
                              {loadingAction === p._id ? "..." : "Remove"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-8 text-center text-sm text-gray-400">
                          No products in this category yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION B: AVAILABLE PRODUCTS (ADD) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-600 text-sm uppercase">
                  Available to Add ({notInCategory.length})
                </h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-100">
                    {notInCategory.length > 0 ? (
                      notInCategory.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 flex items-center gap-3">
                            <img
                              src={p.images?.[0]}
                              className="w-8 h-8 rounded object-cover bg-gray-200"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {p.name}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => handleProductAction(p._id, "add")}
                              disabled={loadingAction === p._id}
                              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100 transition-colors"
                            >
                              {loadingAction === p._id ? "..." : "Add"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-8 text-center text-sm text-gray-400">
                          No available products match search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategory;