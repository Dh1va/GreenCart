import React from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const BestSeller = () => {
  const { products } = useAppContext();
  const navigate = useNavigate();

  const trendingProducts = products.filter((product) => {
    if (Array.isArray(product.category)) {
      return product.category.includes("New & Trending");
    }
    return product.category === "New & Trending";
  });

  const displayProducts =
    trendingProducts.length > 0
      ? trendingProducts.slice(0, 10)
      : products.slice(0, 10);

  return (
    <section className="pt-10 md:pt-10 md:pb-10 mb-10 bg-white">
      {/* Updated padding and removed 'container mx-auto' to match Navbar/Footer exactly */}
      <div className=" pt-10">
        
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-[44px] font-semibold text-[#16255C]">
            New & Trending
          </h2>
          <p className="text-[#16255C] text-md">
            Fresh arrivals this season
          </p>
        </div>

        {/* Updated grid gaps and alignment */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 gap-y-8 sm:gap-y-10">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <button
            onClick={() => {
              navigate("/products");
              window.scrollTo(0, 0);
            }}
            className="group relative w-full sm:w-auto px-10 py-3 h-[48px] rounded-md border-2 border-[#16255C] bg-white text-[#16255C] font-bold text-sm tracking-wide uppercase transition-all duration-300 overflow-hidden"
          >
            {/* Layer 1: Initial State */}
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
              <span className="whitespace-nowrap">Shop All Products</span>
            </div>

            {/* Layer 2: Hover State */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#16255C] text-white translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0">
              <span className="whitespace-nowrap">Shop All Products</span>
            </div>

            <div className="invisible px-2">Shop All Products</div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;