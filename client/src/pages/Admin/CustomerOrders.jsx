import React, { useEffect,  useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

// --- ICONS ---
const BackIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);
const FileTextIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CustomerOrders = () => {
    const { userId } = useParams();
  const navigate = useNavigate();
  const { axios, currency } = useAppContext();

  const [customer, setCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [ordersRes, customerRes] = await Promise.all([
          axios.get(`/api/admin-users/user/${userId}`),
          axios.get(`/api/admin-users/${userId}/details`)
        ]);

        if (ordersRes.data.success) {
          setCustomerOrders(ordersRes.data.orders);
        }

        if (customerRes.data.success) {
          setCustomer(customerRes.data.user);
        }
      } catch (err) {
        toast.error("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, axios]);
  

  const getStatusStyles = (status) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };
  if (loading) {
  return (
    <div className="p-12 text-center text-slate-400">
      Loading order history…
    </div>
  );
}

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-gray-100 font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
        <div className=" mx-auto space-y-6">
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/admin/users")}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
            >
              <BackIcon />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Order History
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <span>Customer:</span>
                <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {customer ? customer.name : userId}
                </span>
                {customer?.mobile && <span>• {customer.mobile}</span>}
              </div>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {customerOrders.length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {currency}
                {customerOrders
                  .reduce((acc, o) => acc + o.pricing.total, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Last Order
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {customerOrders.length > 0
                  ? new Date(customerOrders[0].createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {customerOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No orders found for this customer.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-slate-700">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.items.length} Items
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusStyles(
                            order.delivery.status
                          )}`}
                        >
                          {order.delivery.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {currency}
                        {order.pricing.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 ml-auto"
                          onClick={() =>
                            window.open(
                              `${
                                import.meta.env.VITE_BACKEND_URL
                              }/api/admin-orders/order/invoice/${order._id}`,
                              "_blank"
                            )
                          }
                        >
                          <FileTextIcon /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
