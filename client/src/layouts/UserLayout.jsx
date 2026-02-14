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

      <main className="px-4 md:px-4 lg:px-4 xl:px-12 2xl:px-40 flex-grow bg-white">
        {children}
      </main>
      {showTestimonials && <Testimonials />}
      <Footer />
    </>

  );
};

export default UserLayout;
