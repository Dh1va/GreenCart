import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";

const UserLayout = ({ children }) => {
  const showTestimonials = 
    location.pathname === "/" || 
    location.pathname.startsWith("/product/");
  return (
   
      <>
        <Navbar />

      <main className="px-6 md:px-16 lg:px-24 xl:px-32 flex-grow">
        {children}
      </main>
      {showTestimonials && <Testimonials />}
      <Footer />
      </>
   
  );
};

export default UserLayout;
