import React from "react";

export default function Refund() {
  return (
    <div className="p-6 max-w-3xl mx-auto mt-24">
      <h1 className="text-3xl font-semibold mb-4">Refund & Cancellation Policy</h1>

      <h2 className="text-xl font-semibold mt-6">1. Order Cancellation</h2>
      <p className="text-gray-600">
        Orders can be cancelled before they are shipped. Once shipped, the order
        cannot be cancelled.
      </p>

      <h2 className="text-xl font-semibold mt-6">2. Refund Policy</h2>
      <p className="text-gray-600">
        Refunds are issued only for valid cases such as damaged or incorrect
        products. Refunds will be processed to the original payment method.
      </p>

      <h2 className="text-xl font-semibold mt-6">3. Processing Time</h2>
      <p className="text-gray-600">
        Refunds typically take 5–7 business days to reflect in your account.
      </p>

      <h2 className="text-xl font-semibold mt-6">4. Contact Us</h2>
      <p className="text-gray-600">
        For refund-related queries, contact:
        <br />
        <strong>your-email@example.com</strong>
      </p>
    </div>
  );
}
