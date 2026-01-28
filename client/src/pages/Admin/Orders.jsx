import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import Pagination from "../../components/Admin/Pagination";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Plus,
  FileText,
  Printer,
  Calendar,
  Truck,
  Copy,
  ChevronDown
} from "lucide-react";

/* ---------------- CONSTANTS ---------------- */
const ORDER_STATUSES = [
  "order_placed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed"];
const PAYMENT_METHODS = ["cod", "razorpay", "phonepe"];

const Orders = () => {
  const { currency, orders, fetchOrders, axios } = useAppContext();
  const navigate = useNavigate();

  // --- FILTERS STATE ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const itemsPerPage = 10;

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
    toast.success("Orders refreshed");
  };

  /* ---------------- HANDLERS ---------------- */
  
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await axios.patch("/api/admin-orders/order/status", {
        orderId,
        status: newStatus,
      });

      if (data.success) {
        toast.success("Status updated");
        await fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const openPdf = (path, id) => {
    window.open(
      `${import.meta.env.VITE_BACKEND_URL}${path}/${id}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  /* ---------------- FILTERS LOGIC ---------------- */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search Logic
      const term = search.toUpperCase();
      const idMatch = o._id.slice(-6).toUpperCase().includes(term);
      const trackingMatch = o.delivery.trackingId ? o.delivery.trackingId.toUpperCase().includes(term) : false;
      const nameMatch = o.address
        ? `${o.address.firstName} ${o.address.lastName}`.toUpperCase().includes(term)
        : false;
      const searchMatch = idMatch || nameMatch || trackingMatch;

      // Filter Logic
      const orderStatusMatch = statusFilter === "All" || o.delivery.status === statusFilter;
      const methodMatch = methodFilter === "All" || o.payment.method === methodFilter;
      const payStatusMatch = paymentStatusFilter === "All" || o.payment.status === paymentStatusFilter;

      return searchMatch && orderStatusMatch && methodMatch && payStatusMatch;
    });
  }, [orders, search, statusFilter, methodFilter, paymentStatusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  /* ---------------- HELPERS ---------------- */
  const getStatusStyles = (status) => {
    switch (status) {
      case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200 focus:ring-emerald-400";
      case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-200 focus:ring-rose-400";
      case "shipped":
      case "out_for_delivery": return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200 focus:ring-blue-400";
      case "processing": return "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200 focus:ring-amber-400";
      default: return "bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-200 focus:ring-slate-400";
    }
  };

  const formatText = (text) => text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  /* ---------------- RENDER ---------------- */
  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-gray-50/50 font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders.</p>
            </div>
            
            <button
                onClick={() => navigate("/admin/orders/create")}
                className="hidden md:flex items-center gap-2 bg-[#1E2A5E] hover:bg-[#151f42] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95"
            >
                <Plus className="w-4 h-4" /> Create Order
            </button>
          </div>

          {/* --- FILTERS TOOLBAR --- */}
          <div className="flex flex-col xl:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            {/* Search */}
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search ID, Name, or Tracking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-w-[140px]">
                  <option value="All">All Statuses</option>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{formatText(s)}</option>)}
                </select>

                <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-w-[140px]">
                  <option value="All">All Methods</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === 'cod' ? 'COD' : formatText(m)}</option>)}
                </select>

                <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-w-[140px]">
                  <option value="All">All Payments</option>
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{formatText(s)}</option>)}
                </select>

                <button onClick={handleRefresh} className={`p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all ${isRefreshing ? "animate-spin" : ""}`} title="Refresh Data">
                  <RefreshCw className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] md:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[180px]">Order Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipment ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const name = order.address ? `${order.address.firstName} ${order.address.lastName}` : "Guest";
                    const isUpdating = updatingId === order._id;

                    return (
                      <tr
                        key={order._id}
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      >
                        {/* 1. ORDER DETAILS (ID + DATE) */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="font-mono font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </div>
                            </div>
                        </td>

                        {/* 2. CUSTOMER */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{name}</span>
                        </td>

                        {/* 3. SHIPMENT ID COLUMN */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                                {order.delivery.trackingId ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                            {order.delivery.trackingId}
                                        </span>
                                        <button onClick={(e) => copyToClipboard(order.delivery.trackingId, e)} className="text-gray-400 hover:text-indigo-600">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Pending</span>
                                )}
                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide flex items-center gap-1">
                                    <Truck className="w-3 h-3" />
                                    {order.courier?.name || "Standard"}
                                </span>
                            </div>
                        </td>

                        {/* 4. PAYMENT */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                order.payment.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : order.payment.status === "failed" ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                                {order.payment.status}
                            </span>
                        </td>

                        {/* 5. STATUS CONTROL (DROPDOWN) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className={`relative w-fit group/select ${isUpdating ? "opacity-50 pointer-events-none" : ""}`} 
                            onClick={(e) => e.stopPropagation()} 
                          >
                             <select
                                value={order.delivery.status}
                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                disabled={isUpdating}
                                className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-bold capitalize border outline-none transition-all shadow-sm ${getStatusStyles(order.delivery.status)}`}
                             >
                                {ORDER_STATUSES.map(s => (
                                    <option key={s} value={s} className="bg-white text-gray-800 py-1">
                                        {formatText(s)}
                                    </option>
                                ))}
                             </select>
                             <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                {isUpdating ? (
                                    <RefreshCw className="w-3 h-3 animate-spin text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                )}
                             </div>
                          </div>
                        </td>

                        {/* 6. TOTAL */}
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap text-right">
                          {currency}{order.pricing.total.toLocaleString()}
                        </td>

                        {/* 7. ACTIONS (BADGES) */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                            
                            {/* Invoice Badge Button */}
                            <button
                              onClick={() => openPdf("/api/admin-orders/order/invoice", order._id)}
                              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm"
                              title="Download Invoice"
                            >
                              <FileText className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                              <span>Invoice</span>
                            </button>

                            {/* Label Badge Button */}
                            <button
                              onClick={() => openPdf("/api/admin-orders/order/label", order._id)}
                              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-sm"
                              title="Download Label"
                            >
                              <Printer className="w-4 h-4 text-indigo-500 group-hover:text-indigo-700" />
                              <span>Label</span>
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="text-gray-900 font-medium">No orders found</p>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/50">
            <Pagination totalItems={filteredOrders.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;