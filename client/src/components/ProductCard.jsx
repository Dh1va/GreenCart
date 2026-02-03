import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

const ProductCard = ({ product }) => {
  const { currency, addToCart, navigate, wishlist, addToWishlist } = useAppContext();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const isWishlisted = Array.isArray(wishlist) && wishlist.includes(product._id);

  const nextImage = (e) => {
    e.stopPropagation();
    if (product.images.length > 1) {
      setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (product.images.length > 1) {
      setCurrentImgIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  if (!product) return null;

  const mainPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;
  const oldPrice = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price ? product.price : null;

  const handleNavigate = () => {
    navigate(`/product/${product._id}`); 
    window.scrollTo(0, 0);
  };

  return (
    <div className="group relative w-full bg-white rounded-xl overflow-hidden   flex flex-col h-full ">
      
      {/* --- Image Area --- */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square overflow-hidden bg-white shrink-0">
        <div 
          onClick={handleNavigate} 
          className="w-full h-full cursor-pointer flex items-center justify-center p-2 sm:p-6"
        >
          <img
            src={product.images[currentImgIndex] || "https://placehold.co/400"}
            alt={product.name}
            // ✅ "object-contain" ensures the full product is seen, "w-full h-full" fills the box
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Top Right Action Buttons - Adjusted for mobile visibility */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 sm:translate-x-12 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 transition-all duration-300 ease-out z-10">
          <button
            onClick={(e) => { e.stopPropagation(); addToWishlist(product._id); }}
            className={`p-2 rounded-full shadow-md cursor-pointer transition-colors ${isWishlisted ? "bg-red-50 text-red-500" : "bg-white/90 backdrop-blur-sm text-[#1E2A5E]"}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
            className="p-2 bg-white/90 backdrop-blur-sm text-[#1E2A5E] rounded-full shadow-md hidden sm:flex"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Arrows - Hidden on small mobile to avoid clutter */}
        {product.images.length > 1 && (
          <div className="absolute inset-y-0 left-0 w-full hidden sm:flex justify-between items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button onClick={prevImage} className="w-7 h-7 flex items-center justify-center bg-white text-[#1E2A5E] rounded-full shadow-md pointer-events-auto hover:bg-[#1E2A5E] hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextImage} className="w-7 h-7 flex items-center justify-center bg-white text-[#1E2A5E] rounded-full shadow-md pointer-events-auto hover:bg-[#1E2A5E] hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* --- Product Info --- */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 pt-1 sm:pt-2">
        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
          {product.brand || "Brand"} 
        </p>

        <h3 onClick={handleNavigate} className="text-[#1E2A5E] font-bold text-sm sm:text-[15px] cursor-pointer hover:text-[#008779] transition-colors line-clamp-2 min-h-[2.5rem] leading-tight mb-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3 mt-auto">
            <span className="text-[#1E2A5E] font-bold text-base sm:text-lg">{currency}{mainPrice}</span>
            {oldPrice && <span className="text-gray-400 text-[10px] sm:text-xs line-through font-medium">{currency}{oldPrice}</span>}
        </div>

        {/* --- Add to Cart Button --- */}
        <div className="w-full">
          <button 
            onClick={() => addToCart(product._id)}
            className="w-full bg-[#1E2A5E] text-white text-[11px] sm:text-sm font-semibold py-2 sm:py-2.5 px-2 rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 overflow-hidden"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;