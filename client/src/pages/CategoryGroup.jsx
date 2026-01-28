import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ArrowLeft, ShoppingBag, ArrowUpRight } from "lucide-react";

const CategoryGroup = () => {
  const { group } = useParams(); 
  const navigate = useNavigate();
  const { categories, setSearchQuery, fetchCategoriesOnce } = useAppContext();

  useEffect(() => {
    fetchCategoriesOnce();
    window.scrollTo(0, 0);
  }, []);

  const groupCategories = useMemo(() => {
    if (!categories || !group) return [];
    const decodedGroup = decodeURIComponent(group);
    return categories.filter(
      (cat) => cat.groupId && cat.groupId.name === decodedGroup
    );
  }, [categories, group]);

  const toSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // --- HANDLER: Category Click ---
  const handleCategoryClick = (categoryName) => {
    const slug = toSlug(categoryName);
    navigate(`/products/${slug}`); // Navigate to dynamic category page
    setSearchQuery(""); // Clear search to avoid conflicts
    setOpen(false); // Close mobile menu
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="min-h-screen  pt-12 pb-24">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-28">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <button 
              onClick={() => navigate("/")} 
              className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1E2A5E] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#1E2A5E] transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> 
              </div>
              <span>Back to Home</span>
            </button>
            
            <div>
              <span className="text-[#008779] font-bold tracking-widest text-xs uppercase mb-2 block">Collection</span>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1E2A5E] tracking-tight">
                {decodeURIComponent(group)}
              </h1>
            </div>
          </div>

          <p className="text-gray-500 max-w-md text-sm md:text-base leading-relaxed">
            Curated selection of high-quality {decodeURIComponent(group).toLowerCase()} items. 
            Explore categories designed for performance and style.
          </p>
        </div>

        {/* --- Content Grid --- */}
        {groupCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {groupCategories.map((cat) => (
              <div 
                key={cat._id}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative cursor-pointer w-full h-full"
              >
                {/* Card Container */}
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 aspect-[3/4] hover:shadow-2xl hover:shadow-[#1E2A5E]/10 transition-all duration-500">
                  
                  {/* Image with Zoom & Grayscale-to-Color Effect */}
                  <img
                    src={cat.image || "https://placehold.co/600x800?text=No+Image"} 
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                  />

                  {/* Dark Gradient Overlay (Bottom) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                  {/* Content Box (Glassmorphism Style) */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center justify-between group-hover:bg-white transition-all duration-300">
                      
                      <div className="overflow-hidden">
                        <h3 className="text-white font-bold text-lg leading-tight group-hover:text-[#1E2A5E] transition-colors truncate">
                          {cat.name}
                        </h3>
                        <p className="text-white/70 text-xs mt-1 group-hover:text-gray-500 transition-colors">
                          Explore Products
                        </p>
                      </div>

                      {/* Icon Circle */}
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1E2A5E] group-hover:bg-[#1E2A5E] group-hover:text-white transition-all duration-300 shadow-lg">
                        <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300 animate-pulse">
               <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E2A5E] mb-2">No Categories Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              We couldn't find any categories associated with this collection at the moment.
            </p>
            <button 
              onClick={() => navigate("/")} 
              className="px-8 py-3 bg-[#1E2A5E] text-white rounded-full font-bold text-sm hover:bg-[#151f45] hover:shadow-lg transition-all"
            >
                Return to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryGroup;