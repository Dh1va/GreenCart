import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    
    <div className="w-full mt-5"> 
      <div className="relative z-10 w-full h-[600px] group bg-gray-100 rounded-3xl overflow-hidden">
        
        <style>
          {`
            .swiper-pagination-bullet {
              background-color: white !important;
              opacity: 0.5;
              width: 8px;
              height: 8px;
              margin: 0 6px !important;
              transition: all 0.3s;
            }
            .swiper-pagination-bullet-active {
              opacity: 1;
              width: 8px;
              height: 8px;
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

                <div className="absolute inset-0 bg-black/30"></div>

                <div className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left px-8 md:px-16 lg:px-24">
                  <div className="max-w-xl lg:max-w-2xl space-y-6 animate-fade-in-up">
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
                        className="inline-flex items-center gap-2 px-10 py-4 bg-[#00838f] text-white rounded-md font-semibold text-lg transition-all hover:bg-white hover:text-[#16255C] shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        Discover Now!
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="custom-prev absolute top-1/2 left-4 md:left-8 z-20 -translate-y-1/2 w-12 h-12 bg-[#ECF2FE] rounded-full flex items-center justify-center  text-gray-800 hover:bg-[#16255C] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button className="custom-next absolute top-1/2 right-4 md:right-8 z-20 -translate-y-1/2 w-12 h-12 bg-[#ECF2FE] rounded-full flex items-center justify-center text-gray-800 hover:bg-[#16255C] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default MainBanner;