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
  const { currency, addToCart, navigate, wishlist, addToWishlist } =
    useAppContext();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isWishlisted =
    Array.isArray(wishlist) && wishlist.includes(product._id);

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

  const mainPrice =
    product.offerPrice && product.offerPrice > 0
      ? product.offerPrice
      : product.price;
  const oldPrice =
    product.offerPrice &&
    product.offerPrice > 0 &&
    product.offerPrice < product.price
      ? product.price
      : null;

  const handleNavigate = () => {
    navigate(`/product/${product._id}`);
    window.scrollTo(0, 0);
  };

  return (
    /* FIXED: Changed w-[190px] to w-full and added max-w for desktop consistency */
    <div className="group relative bg-white flex flex-col w-full mx-auto md:max-w-[260px] h-auto">
      {/* --- Image Area (Fixed Height: 190px Mobile / 260px Desktop) --- */}
      <div className="relative w-full h-[190px] md:h-[260px] overflow-hidden bg-white shrink-0">
        <div
          onClick={handleNavigate}
          className="w-full h-full cursor-pointer flex items-center justify-center p-4"
        >
          <img
            src={product.images[currentImgIndex] || "https://placehold.co/400"}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Top Right Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToWishlist(product._id);
            }}
            className={`p-2 rounded-full shadow-sm cursor-pointer transition-colors ${isWishlisted ? "bg-[#1E2A5E] text-[#ECF2FE]" : "bg-[#ECF2FE] text-[#1E2A5E]"}`}
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="p-2 bg-[#ECF2FE] text-[#1E2A5E] rounded-full shadow-sm hidden sm:flex cursor-pointer"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {product.images.length > 1 && (
          <div className="absolute inset-y-0 left-0 w-full flex justify-between items-center px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button
              onClick={prevImage}
              className="w-7 h-7 flex items-center justify-center bg-[#ECF2FE] text-[#1E2A5E] rounded-full pointer-events-auto hover:bg-[#1E2A5E] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="w-7 h-7 flex items-center justify-center bg-[#ECF2FE] text-[#1E2A5E] rounded-full pointer-events-auto hover:bg-[#1E2A5E] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* --- Product Info --- */}
      <div className="flex flex-col flex-1 py-4 text-center bg-white">
        <p className="text-[10px] font-medium text-[#1E2A5E] uppercase tracking-widest mb-1">
          {product.brand || "Brand"}
        </p>

        <h3
          onClick={handleNavigate}
          className="text-[#1E2A5E] font-medium text-sm md:text-base cursor-pointer  line-clamp-1 mb-2 px-1"
        >
          {product.name}
        </h3>

        {/* Big Centered Price (32px) */}
        <div className="flex flex-col items-center justify-center mb-4 min-h-[50px]">
          <span className="text-[#00838f] font-bold text-2xl md:text-[26px] leading-none">
            {currency}
            {mainPrice}
          </span>
          {oldPrice && (
            <span className="text-gray-400 text-xs line-through mt-1">
              {currency}
              {oldPrice}
            </span>
          )}
        </div>

        {/* --- Add to Cart Button with Vertical Slide Animation --- */}
        <div className="flex justify-center w-full px-2 cursor-pointer">
          <button
            onClick={() => addToCart(product._id)}
            className="group/btn relative px-6 h-[44px] bg-[#00838f] hover:bg-[#1E2A5E] text-white rounded-lg transition-colors duration-300 overflow-hidden"
          >
            {/* Default State */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-500 ease-in-out group-hover/btn:-translate-y-full">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                Add To Cart
              </span>
            </div>

            {/* Hover State */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 translate-y-full transition-transform duration-500 ease-in-out group-hover/btn:translate-y-0">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                Add To Cart
              </span>
            </div>

            {/* Invisible spacer to maintain button width based on text length */}
            <div className="invisible flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Add To Cart
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
