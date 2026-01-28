import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { 
  FileText, 
  Truck, 
  ArrowLeft, 
  Package, 
  CreditCard, 
  MapPin, 
  Check, 
  Clock, 
  XCircle,
  Settings,
  Home,
  Box,
  Gift,
  Copy,
  AlertTriangle,
  ShoppingBag
} from "lucide-react";
import { toast } from "react-hot-toast";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, currency } = useAppContext();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.get(`/api/order/details/${id}`);
      if (data.success) setOrder(data.order);
    } catch (error) {
      console.error("Order details error:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // --- HANDLERS ---
  const handleInvoice = () => {
    window.open(`${import.meta.env.VITE_BACKEND_URL}/api/order/invoice/${id}`, "_blank");
  };

  const handleTrack = () => {
    if (order?.delivery?.trackingUrl) {
      window.open(order.delivery.trackingUrl, "_blank");
    }
  };

  const copyTrackingId = () => {
    if(order?.delivery?.trackingId) {
        navigator.clipboard.writeText(order.delivery.trackingId);
        toast.success("Tracking ID copied!");
    }
  }

  // --- HELPER: TIMELINE LOGIC ---
  const getTimelineStep = (status) => {
    switch (status) {
        case 'order_placed': return 1;
        case 'processing': return 2;
        case 'shipped': return 3;
        case 'out_for_delivery': return 4;
        case 'delivered': return 5;
        case 'cancelled': return -1;
        default: return 0;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#1E2A5E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
            <p className="text-gray-500 mt-2 mb-6">We couldn't find the order you're looking for.</p>
            <button onClick={() => navigate("/my-orders")} className="px-6 py-2 bg-[#1E2A5E] text-white rounded-lg font-medium hover:bg-[#151f42]">
                Back to Orders
            </button>
        </div>
    </div>
  );

  const currentStep = getTimelineStep(order.delivery.status);
  const isCancelled = currentStep === -1;

  // Icons for steps
  const steps = [
    { label: 'Confirmed', icon: Box },
    { label: 'Processing', icon: Settings },
    { label: 'Shipped', icon: Truck },
    { label: 'Out for Delivery', icon: MapPin },
    { label: 'Delivered', icon: Home },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gray-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex items-start gap-4">
                <button onClick={() => navigate("/my-orders")} className="mt-1 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col gap-2">
                    {/* ID & Badge */}
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
                        {isCancelled ? (
                            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full border border-red-100 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Cancelled
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-[#1E2A5E]/10 text-[#1E2A5E] text-xs font-bold uppercase tracking-wider rounded-full border border-[#1E2A5E]/10">
                                {order.delivery.status.replace(/_/g, " ")}
                            </span>
                        )}
                    </div>
                    
                    {/* Date */}
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* TRACKING ID DISPLAY */}
                    {order.delivery.trackingId && !isCancelled && (
                         <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Truck className="w-4 h-4 text-[#1E2A5E]" />
                            <span className="font-medium text-gray-500">Tracking ID:</span>
                            <div 
                                onClick={copyTrackingId}
                                className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200 cursor-pointer hover:border-blue-300 transition-all group shadow-sm"
                                title="Click to copy"
                            >
                                <span className="font-mono font-bold text-gray-800 tracking-wide select-all">
                                    {order.delivery.trackingId}
                                </span>
                                <Copy className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                            </div>
                         </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={handleInvoice} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                    <FileText className="w-4 h-4" /> Invoice
                </button>
                {order.delivery.trackingUrl && !isCancelled && (
                    <button onClick={handleTrack} className="flex items-center gap-2 px-4 py-2 bg-[#1E2A5E] text-white rounded-lg text-sm font-semibold shadow-md hover:bg-[#151f42] transition-all">
                        <Truck className="w-4 h-4" /> Track Order
                    </button>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN (Timeline & Items) --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 1. TIMELINE OR CANCELLED BANNER */}
                {isCancelled ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-7 h-7 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-red-900">Order Cancelled</h3>
                        <p className="text-sm text-red-700 mt-1 max-w-md">
                            This order was cancelled on {new Date(order.updatedAt).toLocaleDateString()}. 
                            If you have already paid, a refund has been initiated to your original payment method.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                        {/* Icons Row */}
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {steps.map((step, index) => {
                                const stepNum = index + 1;
                                const isCompleted = stepNum < currentStep;
                                const isCurrent = stepNum === currentStep;
                                const Icon = step.icon;

                                return (
                                    <div key={index} className={`flex justify-center transition-all duration-500 ${isCurrent ? 'transform -translate-y-1' : ''}`}>
                                        <div className={`p-2 rounded-full ${isCompleted ? 'text-[#008779]' : isCurrent ? 'text-[#1E2A5E] bg-[#1E2A5E]/10' : 'text-gray-300'}`}>
                                            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isCurrent ? 'animate-pulse' : ''}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bars Row */}
                        <div className="grid grid-cols-5 gap-1.5 md:gap-3">
                            {steps.map((step, index) => {
                                const stepNum = index + 1;
                                const isCompleted = stepNum < currentStep;
                                const isCurrent = stepNum === currentStep;

                                return (
                                    <div key={index} className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`absolute top-0 left-0 h-full w-full rounded-full transition-all duration-700 ease-out 
                                                ${isCompleted ? 'bg-[#008779]' : isCurrent ? 'bg-[#1E2A5E]' : 'bg-transparent'}
                                            `}
                                        ></div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Text Row */}
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {steps.map((step, index) => {
                                const stepNum = index + 1;
                                const isCompleted = stepNum < currentStep;
                                const isCurrent = stepNum === currentStep;

                                return (
                                    <div key={index} className="text-center">
                                        <p className={`text-[9px] md:text-xs font-bold uppercase tracking-wide leading-tight 
                                            ${isCompleted ? 'text-[#008779]' : isCurrent ? 'text-[#1E2A5E]' : 'text-gray-300'}
                                        `}>
                                            {step.label}
                                        </p>
                                        {isCurrent && (
                                            <p className="text-[9px] text-gray-400 font-medium mt-1 hidden md:block">
                                                In Progress
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. ORDER ITEMS CARD */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Items in Order</h3>
                        <span className="text-xs font-medium text-gray-500">{order.items.length} Items</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="p-6 flex gap-6 hover:bg-gray-50/50 transition-colors">
                                {/* IMAGE FIX: Added explicit bg-white, object-cover, and fallback */}
                                <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    {item.product?.images?.[0] ? (
                                        <img 
                                            src={item.product.images[0]} 
                                            alt={item.product.name} 
                                            className="w-full h-full object-contain" 
                                        />
                                    ) : (
                                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{item.product?.name || "Product Unavailable"}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.product?.description}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-sm md:text-base">{currency}{item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4">
                                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN (Summary) --- */}
            <div className="space-y-8">
                
                {/* 1. PAYMENT & SUMMARY */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">Payment Summary</h3>
                    
                    <div className="space-y-3 pb-6 border-b border-gray-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium text-gray-900">{currency}{order.pricing?.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax</span>
                            <span className="font-medium text-gray-900">{currency}{order.pricing?.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Delivery</span>
                            <span className="font-medium text-gray-900">{order.pricing?.deliveryFee === 0 ? 'Free' : `${currency}${order.pricing?.deliveryFee}`}</span>
                        </div>
                        {order.pricing?.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span className="font-medium">-{currency}{order.pricing?.discount}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center py-4">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-[#1E2A5E]">{currency}{order.pricing?.total.toLocaleString()}</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-100">
                        <div className="p-2 bg-white rounded-md border border-gray-200 text-gray-500">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 uppercase">{order.payment?.method}</p>
                            <p className={`text-[10px] uppercase font-bold ${order.payment?.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                {order.payment?.status}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. SHIPPING ADDRESS */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">Shipping Address</h3>
                    
                    <div className="flex gap-4">
                        <div className="mt-1">
                            <MapPin className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-bold text-gray-900">{order.address?.firstName} {order.address?.lastName}</p>
                            <p>{order.address?.street}</p>
                            <p>{order.address?.city}, {order.address?.state} {order.address?.zipCode}</p>
                            <p>{order.address?.country}</p>
                            <p className="mt-2 pt-2 border-t border-gray-100 font-medium text-gray-500">{order.address?.phone}</p>
                        </div>
                    </div>
                </div>

                {/* 3. NEED HELP */}
                <div className="bg-[#1E2A5E] rounded-xl shadow-sm p-6 text-white text-center">
                    <Gift className="w-8 h-8 mx-auto mb-3 text-white/80" />
                    <h4 className="font-bold text-sm mb-1">Need Help?</h4>
                    <p className="text-xs text-white/70 mb-4">Have issues with your order? We are here to help.</p>
                    <button onClick={() => navigate('/contact')} className="w-full py-2 bg-white text-[#1E2A5E] text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors">
                        Contact Support
                    </button>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;