import React, { useEffect, useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { ChevronDown, SlidersHorizontal, X, Check, ChevronLeft, ChevronRight } from "lucide-react";

const AllProducts = () => {
  const { products, categories, searchQuery, setSearchQuery } = useAppContext();
  
  // State for Filters & Sorting
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [showFilter, setShowFilter] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Standard grid count (3x4 or 4x3)

  // 1. Initialize selected categories
  useEffect(() => {
    if (searchQuery) {
        const matchingCat = categories.find(c => c.name.toLowerCase() === searchQuery.toLowerCase());
        if (matchingCat) {
            setSelectedCategories([matchingCat._id]);
        }
    }
  }, [searchQuery, categories]);

  // 2. Reset Page on Filter Change (CRITICAL UX STEP)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, sortType]);

  // 3. Toggle Category Filter
  const toggleCategory = (e, categoryId) => {
    if (e.target.checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  // 4. Main Filtering & Sorting Logic
  const processedProducts = useMemo(() => {
    let data = [...products];

    // Filter by Stock
    data = data.filter((p) => (p.stock ?? 0) > 0);

    // Filter by Search
    if (searchQuery && !selectedCategories.length) {
       const query = searchQuery.toLowerCase();
       data = data.filter(p => {
         const pCats = Array.isArray(p.category) ? p.category : [p.category];
         const nameMatch = p.name.toLowerCase().includes(query);
         const catMatch = pCats.some(cat => 
            (typeof cat === 'object' ? cat.name : cat).toLowerCase().includes(query)
         );
         return nameMatch || catMatch;
       });
    }

    // Filter by Category
    if (selectedCategories.length > 0) {
      const selectedCategoryNames = categories
        .filter(c => selectedCategories.includes(c._id))
        .map(c => c.name.toLowerCase());

      data = data.filter((product) => {
        const productCats = Array.isArray(product.category) ? product.category : [product.category];
        return productCats.some(cat => {
            const pId = typeof cat === 'object' ? cat._id : cat;
            const pName = typeof cat === 'object' ? cat.name : cat;
            return selectedCategories.includes(pId) || (typeof pName === 'string' && selectedCategoryNames.includes(pName.toLowerCase()));
        });
      });
    }

    // Sorting
    switch (sortType) {
      case "price-low": data.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price)); break;
      case "price-high": data.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price)); break;
      case "alpha-asc": data.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "alpha-desc": data.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "date-new": data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case "date-old": data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      default: break;
    }

    return data;
  }, [products, searchQuery, selectedCategories, sortType, categories]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = processedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll top on page change
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-12 space-y-2">
         <h1 className="text-4xl font-bold text-[#1E2A5E]">
            {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
         </h1>
         <p className="text-gray-500 max-w-xl">
            Discover a world of fun and imagination with our Collection!
         </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* === LEFT SIDEBAR (Sticky) === */}
        <div className={`
            lg:w-1/4 lg:block
            /* 👇 STICKY LOGIC HERE */
            lg:sticky lg:top-24 lg:h-[80vh] lg:overflow-y-auto lg:scrollbar-thin
            ${showFilter ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'}
        `}>
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center lg:hidden mb-6">
                <h2 className="text-xl font-bold text-[#1E2A5E]">Filters</h2>
                <button onClick={() => setShowFilter(false)}>
                    <X className="w-6 h-6 text-gray-500" />
                </button>
            </div>

            {/* Filter Group: Categories */}
            <div className="border-b border-gray-100 pb-8 mb-8">
                <h3 className="text-md font-bold text-[#1E2A5E] mb-5 uppercase tracking-wide">Category</h3>
                <div className="space-y-3">
                    {categories.map((cat) => (
                        <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-[#008779] checked:bg-[#008779] hover:border-[#008779]"
                                    onChange={(e) => toggleCategory(e, cat._id)}
                                    checked={selectedCategories.includes(cat._id)}
                                />
                                <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-gray-600 group-hover:text-[#008779] transition-colors select-none">
                                {cat.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

             
        </div>

        {/* === RIGHT CONTENT === */}
        <div className="flex-1">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100 gap-4">
                <p className="text-sm font-bold text-gray-900">
                    {processedProducts.length} Products Found
                </p>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button 
                        onClick={() => setShowFilter(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm font-bold text-[#1E2A5E]"
                    >
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                    </button>

                    <div className="relative group ml-auto sm:ml-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Sort by:</span>
                            <div className="relative">
                                <select 
                                    onChange={(e) => setSortType(e.target.value)}
                                    className="appearance-none bg-transparent pl-2 pr-8 py-1 text-sm font-bold text-[#1E2A5E] cursor-pointer outline-none focus:text-[#008779]"
                                >
                                    <option value="relevant">Featured</option>
                                    <option value="alpha-asc">Alphabetically, A-Z</option>
                                    <option value="alpha-desc">Alphabetically, Z-A</option>
                                    <option value="price-low">Price, low to high</option>
                                    <option value="price-high">Price, high to low</option>
                                    <option value="date-new">Date, new to old</option>
                                    <option value="date-old">Date, old to new</option>
                                </select>
                                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid (Mapped from currentProducts, not processedProducts) */}
            {currentProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
                        {currentProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {/* --- Pagination Controls --- */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-16 gap-2">
                            
                            {/* Prev Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1E2A5E] hover:text-white hover:border-[#1E2A5E]'}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Page Numbers */}
                            {[...Array(totalPages)].map((_, index) => {
                                const page = index + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                                            currentPage === page 
                                            ? 'bg-[#1E2A5E] text-white shadow-lg shadow-blue-900/20' 
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1E2A5E] hover:text-white hover:border-[#1E2A5E]'}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="py-20 text-center bg-gray-50 rounded-xl">
                    <p className="text-xl text-gray-400 font-medium">No products match your selection.</p>
                    <button 
                        onClick={() => { setSelectedCategories([]); setSearchQuery(""); }}
                        className="mt-4 text-[#008779] font-bold underline underline-offset-4"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default AllProducts;