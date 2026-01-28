import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const MainBanner = () => {
  const slides = [
    {
      id: 1,
      bgImage: assets.main_banner_bg, 
      bgImageSm: assets.main_banner_bg_sm, 
      title: "Fueling Minds, Growing Businesses",
      subtitle: "Your premier source for wholesale books. Unbeatable prices for retailers, schools, and libraries."
    },
    {
      id: 2,
      bgImage: assets.main_banner_bg_2, 
      bgImageSm: assets.main_banner_bg_sm_2, 
      title: "Millions of Titles at Your Fingertips",
      subtitle: "From timeless classics to academic textbooks, stock your shelves with the widest selection available."
    },
    {
      id: 3,
      bgImage: assets.main_banner_bg_3, 
      bgImageSm: assets.main_banner_bg_sm_3, 
      title: "Reliable Logistics & Global Distribution",
      subtitle: "Streamlined supply chain solutions to ensure your inventory arrives on time, every time."
    },
  ];

  return (
    // 👇 Updated height here to h-[575px]
    <div className="relative z-10 w-full h-[575px] group bg-gray-100 rounded-3xl overflow-hidden">
      
      <style>
        {`
          .swiper-pagination-bullet {
            background-color: white !important;
            opacity: 0.5;
            width: 10px;
            height: 10px;
            margin: 0 6px !important;
            transition: all 0.3s;
          }
          .swiper-pagination-bullet-active {
            opacity: 1;
            background-color: white !important;
            transform: scale(1.3);
          }
          .swiper-pagination-fraction, .swiper-pagination-custom, .swiper-horizontal > .swiper-pagination-bullets {
            bottom: 40px !important;
          }
        `}
      </style>

      <Swiper
        modules={[Navigation, Pagination, A11y, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{
            nextEl: '.custom-next',
            prevEl: '.custom-prev',
        }}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              
              {/* Background Images */}
              <img
                src={slide.bgImage}
                alt="banner"
                className="w-full h-full object-cover hidden md:block"
              />
              <img
                src={slide.bgImageSm}
                alt="banner"
                className="w-full h-full object-cover md:hidden"
              />

              {/* Light Black Overlay */}
              <div className="absolute inset-0 bg-black/30"></div>

              {/* Overlay Content Container */}
              <div className="absolute inset-0">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center md:items-start text-center md:text-left">
                  
                  {/* 👇 md:ml-16 to push text past the arrow */}
                  <div className="max-w-xl lg:max-w-2xl space-y-6 animate-fade-in-up md:ml-16">
                    <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold text-white leading-[1.1] drop-shadow-md">
                      {slide.title}
                    </h1>
                    
                    {slide.subtitle && (
                      <p className="text-white text-lg md:text-xl font-medium drop-shadow-sm opacity-90 max-w-lg mx-auto md:mx-0">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="pt-4">
                      <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-[#1E2A5E] text-white rounded-full font-semibold text-lg transition-all hover:bg-white hover:text-primary shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        Discover Now!
                      </Link>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Left Arrow */}
      <button className="custom-prev absolute top-1/2 left-4 md:left-8 z-20 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-800 hover:bg-[#1E2A5E] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 cursor-pointer">
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Arrow */}
      <button className="custom-next absolute top-1/2 right-4 md:right-8 z-20 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-800 hover:bg-[#1E2A5E] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 cursor-pointer">
        <ChevronRight className="w-6 h-6" />
      </button>

    </div>
  );
};

export default MainBanner;