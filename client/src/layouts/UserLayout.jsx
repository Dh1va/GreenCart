import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UserLayout = ({ children }) => {
  return (
    <>
      <Navbar />

      {/* This wrapper gives your standard page padding */}
      <main className="px-6 md:px-16 lg:px-24 xl:px-32">
        {children}
      </main>

      <Footer />
    </>
  );
};

export default UserLayout;
