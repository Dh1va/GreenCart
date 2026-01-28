import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Ensure toast is imported

const VerifyPhonePe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { axios, setCartItems } = useAppContext();
  
  const [status, setStatus] = useState('processing'); 
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    } else {
        // If no orderId, go back to checkout
        navigate('/checkout');
    }
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      const { data } = await axios.post('/api/payments/phonepe/validate', { orderId });
      
      if (data.success) {
        // SUCCESS CASE
        setStatus('success');
        setCartItems({});
        setTimeout(() => navigate('/my-orders'), 3000);
      } else if (data.message.includes("processing") || data.message.includes("pending")) {
        // PENDING CASE (Retry)
        setStatus('pending');
        setTimeout(verifyPayment, 5000);
      } else {
        // FAILED / CANCELLED CASE
        // Instead of showing error UI, redirect immediately to checkout
        toast.error("Payment Cancelled or Failed");
        navigate('/checkout'); 
      }
    } catch (error) {
      console.error(error);
      // ERROR CASE (Network/Server error)
      toast.error("Payment Verification Failed");
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
        
        {/* Only show Processing or Success UI. Failed UI is removed. */}
        {(status === 'processing' || status === 'pending') && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-[#1E2A5E] animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800">
              {status === 'pending' ? 'Payment is Pending...' : 'Verifying Payment...'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Please check your phone app if the payment is deducted. Do not close this window.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Payment Successful!</h2>
            <p className="text-gray-500 mt-2 text-sm">Redirecting to your orders...</p>
            <button onClick={() => navigate('/my-orders')} className="mt-6 px-6 py-2 bg-[#1E2A5E] text-white rounded-lg text-sm font-bold">
              Go to Orders
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyPhonePe;