import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const ProductCategory = () => {
  const { products, categories } = useAppContext();
  const { category } = useParams();

  const toSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // 1. RESOLVE CATEGORY NAME
  const categoryName = useMemo(() => {
    if (!categories) return category;

    const foundCat = categories.find(
      (c) => toSlug(c.name) === category || c._id === category,
    );

    return foundCat ? foundCat.name : category;
  }, [categories, category]);

  // 2. FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    if (!product?.category) return false;

    const productCategories = Array.isArray(product.category)
      ? product.category
      : [product.category];

    return productCategories.some(
      (cat) => toSlug(String(cat)) === toSlug(String(categoryName)),
    );
  });

  return (
    <div className="pt-10 pb-20 min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-8">

        {/* --- Breadcrumbs --- */}
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mb-10">
          <Link to="/" className="hover:text-[#008779] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            to="/products"
            className="hover:text-[#008779] transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <span className="font-medium text-[#1E2A5E] capitalize">
            {categoryName}
          </span>
        </div>

        {/* --- Header --- */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E2A5E] capitalize">
              {categoryName}
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
            <p className="text-2xl font-bold text-[#1E2A5E] mb-2">
              No products found
            </p>
            <p className="text-gray-500">
              We couldn't find any items in the{" "}
              <span className="font-bold">"{categoryName}"</span> category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCategory;
