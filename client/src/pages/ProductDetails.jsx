import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Testimonials from "../components/Testimonials";
import {
  Star,
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    const currentCats = Array.isArray(product.category)
      ? product.category
      : [product.category];
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

  const currentPrice =
    product.offerPrice && product.offerPrice > 0
      ? product.offerPrice
      : product.price;

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;

      // Use Web Share API if supported (mostly mobile browsers)
      if (navigator.share) {
        await navigator.share({
          title: product?.name || "Product",
          text: "Check out this product!",
          url: shareUrl,
        });
        return;
      }

      // Fallback: Copy link
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.log("Share failed:", error);
      alert("Unable to share right now.");
    }
  };

  const handleBuyNow = () => {
    setSuppressCartAutoOpen(true);
    addToCart(product._id, quantity);
    navigate("/checkout");
  };

  return (
    <div className="pt-6 pb-20 bg-white">
      <div className="container mx-auto ">
        {/* --- Breadcrumbs --- */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 mb-8">
          <Link to="/" className="hover:text-[#1E2A5E]">
            Home
          </Link>
          <span>/</span>
          <span
            className="cursor-pointer hover:text-[#1E2A5E]"
            onClick={() => navigate("/products")}
          >
            Products
          </span>
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
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-8 relative min-h-[400px] md:min-h-[600px]">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain max-h-[600px]"
              />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Vendor & Title */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">
                VENDOR: {product.brand || "WOKIEE"}
              </p>
              <h1 className="text-3xl font-medium text-[#1E2A5E] mb-2">
                {product.name}
              </h1>

              {/* Price (Rupees) */}
              <div className="mb-1">
                <span className="text-3xl font-bold text-[#008779]">
                  ₹{currentPrice}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Taxes included.{" "}
                <span className="text-[#008779] underline cursor-pointer">
                  Shipping
                </span>{" "}
                calculated at checkout.
              </p>
            </div>

            {/* Live Viewer Badge */}
            <div className="flex items-center gap-3">
              <div className="bg-[#1E2A5E] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                {viewers}
              </div>
              <span className="text-sm text-[#1E2A5E] font-medium">
                People are currently viewing this
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
              <CheckCircle className="w-4 h-4" />
              In stock!
            </div>

            {/* --- MOVED CONTENT: The Shipping Info/Progress Bar was removed from here --- */}

            {/* --- CONTROLS SECTION --- */}
            <div className="pt-2">
              <div className="flex gap-3 mb-4">
                {/* Quantity */}
                <div className="flex items-center bg-gray-100 rounded-lg h-12 w-32 px-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-full flex items-center justify-center hover:text-[#008779]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    className="w-full bg-transparent text-center font-bold text-[#1E2A5E] outline-none"
                    value={quantity}
                    readOnly
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-full flex items-center justify-center hover:text-[#008779]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => addToCart(product._id, quantity)}
                  className="flex-1 bg-[#008779] text-white font-bold rounded-lg h-12 flex items-center justify-center gap-2 hover:bg-[#007065] transition-colors shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => addToWishlist(product._id)}
                  className={`w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center transition-colors ${wishlist && wishlist.includes(product._id) ? "bg-red-50 text-red-500 border-red-200" : "text-[#1E2A5E] hover:bg-gray-50"}`}
                >
                  <Heart
                    className={`w-5 h-5 ${wishlist && wishlist.includes(product._id) ? "fill-current" : ""}`}
                  />
                </button>
              </div>

              {/* Buy Now Button (Always Active) */}
                    <button 
                         onClick={handleBuyNow}
                         className="w-full h-12 rounded-lg font-bold text-sm uppercase tracking-wide mb-8 transition-all bg-[#E5E7EB] text-gray-800 hover:bg-[#D1D5DB] hover:text-black shadow-sm"
                    >
                        Buy it now
                    </button>

              {/* --- ACCORDIONS --- */}
              <div className="border-t border-gray-200">
                {/* Description */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection("description")}
                    className="w-full py-4 flex items-center justify-between text-[#1E2A5E] font-bold text-sm hover:text-[#008779] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4" /> Description
                    </span>
                    {openSection === "description" ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === "description" ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}
                  >
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Shipping & Returns (CONTENT MOVED HERE) */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection("shipping")}
                    className="w-full py-4 flex items-center justify-between text-[#1E2A5E] font-bold text-sm hover:text-[#008779] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Shipping & Returns
                    </span>
                    {openSection === "shipping" ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === "shipping" ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}
                  >
                    <div className="space-y-4 pt-2">
                      {/* Info Box */}
                      <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Truck className="w-4 h-4 text-[#1E2A5E]" />
                          <span>
                            Standard delivery within 2–5 business days
                          </span>
                        </div>
                        <div className="h-px bg-gray-200 w-full"></div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <RotateCcw className="w-4 h-4 text-[#1E2A5E]" />
                          <span>
                            Return items in original condition for a full refund
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        We ship worldwide. Custom duties may apply for
                        international orders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full border border-[#1E2A5E] text-[#1E2A5E] font-bold py-3 rounded-lg mt-8 flex items-center justify-center gap-2 hover:bg-[#1E2A5E] hover:text-white transition-all text-sm uppercase"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* --- REVIEWS SECTION --- */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-20">
          <Testimonials />
        </div>

        {/* --- RELATED PRODUCTS --- */}
        {relatedProducts.length > 0 && (
          <div className="mb-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1E2A5E] mb-2">
                You Might Also Like
              </h2>
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
