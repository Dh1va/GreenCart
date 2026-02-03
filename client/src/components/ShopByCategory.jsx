import React from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ShopByCategory = () => {
  const { categories, setSearchQuery } = useAppContext();
  const navigate = useNavigate();

  const toSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Handle click on category
  const handleCategoryClick = (categoryName) => {
  const slug = toSlug(categoryName);
  navigate(`/products/${slug}`);
  window.scrollTo(0, 0);
};

  if (!categories || categories.length === 0) return null;

  return (
    <section className="pt-20 pb-10">
      <div className="container mx-auto pt-10 pb-0 px-4 md:px-8">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E2A5E]">
            Shop by Category
          </h2>
          <p className="text-gray-500 text-lg font-medium">
            Find the perfect book for every interest and passion
          </p>
        </div>

        {/* --- Swiper Carousel --- */}
        <div className="relative group w-full">
          
          <style>
            {`
              .category-swiper-pagination .swiper-pagination-bullet {
                background-color: #1E2A5E !important;
                opacity: 0.2;
                width: 8px;
                height: 8px;
                margin: 0 6px !important;
                transition: all 0.3s ease;
              }
              .category-swiper-pagination .swiper-pagination-bullet-active {
                opacity: 1;
                background-color: #1E2A5E !important;
                transform: scale(1.2);
              }
            `}
          </style>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            // 👇 MOBILE DEFAULTS:
            slidesPerView={1}        // Show exactly 1 slide
            slidesPerGroup={1}       // Move 1 at a time
            grabCursor={true}
            loop={true} 
            pagination={{
              el: ".category-swiper-pagination",
              clickable: true,
            }}
            navigation={{
              nextEl: ".cat-next",
              prevEl: ".cat-prev",
            }}
            breakpoints={{
              // Tablet (640px+)
              640: { 
                slidesPerView: 3, 
                slidesPerGroup: 3, 
                spaceBetween: 20 
              },
              // Laptop (1024px+)
              1024: { 
                slidesPerView: 4, 
                slidesPerGroup: 4, 
                spaceBetween: 24 
              },
              // Desktop (1280px+)
              1280: { 
                slidesPerView: 5, 
                slidesPerGroup: 5, 
                spaceBetween: 24 
              },
            }}
            // 👇 Added px-12 for mobile to shrink the single slide's width
            // md:px-0 removes that padding on larger screens so they span full width
            className="py-10 w-full px-12 md:px-0" 
          >
            {categories.map((cat) => (
              <SwiperSlide key={cat._id} className="h-auto">
                <div 
                  onClick={() => handleCategoryClick(cat.name)}
                  className="relative group/card cursor-pointer h-full aspect-[4/5] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-out bg-white"
                >
                  {/* Category Image */}
                  <img
                    src={cat.image || "https://placehold.co/600x800?text=No+Image"} 
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

                  {/* Floating Label Button */}
                  <div className="absolute bottom-4 left-4 right-4 md:bottom-6">
                    <div className="bg-[#1E2A5E] text-white group-hover/card:bg-white group-hover/card:text-[#1E2A5E] text-center py-3 px-2 rounded-xl md:rounded-2xl shadow-lg transform transition-all duration-300 group-hover/card:-translate-y-1">
                      <span className="text-[14px] md:text-[16px] font-bold tracking-wide block truncate">
                        {cat.name}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* --- Navigation Controls (Visible on All Screens) --- */}
          <div className="flex items-center justify-center gap-8 mt-6 relative z-10">
            <button className="cat-prev p-2 text-[#1E2A5E]/50 hover:text-[#1E2A5E] transition-colors cursor-pointer disabled:opacity-30 active:scale-95 bg-white shadow-sm rounded-full border border-gray-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* Pagination Container */}
            <div className="category-swiper-pagination !w-auto flex items-center"></div>

            <button className="cat-next p-2 text-[#1E2A5E]/50 hover:text-[#1E2A5E] transition-colors cursor-pointer disabled:opacity-30 active:scale-95 bg-white shadow-sm rounded-full border border-gray-100">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;