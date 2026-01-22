import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom'; // 👈 Added useNavigate
import ProductCard from './ProductCard';

const BestSeller = () => {
  const { products } = useAppContext();
  const navigate = useNavigate(); // 👈 Initialize hook

  // 1. Filter for "New & Trending" category
  // 2. Fallback to first 4 products if specific category is empty (for demo purposes)
  const trendingProducts = products.filter(product => {
      // Check if category is a string or array and includes the target
      if (Array.isArray(product.category)) {
          return product.category.includes("New & Trending");
      }
      return product.category === "New & Trending";
  });

  // If we have trending products, use them; otherwise take the first 4 general products
  const displayProducts = trendingProducts.length > 0 
      ? trendingProducts.slice(0, 4) 
      : products.slice(0, 4);

  return (
    <section className="py-16 bg-white"> {/* Adjusted py-15 to standard py-16 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header --- */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E2A5E]">
            New & Trending
          </h2>
          <p className="text-gray-500 text-lg font-medium tracking-wide">
            Fresh arrivals this season
          </p>
        </div>

        {/* --- Product Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* --- Shop All Button --- */}
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