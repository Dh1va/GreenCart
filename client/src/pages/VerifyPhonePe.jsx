import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyPhonePe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { axios, setCartItems, user } = useAppContext();
  
  const [status, setStatus] = useState('processing'); 
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) verifyPayment();
    else navigate('/checkout');
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      const { data } = await axios.post('/api/payments/phonepe/validate', { orderId });
      
      if (data.success) {
        setStatus('success');
        setCartItems({});
        localStorage.removeItem("guest_cart");
        localStorage.removeItem("guest_checkout_address");

        //  REDIRECT LOGIC: Guests vs Registered Users
        setTimeout(() => {
          if (user) {
            navigate('/my-orders');
          } else {
            navigate(`/order-success/${orderId}`);
          }
        }, 3000);

      } else if (data.message?.toLowerCase().includes("pending") || data.message?.toLowerCase().includes("processing")) {
        setStatus('pending');
        setTimeout(verifyPayment, 5000);
      } else {
        toast.error("Payment Failed");
        navigate('/checkout'); 
      }
    } catch (error) {
      toast.error("Verification Error");
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-gray-100">
        {(status === 'processing' || status === 'pending') && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#1E2A5E] animate-spin mb-6" />
            <h2 className="text-xl font-extrabold text-slate-900">
              {status === 'pending' ? 'Still Processing...' : 'Securing Payment...'}
            </h2>
            <p className="text-slate-500 mt-3 text-sm leading-relaxed">
              Confirming your transaction with the bank. Please do not refresh or close this tab.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Paid Successfully!</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Preparing your digital receipt...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPhonePe;