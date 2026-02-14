import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

import {
  ShoppingCart,
  Truck,
  RotateCcw,
  CheckCircle,
  Eye,
  Share2,
  Heart,
  Minus,
  Plus,
  Info,
} from "lucide-react";

const ProductDetails = () => {
  const { products, addToCart, addToWishlist, wishlist, setSuppressCartAutoOpen } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

  // UI States
  const [quantity, setQuantity] = useState(1);
  const [viewers, setViewers] = useState(12);

  // Accordion States
  const [openSection, setOpenSection] = useState("description");

  useEffect(() => {
    window.scrollTo(0, 0);
    setViewers(Math.floor(Math.random() * (20 - 5 + 1)) + 5);

    if (products.length > 0) {
      const foundProduct = products.find((item) => item._id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setMainImage(foundProduct.images[0]);
      }
    }
  }, [id, products]);

  useEffect(() => {
    if (!product || products.length === 0) return;
    const currentCats = Array.isArray(product.category) ? product.category : [product.category];
    const related = products.filter((p) => {
      if (p._id === product._id) return false;
      const pCats = Array.isArray(p.category) ? p.category : [p.category];
      return pCats.some((c) => currentCats.includes(c));
    });
    setRelatedProducts(related.slice(0, 4));
  }, [product, products]);

  if (!product)
    return (
      <div className="h-screen flex items-center justify-center text-[#1E2A5E]">
        Loading...
      </div>
    );

  const currentPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: product?.name || "Product",
          text: "Check out this product!",
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.log("Share failed:", error);
    }
  };

  const handleBuyNow = () => {
    setSuppressCartAutoOpen(true);
    addToCart(product._id, quantity);
    navigate("/checkout");
  };

  return (
    <div className="pt-6 pb-10 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        {/* --- Breadcrumbs --- */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 mb-8">
          <Link to="/" className="hover:text-[#1E2A5E]">Home</Link>
          <span>/</span>
          <span className="cursor-pointer hover:text-[#1E2A5E]" onClick={() => navigate("/products")}>Products</span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-3 w-full md:w-20 flex-shrink-0 no-scrollbar">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(img)}
                  className={`cursor-pointer border rounded-lg overflow-hidden w-20 h-20 flex-shrink-0 bg-white p-2 ${mainImage === img ? "border-[#1E2A5E]" : "border-transparent hover:border-gray-200"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-8 relative min-h-[350px] md:min-h-[550px]">
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain max-h-[550px]" />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">VENDOR: {product.brand || "WOKIEE"}</p>
              <h1 className="text-2xl md:text-3xl font-medium text-[#1E2A5E] mb-2 leading-tight">{product.name}</h1>
              <div className="mb-1">
                <span className="text-3xl font-bold text-[#008779]">₹{currentPrice}</span>
              </div>
              <p className="text-xs text-gray-500">Taxes included. <span className="text-[#008779] underline cursor-pointer">Shipping</span> calculated at checkout.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#1E2A5E] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> {viewers}
              </div>
              <span className="text-sm text-[#1E2A5E] font-medium">People are currently viewing this</span>
            </div>

            <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
              <CheckCircle className="w-4 h-4" /> In stock!
            </div>

            {/* ---  CONTROLS SECTION --- */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Quantity & Wishlist (Mobile Row) */}
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="flex items-center bg-gray-100 rounded-lg h-12 flex-1 sm:w-32 sm:flex-none px-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center hover:text-[#008779]"><Minus className="w-4 h-4" /></button>
                    <input className="w-full bg-transparent text-center font-bold text-[#1E2A5E] outline-none" value={quantity} readOnly />
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center hover:text-[#008779]"><Plus className="w-4 h-4" /></button>
                  </div>
                  
                  {/* Mobile Wishlist Button */}
                  <button onClick={() => addToWishlist(product._id)} className={`w-12 h-12 rounded-lg border border-gray-200 flex sm:hidden items-center justify-center transition-colors ${wishlist && wishlist.includes(product._id) ? "bg-red-50 text-red-500 border-red-200" : "text-[#1E2A5E] hover:bg-gray-50"}`}>
                    <Heart className={`w-5 h-5 ${wishlist && wishlist.includes(product._id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button onClick={() => addToCart(product._id, quantity)} className="flex-1 bg-[#008779] text-white font-bold rounded-lg h-auto py-4 flex items-center justify-center gap-2 hover:bg-[#007065] transition-all active:scale-95 shadow-sm">
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>

                {/* Desktop Wishlist Button */}
                <button onClick={() => addToWishlist(product._id)} className={`w-12 h-12 rounded-full border border-gray-200 hidden sm:flex items-center justify-center transition-colors ${wishlist && wishlist.includes(product._id) ? "bg-red-50 text-red-500 border-red-200" : "text-[#1E2A5E] hover:bg-gray-50"}`}>
                  <Heart className={`w-5 h-5 ${wishlist && wishlist.includes(product._id) ? "fill-current" : ""}`} />
                </button>
              </div>

              <button onClick={handleBuyNow} className="w-full h-12 rounded-lg font-bold text-sm uppercase tracking-wide mb-8 transition-all bg-[#1E2A5E] text-white hover:bg-[#151f42] active:scale-[0.98] shadow-md">
                Buy it now
              </button>

              {/* --- ACCORDIONS --- */}
              <div className="border-t border-gray-200">
                <div className="border-b border-gray-200">
                  <button onClick={() => toggleSection("description")} className="w-full py-4 flex items-center justify-between text-[#1E2A5E] font-bold text-sm">
                    <span className="flex items-center gap-2"><Info className="w-4 h-4" /> Description</span>
                    {openSection === "description" ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openSection === "description" ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <button onClick={() => toggleSection("shipping")} className="w-full py-4 flex items-center justify-between text-[#1E2A5E] font-bold text-sm">
                    <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> Shipping & Returns</span>
                    {openSection === "shipping" ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openSection === "shipping" ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
                    <div className="space-y-4 pt-2">
                      <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Truck className="w-4 h-4 text-[#1E2A5E]" />
                          <span>Standard delivery within 2–5 business days</span>
                        </div>
                        <div className="h-px bg-gray-200 w-full"></div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <RotateCcw className="w-4 h-4 text-[#1E2A5E]" />
                          <span>Return items in original condition for a full refund</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleShare} className="w-full border border-gray-200 text-[#1E2A5E] font-bold py-3 rounded-lg mt-8 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm uppercase">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* --- RELATED PRODUCTS --- */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 mb-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E2A5E] mb-2">You Might Also Like</h2>
              <p className="text-gray-500 text-sm">Product recommendations</p>
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