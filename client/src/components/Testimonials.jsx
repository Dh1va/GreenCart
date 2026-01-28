import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  { id: 1, name: "Arjun S", role: "Bookstore Owner", text: "Excellent book quality and fast delivery.\nCustomers are very happy." },
  { id: 2, name: "Meera K", role: "School Library", text: "Great collection with affordable pricing.\nPerfect for bulk orders." },
  { id: 3, name: "Daniel P", role: "College Book Supplier", text: "Reliable service and timely dispatch.\nBooks arrived in perfect condition." },
  { id: 4, name: "Priya R", role: "Online Book Seller", text: "Huge variety of titles and smooth ordering.\nHighly recommended for resellers." },
  { id: 5, name: "Rahul M", role: "Wholesale Retailer", text: "Best wholesale rates and quick support.\nEasy to restock anytime." },
  { id: 6, name: "Sanjana V", role: "Tuition Center", text: "Perfect for exam guides and study books.\nGreat packaging and fast delivery." },
  { id: 7, name: "Joseph L", role: "Public Library", text: "Consistent quality with good discounts.\nReaders love the new arrivals." },
  { id: 8, name: "Anitha S", role: "Book Distributor", text: "Fast delivery and clean invoicing.\nSupport team is always helpful." },
];

const Testimonials = () => {
  

  const itemsPerView = 4;
  const totalOriginal = reviews.length;

  const extendedReviews = [...reviews, ...reviews.slice(0, itemsPerView)];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const handleNext = () => {
    if (currentIndex >= totalOriginal) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + itemsPerView);
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(totalOriginal);

      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentIndex(totalOriginal - itemsPerView);
      }, 50);
    } else {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - itemsPerView);
    }
  };

  const handleDotClick = (pageIndex) => {
    setIsTransitioning(true);
    setCurrentIndex(pageIndex * itemsPerView);
  };

  useEffect(() => {
    if (currentIndex === totalOriginal) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, totalOriginal]);

  return (
    // Full width background
    <section className="w-full py-16  bg-[#F0F4F8] select-none">
      {/* Content aligned to UserLayout padding */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-[#1E2A5E] text-3xl font-bold mb-2">Reviews</h2>
          <p className="text-gray-500">What do people think about us?</p>
        </div>

        {/* Slider */}
        <div className="w-full overflow-hidden mb-8">
          <div
            className="flex"
            style={{
              transform: `translateX(-${currentIndex * 25}%)`,
              transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
            }}
          >
            {extendedReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="w-full md:w-1/4 flex-shrink-0 px-3"
              >
                <div className="bg-white p-6 rounded-xl shadow-sm h-full border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    <h3 className="font-bold text-[#1E2A5E] text-md mb-2 truncate">
                      {review.text.split(".")[0]}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 whitespace-pre-line">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1E2A5E] font-bold text-xs">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-[#1E2A5E] font-bold text-sm">
                        {review.name}
                      </h4>
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider">
                        {review.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrev}
            className="w-10 h-10 flex items-center justify-center rounded-full  text-[#1E2A5E]  "
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {[...Array(Math.ceil(totalOriginal / itemsPerView))].map(
              (_, pageIndex) => {
                const activePage = Math.floor(
                  (currentIndex % totalOriginal) / itemsPerView
                );

                return (
                  <button
                    key={pageIndex}
                    onClick={() => handleDotClick(pageIndex)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      activePage === pageIndex
                        ? "bg-[#1E2A5E] w-4"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                );
              }
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 flex items-center justify-center rounded-full  text-[#1E2A5E] "
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
