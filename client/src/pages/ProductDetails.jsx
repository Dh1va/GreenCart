import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { 
  Star, 
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check 
} from "lucide-react";

const ProductDetails = () => {
  const { products, currency, addToCart, navigate } = useAppContext();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

  // 1. Fetch Product Data & Scroll to Top
  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (products.length > 0) {
      const foundProduct = products.find((item) => item._id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setMainImage(foundProduct.images[0]); 
      }
    }
  }, [id, products]);

  // 2. Logic for Related Products
  useEffect(() => {
    if (!product || products.length === 0) return;

    // Handle string vs array category types
    const currentCats = Array.isArray(product.category) ? product.category : [product.category];

    const related = products.filter((p) => {
      if (p._id === product._id) return false;
      
      const pCats = Array.isArray(p.category) ? p.category : [p.category];
      // Check if any category matches
      return pCats.some((c) => currentCats.includes(c));
    });

    setRelatedProducts(related.slice(0, 4));
  }, [product, products]);

  if (!product) return <div className="h-screen flex items-center justify-center text-[#1E2A5E]">Loading...</div>;

  // Price Calculation
  const currentPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;
  const oldPrice = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price ? product.price : null;

  return (
    <div className="pt-10 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* --- Breadcrumbs --- */}
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mb-10">
          <Link to="/" className="hover:text-[#008779] transition-colors">Home</Link> 
          <span>/</span>
          <Link to="/products" className="hover:text-[#008779] transition-colors">Products</Link> 
          <span>/</span>
          <span className="font-medium text-[#1E2A5E] truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* --- Main Content --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left: Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto gap-3 justify-between lg:justify-start lg:w-24 w-full no-scrollbar pb-2 lg:pb-0">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => setMainImage(img)}
                  className={`cursor-pointer border-2 rounded-lg overflow-hidden w-[70px] h-[70px] lg:w-full lg:h-24 flex-shrink-0 transition-all ${mainImage === img ? 'border-[#008779]' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain bg-gray-50" />
                </div>
              ))}
            </div>

            {/* Main Display Image */}
            <div className="flex-1 bg-gray-50 rounded-2xl flex items-center justify-center p-6 aspect-square lg:aspect-auto border border-gray-100 relative">
               {product.offerPrice > 0 && (
                 <span className="absolute top-4 left-4 bg-[#008779] text-white text-xs font-bold px-3 py-1 rounded-full">
                   SALE
                 </span>
               )}
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain max-h-[500px]" />
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#1E2A5E] mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
              ))}
              <span className="text-sm text-gray-500 ml-2">(12 Reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6 border-b border-gray-100 pb-6">
              <span className="text-4xl font-bold text-[#008779]">
                {currency}{currentPrice}
              </span>
              {oldPrice && (
                <span className="text-xl text-gray-400 line-through mb-1">
                  {currency}{oldPrice}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
                <h3 className="font-bold text-[#1E2A5E] mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {product.description}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={() => addToCart(product._id)}
                className="flex-1 bg-[#008779] text-white font-bold py-4 px-8 rounded-full hover:bg-[#007065] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              
              <button 
                onClick={() => {
                  addToCart(product._id);
                  navigate('/cart');
                }}
                className="flex-1 border-2 border-[#1E2A5E] text-[#1E2A5E] font-bold py-4 px-8 rounded-full hover:bg-[#1E2A5E] hover:text-white transition-all shadow-sm active:scale-95"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges / Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 border border-gray-100 p-3 rounded-lg">
                    <Truck className="w-5 h-5 text-[#1E2A5E]" />
                    <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 border border-gray-100 p-3 rounded-lg">
                    <Check className="w-5 h-5 text-[#1E2A5E]" />
                    <span>In Stock</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 border border-gray-100 p-3 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-[#1E2A5E]" />
                    <span>Secure Pay</span>
                </div>
            </div>

          </div>
        </div>

        {/* --- Related Products Section --- */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-gray-100 pt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1E2A5E] mb-2">Related Products</h2>
              <div className="w-16 h-1 bg-[#008779] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;