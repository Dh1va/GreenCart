import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Filter,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Copy,
} from "lucide-react";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

const MyOrders = () => {
  const { axios, user, currency, navigate } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("shipping");

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  // --- CONFIG: Cancel Window in Hours ---
  const CANCEL_WINDOW_HOURS = 24;

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Open the Modal
  const promptCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason(""); // Reset reason
    setIsModalOpen(true);
  };

  // 2. Actual API Call (Triggered by Modal)
  const handleConfirmCancel = async () => {
    if (!selectedOrderId) return;
    if (!cancelReason) {
      toast.error("Please select a reason for cancellation");
      return;
    }

    setIsCanceling(true);
    try {
      const { data } = await axios.post("/api/order/cancel", {
        orderId: selectedOrderId,
        reason: cancelReason,
      });

      if (data.success) {
        toast.success("Order cancelled successfully");
        // Update local state immediately
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrderId ? data.order : o)),
        );
        setIsModalOpen(false); // Close modal
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCanceling(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchOrders();
    socket.emit("join-user", user._id);

    socket.on("order:update", (order) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o._id === order._id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = order;
          return updated;
        }
        return [order, ...prev];
      });
    });
    return () => socket.off("order:update");
  }, [user]);

  // --- FILTER LOGIC ---
  const filteredOrders = orders.filter((order) => {
    const status = order.delivery.status;
    if (activeTab === "shipping") {
      return [
        "order_placed",
        "processing",
        "shipped",
        "out_for_delivery",
      ].includes(status);
    }
    if (activeTab === "arrived") return status === "delivered";
    if (activeTab === "canceled") return status === "cancelled";
    return true;
  });

  // --- HELPER: Can User Cancel? ---
  const canCancel = (order) => {
    if (
      order.delivery.status !== "order_placed" &&
      order.delivery.status !== "processing"
    )
      return false;

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const diffInHours = (now - orderDate) / 1000 / 60 / 60;

    return diffInHours < CANCEL_WINDOW_HOURS;
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-[#1E2A5E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen pt-15 pb-24 ">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        
        <h1 className="text-4xl font-bold text-[#1E2A5E] mb-6 text-center">My Orders</h1>

        {/* --- TABS --- */}
        <div className="w-full overflow-x-auto no-scrollbar pb-2 mb-6">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex min-w-max">
            {["shipping", "arrived", "canceled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-[#1E2A5E] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab === "shipping" ? "On Shipping" : tab}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {
                    orders.filter((o) => {
                      const s = o.delivery.status;
                      if (tab === "shipping")
                        return [
                          "order_placed",
                          "processing",
                          "shipped",
                          "out_for_delivery",
                        ].includes(s);
                      if (tab === "arrived") return s === "delivered";
                      if (tab === "canceled") return s === "cancelled";
                      return false;
                    }).length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>
        

        {/* --- LIST --- */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"
              >
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No orders found in this category.
                </p>
              </motion.div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  currency={currency}
                  navigate={navigate}
                  canCancel={canCancel(order)}
                  onCancel={() => promptCancelOrder(order._id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- PROFESSIONAL CANCEL MODAL --- */}
      <CancelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isProcessing={isCanceling}
        reason={cancelReason}
        setReason={setCancelReason}
      />
    </div>
  );
};

// --- SUB COMPONENT: ORDER CARD ---
const OrderCard = ({ order, currency, navigate, canCancel, onCancel }) => {
  const isCanceled = order.delivery.status === "cancelled";

  const handleCopyTracking = (e) => {
    e.stopPropagation();
    if (order.delivery.trackingId) {
      navigator.clipboard.writeText(order.delivery.trackingId);
      toast.success("Tracking ID copied!");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: ID + Tracking */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {/* Order ID */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="font-mono font-bold text-gray-900 text-sm">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>

          {/* Tracking ID (Visible if exists & not canceled) */}
          {order.delivery.trackingId && !isCanceled && (
            <div
              onClick={handleCopyTracking}
              className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors w-fit"
              title="Click to copy Tracking ID"
            >
              <Truck className="w-3 h-3" />
              <span className="font-mono font-medium">
                {order.delivery.trackingId}
              </span>
              <Copy className="w-3 h-3 opacity-50" />
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isCanceled
              ? "bg-red-50 text-red-600 border-red-100"
              : order.delivery.status === "delivered"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
          }`}
        >
          {isCanceled ? (
            <XCircle className="w-3.5 h-3.5" />
          ) : order.delivery.status === "delivered" ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Truck className="w-3.5 h-3.5" />
          )}
          {order.delivery.status.replace(/_/g, " ").toUpperCase()}
        </div>
      </div>

      {/* ITEMS */}
      <div className="p-5">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 ${
              idx > 0 ? "mt-6 pt-6 border-t border-gray-50" : ""
            }`}
          >
            {/* Image */}
            <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img
                src={item.product?.images?.[0]}
                alt={item.product?.name}
                className="w-full h-full object-cover mix-blend-multiply"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-900 truncate">
                {item.product?.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
              <p className="text-sm font-bold text-[#1E2A5E] mt-2">
                {currency}
                {item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER & ACTIONS */}
      <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Total Order
          </p>
          <p className="text-lg font-bold text-gray-900">
            {currency}
            {order.pricing.total.toLocaleString()}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {canCancel && (
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => navigate(`/order-details/${order._id}`)}
            className="flex-1 sm:flex-none px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- SUB COMPONENT: SAAS GRADE MODAL ---
const CancelModal = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  reason,
  setReason,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="absolute inset-0 bg-gray-900/40 "
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Cancel Order?
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone. If you paid online, the refund
                    will be processed to your source account within 5-7 business
                    days.
                  </p>
                </div>
              </div>

              {/* Reason Select */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Reason for cancellation
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E2A5E] focus:border-transparent transition-all"
                >
                  <option value="" disabled>
                    Select a reason...
                  </option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="shipping_cost">
                    Shipping cost is too high
                  </option>
                  <option value="delivery_time">
                    Delivery time is too long
                  </option>
                  <option value="created_by_mistake">Created by mistake</option>
                  <option value="found_cheaper">
                    Found a better price elsewhere
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isProcessing || !reason}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Yes, Cancel Order"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MyOrders;