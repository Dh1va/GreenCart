import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const BestSeller = () => {
  const { products } = useAppContext();
  const navigate = useNavigate();

  const trendingProducts = products.filter(product => {
      if (Array.isArray(product.category)) {
          return product.category.includes("New & Trending");
      }
      return product.category === "New & Trending";
  });

  // ✅ KEEP 10 ITEMS: This ensures we have enough products for 2 rows
  const displayProducts = trendingProducts.length > 0 
      ? trendingProducts.slice(0, 10) 
      : products.slice(0, 10);

  return (
    <section className="pt-10 pb-16  bg-white">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8 sm:mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E2A5E]">
            New & Trending
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg font-medium tracking-wide">
            Fresh arrivals this season
          </p>
        </div>

        {/* ✅ MOBILE OPTIMIZED GRID:
            - grid-cols-2: Mobile (Max width cards)
            - gap-3: Tighter gaps for mobile images
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 gap-y-8 sm:gap-y-10">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center px-4">
            <button
                onClick={() => {
                    navigate('/products');
                    window.scrollTo(0, 0);
                }}
                className="w-full sm:w-auto px-10 py-3 rounded-full border-2 border-[#1E2A5E] text-[#1E2A5E] font-bold text-sm tracking-wide uppercase hover:bg-[#1E2A5E] hover:text-white transition-all duration-300"
            >
                Shop All Products
            </button>
        </div>
      </div>
    </section>
  );
};


export default BestSeller;