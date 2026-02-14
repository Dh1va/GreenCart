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
    <section className=" mt-20  overflow-hidden bg-white">
      
      <div className="">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#16255C]">
            Shop by Category
          </h2>
          <p className="text-[#16255C] text-md font-medium">
            Find the perfect book for every interest and passion
          </p>
        </div>

        {/* --- Swiper Carousel --- */}
        <div className="relative w-full">
          <style>
            {`
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
                background-color: #16255C !important;
                width: 7px;
                height: 7px;
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
              640: { slidesPerView: 3, slidesPerGroup: 1 },
              1024: { slidesPerView: 4, slidesPerGroup: 1 },
              1280: { slidesPerView: 5, slidesPerGroup: 1 },
            }}
            className="w-full"
          >
            {categories.map((cat) => (
              <SwiperSlide key={cat._id} className="">
                <div
                  onClick={() => handleCategoryClick(cat.name)}
                  className="relative group/card cursor-pointer aspect-[125/173] lg:aspect-[304/405] rounded-[24px] overflow-hidden bg-white"
                >
                  <img
                    src={cat.image || "https://placehold.co/600x800?text=No+Image"}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-[#16255C] text-white group-hover/card:bg-white group-hover/card:text-[#16255C] text-center py-3 rounded-xl transition-all duration-300 shadow-lg">
                      <span className="text-lg md:text-xl font-bold block  px-2">
                        {cat.name}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* --- Navigation Controls --- */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="hidden md:flex cat-prev w-10 h-10 items-center justify-center text-[#CBD5E0] hover:text-[#16255C] transition-all cursor-pointer">
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="category-swiper-pagination"></div>

            <button className="hidden md:flex cat-next w-10 h-10 items-center justify-center text-[#CBD5E0] hover:text-[#16255C] transition-all cursor-pointer">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;