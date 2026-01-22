import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { ChevronDown } from "lucide-react";

const AllProducts = () => {
  // 1. Get 'categories' from context to check against the search query
  const { products, searchQuery, setSearchQuery, categories } = useAppContext();
  const [displayProducts, setDisplayProducts] = useState([]);
  const [sortBy, setSortBy] = useState("relevant");

  // Combine Search + Stock Check + Sorting
  useEffect(() => {
    let data = [...products];

    // 1. Filter by Stock
    data = data.filter((product) => (product.stock ?? 0) > 0);

    // 2. Filter by Search (Name OR Category)
    if (searchQuery && searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      
      data = data.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query);
        let categoryMatch = false;
        if (Array.isArray(product.category)) {
          categoryMatch = product.category.some((c) => 
            c.toLowerCase().includes(query)
          );
        } else if (typeof product.category === 'string') {
          categoryMatch = product.category.toLowerCase().includes(query);
        }
        return nameMatch || categoryMatch;
      });
    }

    // 3. Sort Logic
    switch (sortBy) {
      case "price-low":
        data.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        data.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      default:
        break; 
    }

    setDisplayProducts(data);
  }, [products, searchQuery, sortBy]);

  // --- Logic to determine Title ---
  // Check if the current search query exactly matches a known category name
  const isCategory = searchQuery && categories.some(
    (cat) => cat.name.toLowerCase() === searchQuery.toLowerCase()
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-24">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        
        {/* Title & Count */}
        <div className="space-y-1">
          {/* 👇 UPDATED TITLE LOGIC */}
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight capitalize">
            {!searchQuery 
              ? "All Products" 
              : isCategory 
                ? searchQuery 
                : <span className="text-2xl md:text-3xl text-gray-700">Matching results for "{searchQuery}"</span>
            }
          </h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
            {displayProducts.length} {displayProducts.length === 1 ? 'Item' : 'Items'} Found
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full cursor-pointer hover:border-gray-400 transition-colors">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-semibold text-gray-900 bg-transparent outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="relevant">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 pointer-events-none absolute right-4" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Grid Section (No Animation) --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {displayProducts.map((product) => (
          <div key={product._id} className="group">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* --- Empty State --- */}
      {displayProducts.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-xl text-gray-400 font-light">No products match your criteria.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-4 text-sm text-gray-900 underline underline-offset-4 hover:text-gray-600"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProducts;