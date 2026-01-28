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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E2A5E]">
            New & Trending
          </h2>
          <p className="text-gray-500 text-lg font-medium tracking-wide">
            Fresh arrivals this season
          </p>
        </div>

        {/* ✅ GRID CONFIGURATION FOR 2 ROWS:
           - grid-cols-2: Mobile (2 per row x 5 rows)
           - md:grid-cols-3: Tablets (3 per row)
           - lg:grid-cols-5: Desktop (5 per row x 2 rows = 10 items)
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 gap-y-10">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-16 text-center">
            <button
                onClick={() => {
                    navigate('/products');
                    window.scrollTo(0, 0);
                }}
                className="px-10 py-3 rounded-full border-2 border-[#1E2A5E] text-[#1E2A5E] font-bold text-sm tracking-wide uppercase hover:bg-[#1E2A5E] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
            >
                Shop All Products
            </button>
        </div>

      </div>
    </section>
  );
};

export default BestSeller;