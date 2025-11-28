import React from "react";

export default function Privacy() {
  return (
    <div className="p-6 max-w-3xl mx-auto mt-24">
      <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>
      <p className="text-gray-600">
        We respect your privacy and are committed to protecting your personal
        information.
      </p>

      <h2 className="text-xl font-semibold mt-6">1. Data Collection</h2>
      <p className="text-gray-600">
        We collect information such as your name, email, phone number,
        address, and order details to provide our services.
      </p>

      <h2 className="text-xl font-semibold mt-6">2. How We Use Your Data</h2>
      <p className="text-gray-600">
        Your data is used for order processing, communication, and improving
        our website experience.
      </p>

      <h2 className="text-xl font-semibold mt-6">3. Payment Security</h2>
      <p className="text-gray-600">
        All online payments are processed securely by Razorpay. We do not store
        your card or banking details.
      </p>

      <h2 className="text-xl font-semibold mt-6">4. Cookies</h2>
      <p className="text-gray-600">
        Our website uses cookies to provide a better experience.
      </p>

      <h2 className="text-xl font-semibold mt-6">5. Contact Us</h2>
      <p className="text-gray-600">
        For privacy-related questions, contact:
        <br />
        <strong>your-email@example.com</strong>
      </p>
    </div>
  );
}
