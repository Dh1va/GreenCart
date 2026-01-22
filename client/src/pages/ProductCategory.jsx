import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const ProductCategory = () => {
  const { products, categories } = useAppContext();
  const { category } = useParams();

  // 1. RESOLVE CATEGORY NAME
  // If 'category' param is an ID (e.g., 6960...), find the matching name from categories list.
  // Otherwise, use the param directly (e.g., "Men").
  const categoryName = useMemo(() => {
    if (!categories) return category;
    const foundCat = categories.find(c => c._id === category || c.name.toLowerCase() === category.toLowerCase());
    return foundCat ? foundCat.name : category;
  }, [categories, category]);

  // 2. FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    if (!product?.category) return false;
    
    // Handle both array and string categories
    const productCategories = Array.isArray(product.category) 
      ? product.category 
      : [product.category];

    // Check if any product category matches the resolved URL category name
    return productCategories.some(
      (cat) => String(cat).toLowerCase() === String(categoryName).toLowerCase()
    );
  });

  return (
    <div className="pt-10 pb-20 min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- Header --- */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E2A5E] capitalize">
            {categoryName?.replace('-', ' ')}
          </h2>
          <div className="w-16 h-1 bg-[#008779] mx-auto rounded-full"></div>
          <p className="text-gray-500 text-lg font-medium">
            Explore our collection
          </p>
        </div>

        {/* --- Grid --- */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[40vh] text-center">
            <p className="text-2xl font-bold text-[#1E2A5E] mb-2">No products found</p>
            <p className="text-gray-500">
              We couldn't find any items in the <span className="font-bold">"{categoryName}"</span> category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCategory;