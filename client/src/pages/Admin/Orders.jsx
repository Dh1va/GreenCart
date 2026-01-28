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
  ArrowRight,
  CreditCard,
  Banknote
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
  const { currency, orders, fetchOrders } = useAppContext();
  const navigate = useNavigate();

  // --- FILTERS STATE ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");        // New
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All"); // New
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const openPdf = (path, id) => {
    window.open(
      `${import.meta.env.VITE_BACKEND_URL}${path}/${id}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  /* ---------------- FILTERS LOGIC ---------------- */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Search Logic
      const term = search.toUpperCase();
      const idMatch = o._id.slice(-6).toUpperCase().includes(term);
      const trackingMatch = o.delivery.trackingId ? o.delivery.trackingId.toUpperCase().includes(term) : false;
      const nameMatch = o.address
        ? `${o.address.firstName} ${o.address.lastName}`.toUpperCase().includes(term)
        : false;
      const searchMatch = idMatch || nameMatch || trackingMatch;

      // 2. Filter Logic
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
      case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "cancelled": return "bg-rose-50 text-rose-700 border-rose-100";
      case "shipped":
      case "out_for_delivery": return "bg-blue-50 text-blue-700 border-blue-100";
      case "processing": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
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
            
            {/* Create Button (Desktop) */}
            <button
                onClick={() => navigate("/admin/orders/create")}
                className="hidden md:flex items-center gap-2 bg-[#1E2A5E] hover:bg-[#151f42] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all"
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
                placeholder="Search ID, Name, or Tracking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Order Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-w-[140px]"
                >
                  <option value="All">All Statuses</option>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{formatText(s)}</option>)}
                </select>

                {/* ✅ Payment Method Filter */}
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-w-[140px]"
                >
                  <option value="All">All Methods</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === 'cod' ? 'COD' : formatText(m)}</option>)}
                </select>

                {/* ✅ Payment Status Filter */}
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none min-w-[140px]"
                >
                  <option value="All">All Payments</option>
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{formatText(s)}</option>)}
                </select>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className={`p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all ${isRefreshing ? "animate-spin" : ""}`}
                  title="Refresh Data"
                >
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
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Courier</th> 
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const name = order.address ? `${order.address.firstName} ${order.address.lastName}` : "Guest";
                    const isCOD = order.payment.method === "cod";

                    return (
                      <tr
                        key={order._id}
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-medium text-gray-900 group-hover:text-indigo-600">#{order._id.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{name}</span>
                            <span className="text-xs text-gray-400">{order.address?.phone || "No phone"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase">
                                 {isCOD ? <Banknote className="w-3.5 h-3.5 text-gray-500" /> : <CreditCard className="w-3.5 h-3.5 text-indigo-500" />}
                                 {order.payment.method === "cod" ? "COD" : order.payment.method}
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                 order.payment.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                 : order.payment.status === "failed" ? "bg-red-50 text-red-700 border-red-200"
                                 : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                 {order.payment.status}
                           </span>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                           <span className="text-sm text-gray-600 font-medium">{order.courier?.name || "Standard"}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getStatusStyles(order.delivery.status)}`}>
                            {formatText(order.delivery.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                          {currency}{order.pricing.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => openPdf("/api/admin-orders/order/invoice", order._id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md" title="Invoice"><FileText className="w-4 h-4" /></button>
                            <button onClick={() => openPdf("/api/admin-orders/order/label", order._id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md" title="Shipping Label"><Printer className="w-4 h-4" /></button>
                            <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="ml-2 flex items-center gap-1 pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md text-xs font-bold hover:bg-indigo-100 hover:border-indigo-200">Manage <ArrowRight className="w-3 h-3" /></button>
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