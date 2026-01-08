import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

const ORDER_STATUSES = [
    "order_placed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"
];

const Orders = () => {
    const { currency, axios } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get("/api/admin/orders");
            if (data.success) setOrders(data.orders);
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    /* ---------------- ACTION HANDLERS ---------------- */

    const updateStatus = async (orderId, status) => {
        try {
            setLoadingId(orderId);
            await axios.patch("/api/admin/order/status", { orderId, status });
            toast.success("Status updated");
            fetchOrders();
        } catch {
            toast.error("Update failed");
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            default: return 'bg-orange-100 text-orange-700';
        }
    };

    return (
        <div className="flex-1 h-screen bg-gray-50/50 overflow-y-auto">
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage customer orders and fulfillment</p>
                    </div>
                    <button onClick={fetchOrders} className="text-sm bg-white border px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-all">
                        Refresh Data
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Order & Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                    {/* ORDER ID & DATE */}
                                    <td className="px-6 py-5">
                                        <div className="font-medium text-gray-900 text-sm">#{order._id.slice(-6).toUpperCase()}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>

                                    {/* CUSTOMER & SHIPPING */}
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-medium text-gray-900">{order.address.firstName} {order.address.lastName}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{order.address.city}, {order.address.country}</div>
                                    </td>

                                    {/* ITEMS & TOTAL */}
                                    <td className="px-6 py-5">
                                        <div className="text-sm text-gray-700 font-medium">
                                            {currency}{order.pricing.total}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.items.length} {order.items.length > 1 ? 'items' : 'item'}
                                        </div>
                                    </td>

                                    {/* PAYMENT STATUS */}
                                    <td className="px-6 py-5">
                                        <select
                                            value={order.payment.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            className="text-xs font-medium border-none bg-gray-100 rounded-full px-3 py-1 cursor-pointer focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="pending text-orange-500">Pending</option>
                                            <option value="paid text-green-500">Paid</option>
                                            <option value="failed text-red-500">Failed</option>
                                        </select>
                                    </td>

                                    {/* DELIVERY STATUS */}
                                    <td className="px-6 py-5">
                                        <select
                                            value={order.delivery.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            disabled={loadingId === order._id}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer ${getStatusStyles(order.delivery.status)}`}
                                        >
                                            {ORDER_STATUSES.map((s) => (
                                                <option key={s} value={s} className="bg-white text-gray-900">
                                                    {s.replaceAll("_", " ").toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="px-6 py-5 text-right space-x-2">
                                        <button 
                                            onClick={() => window.open(`/api/admin/order/invoice/${order._id}`)}
                                            className="inline-flex items-center p-2 text-gray-400 hover:text-primary transition-colors"
                                            title="Download Invoice"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                        </button>
                                        <button 
                                            onClick={() => window.open(`/api/admin/order/label/${order._id}`)}
                                            className="inline-flex items-center p-2 text-gray-400 hover:text-gray-900 transition-colors"
                                            title="Shipping Label"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Orders;