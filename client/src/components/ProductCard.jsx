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
  const {
    currency,
    addToCart,
    navigate,
    wishlist,
    addToWishlist
  } = useAppContext();

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
    <div className="group relative w-full max-w-[260px] mx-auto bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-100 transition-all">
      
      {/* --- Image Area --- */}
      <div className="relative w-full aspect-square overflow-hidden bg-white">
        <div 
          onClick={handleNavigate} 
          className="w-full h-full cursor-pointer flex items-center justify-center p-6"
        >
          <img
            src={product.images[currentImgIndex] || "https://placehold.co/400"}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Top Right Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
          <button
            onClick={(e) => { e.stopPropagation(); addToWishlist(product._id); }}
            className={`p-2 rounded-full shadow-md cursor-pointer transition-colors ${isWishlisted ? "bg-red-50 text-red-500" : "bg-white text-[#1E2A5E] hover:bg-[#1E2A5E] hover:text-white"}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
            className="p-2 bg-white text-[#1E2A5E] rounded-full shadow-md hover:bg-[#1E2A5E] hover:text-white transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {product.images.length > 1 && (
          <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button onClick={prevImage} className="w-7 h-7 flex items-center justify-center bg-white text-[#1E2A5E] rounded-full shadow-md hover:bg-[#1E2A5E] hover:text-white pointer-events-auto">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextImage} className="w-7 h-7 flex items-center justify-center bg-white text-[#1E2A5E] rounded-full shadow-md hover:bg-[#1E2A5E] hover:text-white pointer-events-auto">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* --- Product Info --- */}
      <div className="text-center p-4 pt-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          {product.brand || "Brand"} 
        </p>

        <h3 onClick={handleNavigate} className="text-[#1E2A5E] font-bold text-[15px] cursor-pointer hover:opacity-80 transition-opacity line-clamp-1 mb-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[#1E2A5E] font-bold text-lg">{currency}{mainPrice}</span>
            {oldPrice && <span className="text-gray-400 text-xs line-through font-medium">{currency}{oldPrice}</span>}
        </div>

        <div className="w-full">
          <button 
            onClick={() => addToCart(product._id)}
            className="w-full bg-[#1E2A5E] text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-[#151f42] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 mx-auto whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;