import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ChevronRight, Package, CheckCircle2, Truck, FileText, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { axios, currency } = useAppContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/order/public/${orderId}`);
        if (data.success) setOrder(data.order);
      } catch (e) {
        console.error("Order load error", e);
        toast.error("Could not load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleDownloadInvoice = () => {
    try {
      // public invoice endpoint
      const downloadUrl = `${import.meta.env.VITE_BACKEND_URL}/api/order/public/invoice/${orderId}`;
      window.open(downloadUrl, '_blank');
      toast.success("Downloading invoice...");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100 animate-in zoom-in duration-500">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
          Success! Order Placed.
        </h1>
        <p className="text-slate-500 font-medium">
          Order ID: <span className="text-indigo-600 font-bold uppercase">#{orderId.slice(-8)}</span>
        </p>

        <div className="mt-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden text-left">
          <div className="p-8 md:p-10">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="text-indigo-600" size={20} /> What's Next?
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              We've received your order and are preparing it for shipment. You'll receive an email confirmation shortly. You can download your invoice below for your records.
            </p>
            
            {/* INVOICE & ACTION BUTTONS */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleDownloadInvoice}
                  className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                >
                  <FileText size={16} className="text-indigo-600" /> Download Invoice
                </button>
                <Link 
                  to="/" 
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                  Continue Shopping <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="flex items-center justify-center gap-3 mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                <Truck size={14} className="text-emerald-500" /> 
                Estimated Delivery: 3-5 Business Days
              </div>
            </div>
          </div>
          
          {/* SECURE FOOTER */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-center">
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
               <ShieldCheck size={12} /> Verified & Secured Transaction
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;