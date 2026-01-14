import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

const AddProduct = () => {
  const { axios, fetchProducts } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [categories, setCategories] = useState([]);

  // Core Data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // CHANGED: Initialize as array for multi-category support
  const [category, setCategory] = useState([]); 
  const [brand, setBrand] = useState("");

  // Pricing
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");

  // Inventory
  const [stock, setStock] = useState("0");
  const [sku, setSku] = useState("");
  const [status, setStatus] = useState("active");

  // Variants
  const [sizes, setSizes] = useState([]);
  const [currSize, setCurrSize] = useState("");
  const [colors, setColors] = useState([]);
  const [currColor, setCurrColor] = useState("");

  // SEO Data
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Images
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await axios.get("/api/category/list");
        if (catRes.data.success) setCategories(catRes.data.categories);

        if (id) {
          const { data } = await axios.post("/api/product/single", { id });
          if (data.success) {
            const p = data.product;
            setName(p.name);
            setDescription(
              Array.isArray(p.description)
                ? p.description.join("\n")
                : p.description || ""
            );

            // CHANGED: Handle array vs legacy string data
            if (Array.isArray(p.category)) {
              setCategory(p.category);
            } else if (p.category) {
              setCategory([p.category]);
            } else {
              setCategory([]);
            }

            setBrand(p.brand || "");
            setPrice(p.price);
            setOfferPrice(p.offerPrice || "");
            setStock(p.stock || 0);
            setSku(p.sku || "");
            setExistingImages(p.images || []);
            setStatus(p.inStock ? "active" : "draft");
            setSizes(p.sizes || []);
            setColors(p.colors || []);
            setMetaTitle(p.metaTitle || "");
            setMetaDescription(p.metaDescription || "");
          } else {
            toast.error("Product not found");
            navigate("/admin/products");
          }
        }
      } catch (error) {
        toast.error("Error initializing page");
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id, axios, navigate]);

  // --- HANDLERS ---
  
  // NEW: Handle adding category from dropdown
  const handleAddCategory = (e) => {
    const selected = e.target.value;
    if (selected && !category.includes(selected)) {
      setCategory([...category, selected]);
    }
  };

  // NEW: Handle removing category chip
  const handleRemoveCategory = (catToRemove) => {
    setCategory(category.filter((c) => c !== catToRemove));
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const compressedFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        try {
          const compressed = await imageCompression(file, options);
          return new File([compressed], file.name, { type: compressed.type });
        } catch (error) {
          return file;
        }
      })
    );
    setFiles((prev) => [...prev, ...compressedFiles]);
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));
  const removeExistingImage = (index) =>
    setExistingImages(existingImages.filter((_, i) => i !== index));

  const addVariant = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "size" && currSize.trim()) {
        if (!sizes.includes(currSize.trim()))
          setSizes([...sizes, currSize.trim()]);
        setCurrSize("");
      }
      if (type === "color" && currColor.trim()) {
        if (!colors.includes(currColor.trim()))
          setColors([...colors, currColor.trim()]);
        setCurrColor("");
      }
    }
  };

  const removeVariant = (item, type) => {
    if (type === "size") setSizes(sizes.filter((s) => s !== item));
    if (type === "color") setColors(colors.filter((c) => c !== item));
  };

  // --- VALIDATION & SUBMIT ---
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (files.length === 0 && existingImages.length === 0) {
      return toast.error("Please upload at least one image");
    }
    if (Number(price) < 0) return toast.error("Price cannot be negative");
    if (Number(stock) < 0) return toast.error("Stock cannot be negative");
    if (offerPrice && Number(offerPrice) > Number(price)) {
      return toast.error("Offer price cannot be higher than regular price");
    }
    // Optional: Ensure at least one category is selected
    if (category.length === 0) {
        return toast.error("Please select at least one category");
    }

    setLoading(true);
    const toastId = toast.loading(
      id ? "Updating product..." : "Creating product..."
    );

    try {
      const productData = {
        id,
        name,
        category, // This is now an array
        brand,
        price,
        offerPrice,
        stock,
        sku,
        description: String(description),
        sizes,
        colors,
        metaTitle,
        metaDescription,
        images: existingImages,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      files.forEach((file) => formData.append("images", file));

      const endpoint = id ? "/api/product/update" : "/api/product/add";
      const { data } = await axios.post(endpoint, formData);

      if (data.success) {
        toast.success(data.message, { id: toastId });
        await fetchProducts();
        navigate("/admin/products");
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-slate-500">
        Loading...
      </div>
    );

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-screen bg-gray-100 pb-20 p-6 md:p-8 font-sans"
    >
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              {id ? "Edit Product" : "Add New Product"}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                General Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Your Title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Describe your product..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Media
              </h3>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-all mb-4">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {existingImages.map((img, index) => (
                  <div
                    key={`exist-${index}`}
                    className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {files.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative aspect-square rounded-lg overflow-hidden border border-indigo-200 ring-2 ring-indigo-500/20 group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Variants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sizes
                  </label>
                  <input
                    type="text"
                    value={currSize}
                    onChange={(e) => setCurrSize(e.target.value)}
                    onKeyDown={(e) => addVariant(e, "size")}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="Type & Enter"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {sizes.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-700"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeVariant(s, "size")}
                          className="ml-1.5 text-slate-400 hover:text-slate-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Colors
                  </label>
                  <input
                    type="text"
                    value={currColor}
                    onChange={(e) => setCurrColor(e.target.value)}
                    onKeyDown={(e) => addVariant(e, "color")}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="Type & Enter"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {colors.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-700"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => removeVariant(c, "color")}
                          className="ml-1.5 text-slate-400 hover:text-slate-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Search Engine Listing
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Add a title and description to see how this product might appear
                in a search engine listing.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder={name || "Product Title"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                    placeholder={
                      typeof description === "string" && description.length > 0
                        ? description.substring(0, 160)
                        : "Short description..."
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Status
              </h3>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Pricing */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Pricing
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Offer Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Organization (Categories) - CHANGED SECTION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Organization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Categories
                  </label>
                  
                  {/* Category Picker */}
                  <select
                    onChange={handleAddCategory}
                    value="" // Always reset
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none mb-3"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option 
                        key={c._id} 
                        value={c.name}
                        disabled={category.includes(c.name)}
                        className={category.includes(c.name) ? "text-gray-300" : ""}
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Selected Category Chips */}
                  <div className="flex flex-wrap gap-2">
                    {category.map((cat, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="ml-2 text-indigo-400 hover:text-indigo-900 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {category.length === 0 && (
                      <p className="text-sm text-slate-400 italic">No category selected</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Nike"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Inventory
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    disabled={Boolean(id)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddProduct;