import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Heart, Lock, ArrowRight } from "lucide-react";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const { 
    wishlist, 
    products, 
    user, 
    navigate,
    fetchProducts 
  } = useAppContext();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Filter full product details from IDs in wishlist
  useEffect(() => {
    if (products.length > 0 && wishlist) {
      const items = products.filter((p) => wishlist.includes(p._id));
      setWishlistProducts(items);
      setLoading(false);
    } else if (products.length === 0) {
        // Fallback if products aren't loaded yet
        fetchProducts(); 
    }
  }, [wishlist, products]);

  if (!user) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E2A5E] mb-2">Please Login</h2>
              <p className="text-gray-500 mb-8 max-w-sm">
                  You need to be logged in to view your saved items.
              </p>
              <button 
                  onClick={() => navigate('/login')} 
                  className="bg-[#1E2A5E] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#151f42] transition-all"
              >
                  Login Now
              </button>
          </div>
      )
  }

  if (loading) {
      return (
          <div className="min-h-screen pt-20 text-center text-gray-500">
              Loading your favorites...
          </div>
      );
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        
        {/* Header - Centered */}
        <div className="mb-12 text-center flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E2A5E] tracking-tight flex items-center gap-3 justify-center">
              My Wishlist 
              <span className="text-lg text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                {wishlist.length}
              </span>
            </h1>
            <p className="text-gray-500 mt-3 max-w-lg">
                Your personal collection of favorites. saved items you want to buy later.
            </p>
            
            {wishlist.length > 0 && (
                <button 
                    onClick={() => navigate("/products")}
                    className="mt-6 text-sm font-bold text-[#008779] hover:text-teal-700 flex items-center gap-1 group"
                >
                    Continue Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            )}
        </div>

        {/* Content - Using Existing ProductCard */}
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
            {wishlistProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-red-300" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E2A5E] mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 max-w-sm text-center mb-8">
                Seems like you don't have any wishes yet. Browse products and heart them to save for later!
            </p>
            <button 
                onClick={() => navigate("/products")}
                className="px-8 py-3 bg-[#1E2A5E] text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-[#151f42] transition-all"
            >
                Start Exploring
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;