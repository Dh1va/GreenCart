import React, { useState, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import toast from "react-hot-toast";

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); 
  const [search, setSearch] = useState("");

  // Get Category from URL
  const categoryFilter = searchParams.get("category");

  /* ---------------- HANDLERS ---------------- */

  const handleEdit = (id) => {
    navigate(`/admin/products/edit-product/${id}`);
  };

  const handleAddNew = () => {
    navigate("/admin/products/add-product");
  };

  const clearFilter = () => {
    setSearchParams({}); 
  };

  /* ---------------- FILTER ---------------- */

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();

    let data = products;

    // 1. Apply Category Filter (UPDATED FOR ARRAY SUPPORT)
    if (categoryFilter) {
      data = data.filter((p) => {
        if (Array.isArray(p.category)) {
          return p.category.includes(categoryFilter);
        }
        return p.category === categoryFilter;
      });
    }

    // 2. Apply Search Filter
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term))
    );
  }, [products, search, categoryFilter]);

  /* ---------------- UI ---------------- */

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col relative  font-sans">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Products
            </h2>

            {/* Show Filter Badge if active */}
            {categoryFilter ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Filtered by: </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  {categoryFilter}
                  <button
                    onClick={clearFilter}
                    className="ml-1.5 hover:text-indigo-900 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                Manage your product catalog.
              </p>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2.5 w-64 bg-white border border-gray-200 rounded-lg text-sm
              focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm"
            />

            <button
              onClick={handleAddNew}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3
              rounded-lg font-semibold shadow-lg shadow-gray-900/20 transition-all"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Inventory</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            <img
                              src={p.images?.[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.brand || "No Brand"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category - UPDATED TO SHOW CHIPS */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(p.category) ? (
                            p.category.map((cat, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                             // Fallback for old string data
                             <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                               {p.category}
                             </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium border ${
                            p.stock === 0
                              ? "bg-gray-100 text-gray-600 border-gray-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }`}
                        >
                          {p.stock === 0 ? "Out of Stock" : "Active"}
                        </span>
                      </td>

                      {/* Inventory */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.stock} in stock
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-sm">
                        {p.offerPrice ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">
                              {currency}
                              {p.offerPrice}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {currency}
                              {p.price}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {currency}
                            {p.price}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(p._id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-4"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;