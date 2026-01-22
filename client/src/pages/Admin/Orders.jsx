import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import Pagination from "../../components/Admin/Pagination";
import { useNavigate } from "react-router-dom";

/* ---------------- CONSTANTS ---------------- */

const ORDER_STATUSES = [
  "order_placed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

/* ---------------- COMPONENT ---------------- */

const Orders = () => {
  const { currency, orders, setOrders, ordersLoaded, fetchOrders, axios } =
    useAppContext();

  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 10;

  /* ---------------- LOAD ONCE ---------------- */

  useEffect(() => {
     fetchOrders();
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const updateStatus = async (orderId, newStatus) => {
    let trackingId = null;
    let trackingUrl = null;

    // 1. Prompt for Tracking ID if status is 'shipped'
    if (newStatus === "shipped") {
      trackingId = prompt("Please enter Tracking ID / AWB Number:");
      if (trackingId === null) return; // Cancelled by admin
      // Optional: trackingUrl = prompt("Enter Tracking URL (Optional):");
    }

    try {
      setLoadingId(orderId);
     
      const { data } = await axios.patch("/api/admin-orders/order/status", {
        orderId,
        status: newStatus,
        trackingId, // Send only if captured
        trackingUrl,
      });

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  delivery: {
                    ...order.delivery,
                    status: newStatus,
                    // Optimistically update tracking info
                    ...(trackingId && { trackingId }),
                  },
                }
              : order
          )
        );
        toast.success(data.message || "Status updated");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Error updating status");
    } finally {
      setLoadingId(null);
    }
  };

  const openPdf = (path, id) => {
    window.open(
      `${import.meta.env.VITE_BACKEND_URL}${path}/${id}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ---------------- FILTERS ---------------- */

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const term = search.toUpperCase();
      const idMatch = o._id.slice(-6).toUpperCase().includes(term);
      const nameMatch = o.address
        ? `${o.address.firstName} ${o.address.lastName}`
            .toUpperCase()
            .includes(term)
        : false;
      const statusMatch =
        statusFilter === "All" || o.delivery.status === statusFilter;

      return (idMatch || nameMatch) && statusMatch;
    });
  }, [orders, search, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  /* ---------------- HELPERS ---------------- */

  const getStatusStyles = (status) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "shipped":
      case "out_for_delivery":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatStatusText = (text) =>
    text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  /* ---------------- UI ---------------- */

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-gray-100 font-sans">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Orders
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track customer orders.
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2.5 w-60 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-sm"
            >
              <option value="All">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatStatusText(s)}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigate("/admin/orders/create")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              + Create Order
            </button>

            <button
              onClick={handleRefresh}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-lg font-semibold shadow-lg shadow-gray-900/20 transition-all"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Courier & Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.length ? (
                paginatedOrders.map((order) => {
                  const name = order.address
                    ? `${order.address.firstName} ${order.address.lastName}`
                    : "Guest";

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-gray-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {name}
                      </td>

                      <td className="px-6 py-4">
                        <div className="relative inline-block w-[180px]">
                          <select
                            value={order.delivery.status}
                            disabled={loadingId === order._id}
                            onChange={(e) =>
                              updateStatus(order._id, e.target.value)
                            }
                            className={`w-full px-3 py-1.5 pr-8 text-xs font-bold rounded-lg border
                            appearance-none outline-none focus:outline-none focus:ring-0 focus:border-current
                            cursor-pointer
                            ${getStatusStyles(order.delivery.status)}`}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="bg-white text-gray-700"
                              >
                                {formatStatusText(s)}
                              </option>
                            ))}
                          </select>

                          {/* Dropdown Icon */}
                          <div className="pointer-events-none absolute top-2 right-2 flex items-center text-current opacity-60">
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Courier & Tracking Display */}
                        <div className="mt-2 text-xs">
                          <p className="text-gray-500 font-medium">
                            {order.courier?.name || "Standard"}
                          </p>
                          {order.delivery.trackingId && (
                            <p className="text-blue-600 font-mono mt-0.5 bg-blue-50 inline-block px-1.5 py-0.5 rounded">
                              Ref: {order.delivery.trackingId}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900">
                        {currency}
                        {order.pricing.total.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() =>
                              openPdf(
                                "/api/admin-orders/order/invoice",
                                order._id
                              )
                            }
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Download Invoice"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() =>
                              openPdf(
                                "/api/admin-orders/order/label",
                                order._id
                              )
                            }
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Download Label"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-20 text-center text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <Pagination
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- SUB COMPONENTS & ICONS ---------------- */
// ... (Your existing icons: ChevronDownIcon, etc. - keep them here)
const ChevronDownIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
       {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
     {" "}
  </svg>
);

export default Orders;
