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
  RotateCcw, // Icon for refund
  Truck,
  Package
} from "lucide-react";

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { axios, currency } = useAppContext();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [trackingId, setTrackingId] = useState("");
  const [status, setStatus] = useState("");
  
  // Change Detection State
  const [originalValues, setOriginalValues] = useState({ status: "", trackingId: "" });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch Order Data
  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.get(`/api/admin-orders/order/${orderId}`);
      if (data.success) {
        setOrder(data.order);
        
        // Set current form values
        setStatus(data.order.delivery.status);
        setTrackingId(data.order.delivery.trackingId || "");

        // Set original values for comparison
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

  // Check for changes effect
  useEffect(() => {
    const isStatusChanged = status !== originalValues.status;
    const isTrackingChanged = trackingId !== originalValues.trackingId;
    setHasChanges(isStatusChanged || isTrackingChanged);
  }, [status, trackingId, originalValues]);

  // --- HANDLERS ---

  const openPdf = (path, id) => {
    window.open(
      `${import.meta.env.VITE_BACKEND_URL}${path}/${id}`,
      "_blank",
      "noopener,noreferrer"
    );
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
        fetchOrderDetails(); // Reload data to sync state
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleRefund = async () => {
    if(!window.confirm("Are you sure you want to mark this payment as Refunded? This will update the database status.")) return;

    try {
      // Using existing payment update route
      const { data } = await axios.patch("/api/admin-orders/order/payment", {
        orderId,
        status: "refunded"
      });
      
      if(data.success) {
        toast.success("Refund status updated");
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error("Failed to process refund update");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!order) return null;

  // Helper to check if we should show Refund Button
  const canRefund = order.delivery.status === "cancelled" && order.payment.status === "paid";

  return (
    <div className="min-h-screen  p-6 md:p-10 bg-gray-50">
      {/* --- Header --- */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-3">
              Order #{order._id.slice(-6).toUpperCase()}
              <span
                className={`text-sm px-3 py-1 rounded-full border ${
                  status === "delivered"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : status === "cancelled"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openPdf("/api/admin-orders/order/invoice", order._id)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" /> Invoice
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-all ${
              hasChanges 
                ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN (2/3) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> Order Items
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img
                      src={item.product?.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {item.product?.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Qty: {item.quantity} × {currency}
                      {item.price}
                    </p>
                  </div>
                  <div className="font-bold text-gray-900">
                    {currency}
                    {item.quantity * item.price}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  {currency}
                  {order.pricing.subtotal}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-medium">
                  {currency}
                  {order.pricing.deliveryFee}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3 mt-3">
                <span>Total</span>
                <span>
                  {currency}
                  {order.pricing.total}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
               <Truck className="w-5 h-5 text-gray-400" /> Delivery Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {[
                    "order_placed",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              {status === "shipped" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="AWB Number"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN (1/3) --- */}
        <div className="space-y-6">
          
          {/* NEW: Shipping Method Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" /> Shipping Method
            </h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <Truck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-sm">
                        {order.courier?.name || "Standard Delivery"}
                    </p>
                    <p className="text-xs text-gray-500">
                        Cost: {currency}{order.courier?.price || 0}
                    </p>
                </div>
            </div>
            {order.courier?.minDays && (
                <div className="text-xs text-gray-500 flex justify-between border-t border-gray-100 pt-3">
                    <span>Est. Delivery</span>
                    <span className="font-medium text-gray-700">{order.courier.minDays} - {order.courier.maxDays} Days</span>
                </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" /> Customer
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                {order.address?.firstName?.[0] || "G"}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-gray-900 truncate">
                  {order.address?.firstName} {order.address?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{order.address?.email}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                Shipping Address
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.address?.street}</p>
                <p>
                  {order.address?.city}, {order.address?.state}
                </p>
                <p>
                  {order.address?.zipCode}, {order.address?.country}
                </p>
                <p className="flex items-center gap-1 mt-2 text-indigo-600 cursor-pointer hover:underline">
                  <MapPin className="w-3 h-3" /> View on Map
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info & Refund */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Payment</h3>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500">Method</span>
              <span className="font-medium capitalize">
                {order.payment.method}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-500">Status</span>
              <span
                className={`font-medium capitalize ${
                  order.payment.status === "paid" ? "text-emerald-600" : 
                  order.payment.status === "refunded" ? "text-gray-500" :
                  "text-amber-600"
                }`}
              >
                {order.payment.status}
              </span>
            </div>

            {/* Refund Action - Only show if Cancelled & Paid */}
            {canRefund && (
              <button 
                onClick={handleRefund}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Mark as Refunded
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;