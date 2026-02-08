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
  const { categories } = useAppContext();
  const navigate = useNavigate();

  const toSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleCategoryClick = (categoryName) => {
    const slug = toSlug(categoryName);
    navigate(`/products/${slug}`);
    window.scrollTo(0, 0);
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="md:pt-20 pt-10 md:pb-10 overflow-hidden"> {/* Added overflow-hidden to prevent any slide spillover */}
      <div className="container mx-auto px-4 md:px-8">
        {/* --- Header Section --- */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-5xl font-bold text-[#1E2A5E]">
            Shop by Category
          </h2>
          <p className="text-[#1E2A5E] text-md font-medium">
            Find the perfect book for every interest and passion
          </p>
        </div>

        {/* --- Swiper Carousel --- */}
        <div className="relative w-full">
          <style>
            {`
              /* Strips Swiper default positioning that causes layout overflow */
              .category-swiper-pagination {
                position: static !important;
                width: auto !important;
                display: flex !important;
                align-items: center;
                justify-content: center;
              }
              .category-swiper-pagination .swiper-pagination-bullet {
                background-color: #CBD5E0 !important;
                opacity: 1;
                width: 8px;
                height: 8px;
                margin: 0 5px !important;
                transition: all 0.3s ease;
                border-radius: 50%;
              }
              .category-swiper-pagination .swiper-pagination-bullet-active {
                background-color: #1E2A5E !important;
                
              }
            `}
          </style>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            slidesPerGroup={1}
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
              640: { slidesPerView: 3, slidesPerGroup: 3 },
              1024: { slidesPerView: 4, slidesPerGroup: 4 },
              1280: { slidesPerView: 5, slidesPerGroup: 5 },
            }}
            className="w-full"
          >
            {categories.map((cat) => (
              <SwiperSlide key={cat._id} className="py-4">
                <div
                  onClick={() => handleCategoryClick(cat.name)}
                  className="relative group/card cursor-pointer aspect-[4/5] md:aspect-[4/5] rounded-[24px] overflow-hidden bg-white"
                >
                  <img
                    src={cat.image || "https://placehold.co/600x800?text=No+Image"}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-[#1E2A5E] text-white group-hover/card:bg-white group-hover/card:text-[#1E2A5E] text-center py-3 rounded-xl transition-all duration-300">
                      <span className="text-sm md:text-lg font-bold block truncate px-2">
                        {cat.name}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* --- Navigation Controls (Clean & Centered) --- */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="cat-prev w-10 h-10 flex items-center justify-center text-[#CBD5E0] hover:text-[#1E2A5E]  transition-all cursor-pointer  disabled:opacity-30">
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Pagination is now strictly contained in the flex gap */}
            <div className="category-swiper-pagination"></div>

            <button className="cat-next w-10 h-10 flex items-center justify-center  text-[#CBD5E0] hover:text-[#1E2A5E]  transition-all cursor-pointer  disabled:opacity-30">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;