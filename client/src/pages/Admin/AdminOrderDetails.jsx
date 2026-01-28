import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Calendar,
  Printer,
  Save,
  RotateCcw,
  Truck,
  Package,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";

// Progress steps mapping
const ORDER_STEPS = ["order_placed", "processing", "shipped", "delivered"];

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { axios, currency } = useAppContext();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [trackingId, setTrackingId] = useState("");
  const [status, setStatus] = useState("");
  
  // Change Detection
  const [originalValues, setOriginalValues] = useState({ status: "", trackingId: "" });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch Order Data
  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.get(`/api/admin-orders/order/${orderId}`);
      if (data.success) {
        setOrder(data.order);
        setStatus(data.order.delivery.status);
        setTrackingId(data.order.delivery.trackingId || "");
        setOriginalValues({
          status: data.order.delivery.status,
          trackingId: data.order.delivery.trackingId || ""
        });
      }
    } catch (error) {
      toast.error("Order not found");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    const isStatusChanged = status !== originalValues.status;
    const isTrackingChanged = trackingId !== originalValues.trackingId;
    setHasChanges(isStatusChanged || isTrackingChanged);
  }, [status, trackingId, originalValues]);

  // --- HANDLERS ---

  const openPdf = (path, id) => {
    window.open(`${import.meta.env.VITE_BACKEND_URL}${path}/${id}`, "_blank", "noopener,noreferrer");
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    try {
      const { data } = await axios.patch("/api/admin-orders/order/status", {
        orderId,
        status,
        trackingId: status === "shipped" ? trackingId : undefined,
      });
      if (data.success) {
        toast.success("Order updated successfully");
        if(data.trackingId) setTrackingId(data.trackingId);
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleRefund = async () => {
    if(!window.confirm("Mark as Refunded? This cannot be undone.")) return;
    try {
      const { data } = await axios.patch("/api/admin-orders/order/payment", {
        orderId,
        status: "refunded"
      });
      if(data.success) {
        toast.success("Refund status updated");
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error("Failed to process refund");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  // Helper for progress bar
  const getStepStatus = (stepName) => {
    if (status === "cancelled") return "cancelled";
    const currentIndex = ORDER_STEPS.indexOf(status);
    const stepIndex = ORDER_STEPS.indexOf(stepName);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Order...</div>;
  if (!order) return null;

  const canRefund = order.delivery.status === "cancelled" && order.payment.status === "paid";

  return (
    <div className="min-h-screen  font-sans text-sm pb-10">
      
      {/* --- TOP BAR --- */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                    <span>Orders</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">#{order._id.slice(-6).toUpperCase()}</span>
                </div>
                
                {/* Payment Badge */}
                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    order.payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    order.payment.status === 'refunded' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                    {order.payment.status === 'paid' ? 'Paid' : order.payment.status}
                </span>

                {/* Fulfillment Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    status === 'delivered' ? 'bg-gray-100 text-gray-700 border-gray-200' : 
                    status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                    {status === 'delivered' ? 'Fulfilled' : status === 'cancelled' ? 'Cancelled' : 'Unfulfilled'}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={() => openPdf("/api/admin-orders/order/invoice", order._id)} className="text-gray-500 hover:text-gray-700 font-medium px-3 py-2 text-xs flex items-center gap-1">
                    <Printer className="w-4 h-4" /> Print
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <button 
                    onClick={handleSave} 
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                        hasChanges ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN (MAIN) --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. STATUS PROGRESS CARD */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Order Progress</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: 'full', timeStyle: 'short' })}
                            </p>
                        </div>
                        {status !== 'cancelled' && (
                            <div className="relative">
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                    {["order_placed", "processing", "shipped", "delivered", "cancelled"].map(s => (
                                        <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <ChevronRight className="w-3 h-3 rotate-90" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Visual */}
                    {status !== 'cancelled' ? (
                        <div className="relative flex justify-between w-full">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
                            {ORDER_STEPS.map((step, idx) => {
                                const s = getStepStatus(step);
                                return (
                                    <div key={step} className="flex flex-col items-center bg-white px-2">
                                        <div className={`w-3 h-3 rounded-full border-2 ${
                                            s === 'completed' || s === 'current' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                                        }`}></div>
                                        <span className={`text-[10px] font-semibold mt-2 uppercase ${
                                            s === 'current' ? 'text-indigo-600' : s === 'completed' ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                            {step.replace("_", " ")}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2 border border-red-100">
                            <AlertCircle className="w-4 h-4" /> This order has been cancelled.
                        </div>
                    )}

                    {/* Tracking Input Section */}
                    {status === 'shipped' && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-end gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Tracking Number</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-xs">
                                        {order.courier?.name || "Ship"}
                                    </span>
                                    <input 
                                        type="text" 
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        placeholder="Auto-generated if empty"
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md text-xs border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 border"
                                    />
                                </div>
                            </div>
                            <button onClick={() => window.open(`https://www.google.com/search?q=${trackingId}`, '_blank')} disabled={!trackingId} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                Track Package
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. PRODUCTS TABLE */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Products</h3>
                    <span className="text-xs text-gray-500">{order.items.length} items</span>
                </div>
                <table className="min-w-full divide-y divide-gray-100">
                    <tbody className="bg-white divide-y divide-gray-50">
                        {order.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 whitespace-nowrap w-16">
                                    <div className="h-12 w-12 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                                        <img src={item.product?.images[0]} alt="" className="h-full w-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{item.product?.name}</div>
                                    <div className="text-xs text-gray-500">SKU: {item.product?._id.slice(-6).toUpperCase()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    {currency}{item.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    x {item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    {currency}{item.price * item.quantity}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 3. PAYMENT SUMMARY */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>{currency}{order.pricing.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Shipping</span>
                        <span>{currency}{order.pricing.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Tax</span>
                        <span>{currency}{order.pricing.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="flex justify-between font-bold text-gray-900 text-base">
                        <span>Total</span>
                        <span>{currency}{order.pricing.total.toFixed(2)}</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Payment via {order.payment.method.toUpperCase()}</span>
                    {canRefund && (
                        <button onClick={handleRefund} className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" /> Refund Order
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN (SIDEBAR) --- */}
        <div className="space-y-6">
            
            {/* A. NOTES */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Order Note</h3>
                <p className="text-xs text-gray-500 leading-relaxed italic">
                    No notes provided by customer.
                </p>
            </div>

            {/* B. CUSTOMER */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Customer</h3>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {order.address?.firstName?.[0]}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{order.address?.firstName} {order.address?.lastName}</div>
                        <div className="text-xs text-gray-500">1 Order</div>
                    </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-900 uppercase">Contact Information</h4>
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[150px]">{order.address?.email}</span>
                        </div>
                        <button onClick={() => copyToClipboard(order.address?.email)} className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{order.address?.phone}</span>
                        </div>
                        <button onClick={() => copyToClipboard(order.address?.phone)} className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* C. SHIPPING ADDRESS */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Shipping Address</h3>
                </div>
                
                {/* Visual Map Placeholder */}
                <div className="w-full h-24 bg-gray-100 rounded-md mb-4 flex items-center justify-center relative overflow-hidden border border-gray-200">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
                    <div className="z-10 bg-white p-1.5 rounded-full shadow-sm text-red-500">
                        <MapPin className="w-4 h-4" />
                    </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">{order.address?.firstName} {order.address?.lastName}</p>
                    <p>{order.address?.street}</p>
                    <p>{order.address?.city}, {order.address?.state} {order.address?.zipCode}</p>
                    <p>{order.address?.country}</p>
                </div>
                
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address?.street}, ${order.address?.city}, ${order.address?.zipCode}`)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                    View on Map &rarr;
                </a>
            </div>

        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;