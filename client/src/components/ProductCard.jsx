import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Heart,
  ShoppingCart,
  Eye,
  ChevronLeft,
  ChevronRight,
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
      setCurrentImgIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1,
      );
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
    <div className="group relative bg-white flex flex-col w-full mx-auto overflow-hidden">
      
      {/* --- Image Area --- */}
      <div className="relative w-full h-[200px] md:h-[280px] bg-white shrink-0 overflow-hidden">
        <div onClick={handleNavigate} className="w-full h-full cursor-pointer">
          <img
            src={product.images[currentImgIndex] || "https://placehold.co/400"}
            alt={product.name}
            className="w-full h-full object-contain transition-opacity duration-500"
          />
        </div>

        {/* Action Buttons (Top Right) - Tooltips slide with buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-3 z-10">
          
          {/* Wishlist Wrapper */}
          <div className="flex items-center justify-end group/wishlist">
             <span className="mr-2 px-2 py-1 bg-[#16255C] text-white text-[10px] rounded opacity-0 invisible lg:group-hover/wishlist:visible lg:group-hover/wishlist:opacity-100 transition-all duration-500 transform lg:translate-x-4 lg:group-hover/wishlist:translate-x-0 whitespace-nowrap">
              Add to Wishlist
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToWishlist(product._id);
              }}
              className={`p-2 rounded-full cursor-pointer transition-all duration-500 transform lg:translate-x-4 lg:group-hover:translate-x-0 ${
                isWishlisted ? "bg-[#16255C] text-white" : "bg-[#ECF2FE] text-[#16255C] hover:bg-[#16255C] hover:text-white"
              } lg:opacity-0 lg:group-hover:opacity-100 shadow-sm`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* View Product Wrapper */}
          <div className="hidden lg:flex items-center justify-end group/view">
            <span className="mr-2 px-2 py-1 bg-[#16255C] text-white text-[10px] rounded opacity-0 invisible group-hover/view:visible group-hover/view:opacity-100 transition-all duration-500 transform translate-x-4 group-hover/view:translate-x-0 whitespace-nowrap">
              View Product
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
              className="p-2 bg-[#ECF2FE] text-[#16255C] rounded-full hover:bg-[#16255C] hover:text-white transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slider Controls (Bottom Left) - Slide in from Left */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
            <button 
              onClick={prevImage} 
              className="w-7 h-7 flex items-center justify-center bg-[#ECF2FE] text-[#16255C] rounded-full shadow-sm hover:bg-[#16255C] hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextImage} 
              className="w-7 h-7 flex items-center justify-center bg-[#ECF2FE] text-[#16255C] rounded-full shadow-sm hover:bg-[#16255C] hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* --- Product Info --- */}
      <div className="flex flex-col flex-1 py-4 text-center">
        <p className="text-[14px]  text-[#16255C] uppercase  mb-1">
          {product.brand || "Brand"}
        </p>

        <h3
          onClick={handleNavigate}
          className="text-[#16255C]  text-lg md:text-lg cursor-pointer line-clamp-1 mb-2 hover:text-[#00838f] transition-colors"
        >
          {product.name}
        </h3>

        <div className="flex flex-col items-center justify-center mb-4">
          <span className="text-[#00838f] font-bold text-xl md:text-[26px] leading-none">
            {currency}{mainPrice}
          </span>
          {oldPrice && (
            <span className="text-gray-600 text-[14px] font-bold line-through mt-1">
              {currency}{oldPrice}
            </span>
          )}
        </div>

        {/* --- Add to Cart --- */}
        <div className="flex justify-center w-full mt-auto">
          <button
            onClick={() => addToCart(product._id)}
            className="group/btn relative px-8 h-[44px] bg-[#00838f] hover:bg-[#16255C] text-white rounded-lg transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-500 ease-in-out group-hover/btn:-translate-y-full px-2">
              <ShoppingCart className="w-5 h-5 shrink-0" />
              <span className="text-[18px] font-bold leading-tight">
                Add to cart
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center gap-2 translate-y-full transition-transform duration-500 ease-in-out group-hover/btn:translate-y-0 px-2">
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="text-[18px] font-bold leading-tight">
                Add to cart
              </span>
            </div>

            <div className="invisible flex items-center justify-center gap-2 px-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-[18px] font-bold">Add to cart</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;