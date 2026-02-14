import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const reviews = [
  { id: 1, name: "Lucas M", role: "Small Business Owner", title: "Exceptional Support and Clean Code", text: "I was impressed by how fast the support team responded to my questions. Even as someone with basic coding knowledge, I found the theme incredibly easy to work with." },
  { id: 2, name: "Arjun S", role: "Bookstore Owner", title: "High Quality & Fast Delivery", text: "Excellent book quality and fast delivery. Customers are very happy with the condition of the books. Highly recommended for bulk orders." },
  { id: 3, name: "Meera K", role: "School Library", title: "Great collection with affordable pricing", text: "Great collection with affordable pricing. Perfect for bulk orders. The team helped us curate the perfect list for our students." },
  { id: 4, name: "Daniel P", role: "College Book Supplier", title: "Reliable service and timely dispatch", text: "Reliable service and timely dispatch. Books arrived in perfect condition. Streamlined our inventory management significantly." },
  { id: 5, name: "Rahul M", role: "Wholesale Retailer", title: "Best wholesale rates in the market", text: "Best wholesale rates and quick support. Easy to restock anytime. Their digital invoicing makes bookkeeping a breeze." },
  { id: 6, name: "Sarah J", role: "Retail Manager", title: "Top Tier Support", text: "The support team is top tier. They helped me set up my entire store in less than a day. Truly grateful!" },
  { id: 7, name: "Kevin T", role: "Entrepreneur", title: "Cleanest Codebase", text: "I've worked with many themes, but this one has the cleanest codebase I've ever seen. Extremely fast and lightweight." },
  { id: 8, name: "Elena G", role: "Library Curator", title: "Beautiful Aesthetics", text: "The design is just stunning. It gives our online presence a very professional and modern look." }
];

const CustomStar = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26ZM15.1358 10.1279L13.3242 4.56764C13.2224 4.25523 12.7776 4.25523 12.6758 4.56764L10.8642 10.1279C10.8187 10.2676 10.6877 10.3623 10.54 10.3623H4.67474C4.34494 10.3623 4.2075 10.7813 4.47397 10.9744L9.22119 14.414C9.34018 14.5002 9.38997 14.6526 9.34461 14.7918L7.53184 20.3556C7.43014 20.6678 7.79 20.9268 8.05681 20.7335L12.7992 17.2974C12.9189 17.2107 13.0811 17.2107 13.2008 17.2974L17.9432 20.7335C18.21 20.9268 18.5699 20.6678 18.4682 20.3556L16.6554 14.7918C16.61 14.6526 16.6598 14.5002 16.7788 14.414L21.526 10.9744C21.7925 10.7813 21.6551 10.3623 21.3252 10.3623H15.46C15.3123 10.3623 15.1813 10.2676 15.1358 10.1279Z" fill="#FFAB00" />
  </svg>
);

const Testimonials = () => {
  return (
    <section className="w-full py-16 bg-[#ECF2FE] overflow-hidden">
      <div className="px-4 md:px-4 lg:px-4 xl:px-12 2xl:px-40">
        
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-[44px] font-semibold text-[#16255C]">Reviews</h2>
          <p className="text-[#16255C] text-md font-medium">What do people think about us?</p>
        </div>

        <div className="relative w-full">
          {/* CRITICAL FIX: The .swiper-wrapper must be flex to force children to equal height */}
          <style>
            {`
              .testimonials-swiper .swiper-wrapper {
                display: flex !important;
              }
              .testimonials-swiper .swiper-slide {
                height: auto !important;
                display: flex !important;
              }
              .review-pagination .swiper-pagination-bullet {
                background-color: #CBD5E0 !important;
                opacity: 1;
                width: 8px;
                height: 8px;
                margin: 0 8px !important;
                transition: all 0.3s ease;
              }
              .review-pagination .swiper-pagination-bullet-active {
                background-color: #16255C !important;
              }
            `}
          </style>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            slidesPerGroup={1}
            loop={true}
            pagination={{ el: ".review-pagination", clickable: true }}
            navigation={{ nextEl: ".rev-next", prevEl: ".rev-prev" }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="pb-16 testimonials-swiper"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                {/* h-full is mandatory here */}
                <div className="group/item bg-white p-6 border border-gray-200 rounded-3xl w-full h-full flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => <CustomStar key={i} />)}
                    </div>

                    <h3 className="text-[#16255C] font-semibold leading-tight mb-3 transition-colors duration-300 group-hover/item:text-[#00838f] group-hover/item:underline" 
                        style={{ fontSize: '20px' }}>
                      {review.title}
                    </h3>

                    <p className="text-[#16255C] font-medium leading-relaxed" 
                       style={{ fontSize: '15px' }}>
                      {review.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-[#ECF2FE] flex items-center justify-center font-bold text-[#16255C] shrink-0">
                      {review.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[#16255C] font-bold text-sm leading-none truncate">— {review.name}</h4>
                      <p className="text-[#16255C] text-[12px] mt-1 truncate">{review.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="flex items-center justify-center gap-10 mt-8">
            <button className="hidden md:inline rev-prev text-[#CBD5E0] cursor-pointer hover:text-[#16255C] transition-colors">
              <ChevronLeft size={26} />
            </button>
            <div className="review-pagination !static !w-auto flex items-center"></div>
            <button className="hidden md:inline rev-next text-[#CBD5E0] cursor-pointer hover:text-[#16255C] transition-colors">
              <ChevronRight size={26} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;