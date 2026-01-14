import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

const MyOrders = () => {
  const { axios, user, currency, navigate } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "text-green-600 bg-green-50 border-green-100";
      case "cancelled": return "text-red-600 bg-red-50 border-red-100";
      case "shipped":
      case "out_for_delivery": return "text-blue-600 bg-blue-50 border-blue-100";
      case "processing": return "text-amber-600 bg-amber-50 border-amber-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const getStatusLabel = (status) => status.replace(/_/g, " ").toUpperCase();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading your orders...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-500 mt-2">Check the status of recent orders and manage returns.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/all-products')} className="mt-4 text-primary font-semibold hover:underline">Start Shopping &rarr;</button>
        </div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Placed</p>
                      <p className="text-sm font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                      <p className="text-sm font-bold text-gray-900">{currency}{order.pricing.total}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Order ID</p>
                    <p className="text-sm font-mono text-gray-600">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    {/* Products List */}
                    <div className="flex-1 space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                             <img 
                                src={item.product?.images?.[0]} 
                                alt="" 
                                className="w-full h-full object-cover"
                             />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{item.product?.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.product?.description?.slice(0, 50)}...</p>
                            <p className="text-sm font-medium text-primary mt-2">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status & Tracker */}
                    <div className="lg:w-72 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                      <div className={`inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.delivery.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                        {getStatusLabel(order.delivery.status)}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div>
                            <p className="text-xs text-gray-500">Courier</p>
                            <p className="text-sm font-medium text-gray-900">{order.courier?.name || "Standard Shipping"}</p>
                        </div>
                        {order.delivery.trackingId && (
                            <div>
                                <p className="text-xs text-gray-500">Tracking Number</p>
                                <p className="text-sm font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mt-1">
                                    {order.delivery.trackingId}
                                </p>
                            </div>
                        )}
                      </div>

                      <button 
                        onClick={() => navigate(`/order-details/${order._id}`)}
                        className="mt-6 w-full py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MyOrders;