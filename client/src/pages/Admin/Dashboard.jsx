import React, { useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { currency, dashboardData, fetchDashboardOnce } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardOnce();
  }, []);

  const loading = !dashboardData.loaded;
  
  // Safe Destructuring with Fallbacks
  const stats = dashboardData.stats || {};
  const trends = stats.trends || {
    revenue: { current: 0, previous: 0 },
    orders: { current: 0, previous: 0 },
    users: { current: 0, previous: 0 },
  };

  const recentOrders = dashboardData.recentOrders || [];
  const revenueChart = dashboardData.revenueChart || [];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-grey-100 font-sans">
      
      {/* Main Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
        
        {/* Page Wrapper */}
        <div className="space-y-8 pb-12">
          
          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Overview of your store&apos;s performance.
            </p>
          </div>

          {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Revenue"
              value={`${currency}${stats.totalRevenue?.toLocaleString() || 0}`}
              icon={<DollarIcon />}
              trend={calculateTrend(trends.revenue.current, trends.revenue.previous)}
              color="emerald"
            />
            <KpiCard
              title="Total Orders"
              value={stats.totalOrders || 0}
              icon={<BagIcon />}
              trend={calculateTrend(trends.orders.current, trends.orders.previous)}
              color="blue"
            />
            <KpiCard
              title="Active Products"
              value={stats.totalProducts || 0}
              icon={<BoxIcon />}
              trend="In Stock" // Static for now unless you track product growth
              color="indigo"
            />
            <KpiCard
              title="Total Customers"
              value={stats.totalUsers || 0}
              icon={<UsersIcon />}
              trend={calculateTrend(trends.users.current, trends.users.previous)}
              color="orange"
            />
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* REVENUE GRAPH */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Revenue Overview
                </h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  Last 7 Days
                </span>
              </div>

              <div className="h-64 flex items-end justify-between gap-3 relative">
                {revenueChart.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    No revenue data available
                  </div>
                ) : (
                  (() => {
                    const maxRevenue = Math.max(
                      ...revenueChart.map((d) => d.total),
                      100
                    );

                    return revenueChart.map((day, i) => {
                      const heightPercentage = (day.total / maxRevenue) * 100;

                      return (
                        <div
                          key={i}
                          className="w-full h-full flex flex-col justify-end items-center gap-2 group cursor-pointer relative"
                        >
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                            {currency}
                            {day.total.toLocaleString()}
                          </div>

                          {/* Bar Track */}
                          <div className="w-full h-full bg-slate-50 rounded-t-lg relative overflow-hidden flex items-end">
                            <div
                              className="w-full rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-90 bg-gradient-to-t from-indigo-600 to-indigo-200"
                              style={{ height: `${heightPercentage}%` }}
                            />
                          </div>

                          {/* Label */}
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-lg font-bold text-slate-800">
                  Recent Orders
                </h3>
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View All
                </button>
              </div>

              {/* Added [&::-webkit-scrollbar]:hidden to hide scrollbar */}
              <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
                {recentOrders.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No orders yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-indigo-50 p-2 rounded-full text-indigo-600 shrink-0">
                                <BagIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {order.address.firstName}{" "}
                                  {order.address.lastName}
                                </p>
                                <p className="text-xs text-slate-500 font-mono truncate">
                                  #{order._id.slice(-6).toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <p className="text-sm font-bold text-slate-900">
                              {currency}
                              {order.pricing.total}
                            </p>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(
                                order.delivery.status
                              )}`}
                            >
                              {order.delivery.status}
                            </span>
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
      </div>
    </div>
  );
};

/* ---------------- HELPER FUNCTIONS ---------------- */

const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return "0.0%";
  const percentage = ((current - previous) / previous) * 100;
  return percentage.toFixed(1) + "%";
};

const getStatusColor = (status) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
      return "bg-rose-100 text-rose-700";
    case "shipped":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

/* ---------------- HELPER COMPONENTS ---------------- */

const KpiCard = ({ title, value, icon, trend, color }) => {
  const colorStyles = {
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    indigo: "text-indigo-600 bg-indigo-50",
    orange: "text-orange-600 bg-orange-50",
  };

  // Logic to determine color of the trend badge
  const isNegative = trend.includes("-");
  const isNeutral = !trend.includes("%") || trend === "0.0%"; // E.g. "In Stock"

  let trendColor = "text-emerald-600 bg-emerald-50"; // Default Green
  let trendIcon = "+";

  if (isNegative) {
    trendColor = "text-rose-600 bg-rose-50";
    trendIcon = ""; // Minus sign is already in the number
  } else if (isNeutral) {
    trendColor = "text-slate-600 bg-slate-100";
    trendIcon = "";
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color] || colorStyles.indigo}`}>
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendColor}`}>
          {trendIcon}{trend}
        </span>
        <span className="text-xs text-slate-400">vs last month</span>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-6 animate-pulse p-8">
    <div className="h-8 bg-slate-200 w-48 rounded mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-80 bg-slate-200 rounded-2xl"></div>
      <div className="h-80 bg-slate-200 rounded-2xl"></div>
    </div>
  </div>
);

/* ---------------- ICONS ---------------- */

const DollarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const BagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);

const BoxIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export default Dashboard;