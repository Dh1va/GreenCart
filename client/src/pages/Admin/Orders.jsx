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
  ChevronDown,
  User as UserIcon,
  CreditCard,
  ExternalLink
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
    toast.success("Orders refreshed");
  };

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
    window.open(`${import.meta.env.VITE_BACKEND_URL}${path}/${id}`, "_blank", "noopener,noreferrer");
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const term = search.toUpperCase();
      const idMatch = o._id.slice(-6).toUpperCase().includes(term);
      const trackingMatch = o.delivery.trackingId ? o.delivery.trackingId.toUpperCase().includes(term) : false;
      const nameMatch = o.address ? `${o.address.firstName} ${o.address.lastName}`.toUpperCase().includes(term) : false;
      const searchMatch = idMatch || nameMatch || trackingMatch;
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

  const getStatusStyles = (status) => {
    switch (status) {
      case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
      case "shipped":
      case "out_for_delivery": return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatText = (text) => text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col bg-gray-50/50 font-sans">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 no-scrollbar">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders.</p>
          </div>
          <button
            onClick={() => navigate("/admin/orders/create")}
            className="flex items-center justify-center gap-2 bg-[#1E2A5E] hover:bg-[#151f42] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Order
          </button>
        </div>

        {/* --- FILTERS TOOLBAR --- */}
        <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search ID, Name, or Tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none">
              <option value="All">All Statuses</option>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{formatText(s)}</option>)}
            </select>

            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none">
              <option value="All">All Methods</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === 'cod' ? 'COD' : formatText(m)}</option>)}
            </select>

            <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none">
              <option value="All">All Payments</option>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{formatText(s)}</option>)}
            </select>

            <button onClick={handleRefresh} className={`flex items-center justify-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-indigo-600 transition-all ${isRefreshing ? "animate-spin" : ""}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- DESKTOP TABLE VIEW (Shown only on xl screens and above) --- */}
        <div className="hidden xl:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Order Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Shipment</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOrders.map((order) => (
                <tr key={order._id} onClick={() => navigate(`/admin/orders/${order._id}`)} className="hover:bg-gray-50/80 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[#1E2A5E]">#{order._id.slice(-6).toUpperCase()}</span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700">{order.address ? `${order.address.firstName} ${order.address.lastName}` : "Guest"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {order.delivery.trackingId ? (
                         <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded border w-fit">{order.delivery.trackingId}</span>
                      ) : <span className="text-xs text-gray-300">N/A</span>}
                      <span className="text-[10px] text-gray-500 uppercase">{order.courier?.name || "Standard"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      order.payment.status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>{order.payment.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div onClick={(e) => e.stopPropagation()} className="relative w-fit">
                      <select
                        value={order.delivery.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`appearance-none pl-3 pr-8 py-1 rounded-full text-[11px] font-bold border outline-none cursor-pointer ${getStatusStyles(order.delivery.status)}`}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{formatText(s)}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#1E2A5E]">{currency}{order.pricing.total}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openPdf("/api/admin-orders/order/invoice", order._id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><FileText size={16}/></button>
                      <button onClick={() => openPdf("/api/admin-orders/order/label", order._id)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-500"><Printer size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE/TABLET CARD VIEW (Shown below xl) --- */}
        <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedOrders.map((order) => (
            <div 
              key={order._id}
              onClick={() => navigate(`/admin/orders/${order._id}`)}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-bold text-[#1E2A5E] text-lg">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusStyles(order.delivery.status)}`}>
                  {formatText(order.delivery.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 py-2 border-y border-gray-50">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Customer</span>
                  <span className="text-sm font-medium flex items-center gap-2"><UserIcon size={14} className="text-gray-400"/> {order.address?.firstName || "Guest"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Amount</span>
                  <span className="text-sm font-bold text-[#1E2A5E]">{currency}{order.pricing.total}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Payment</span>
                  <span className="text-xs font-semibold flex items-center gap-2">
                    <CreditCard size={14} className="text-gray-400"/> {order.payment.method.toUpperCase()} 
                    <span className={order.payment.status === "paid" ? "text-emerald-500" : "text-amber-500"}>({order.payment.status})</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tracking</span>
                  <span className="text-xs font-mono text-indigo-600 truncate">{order.delivery.trackingId || "Not assigned"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openPdf("/api/admin-orders/order/invoice", order._id)}} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 border border-gray-100">
                    <FileText size={14}/> Invoice
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openPdf("/api/admin-orders/order/label", order._id)}} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl text-xs font-bold text-indigo-600 border border-indigo-100">
                    <Printer size={14}/> Label
                  </button>
                </div>
                <button className="p-2 text-gray-400"><ExternalLink size={18}/></button>
              </div>
            </div>
          ))}
        </div>

        {paginatedOrders.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <Search className="mx-auto text-gray-300 mb-4" size={48}/>
            <p className="text-gray-500 font-medium">No orders match your criteria</p>
          </div>
        )}

        <div className="mt-8">
          <Pagination totalItems={filteredOrders.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};

export default Orders;