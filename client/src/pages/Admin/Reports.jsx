import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Download,
  Calendar,
  Filter,
  CreditCard,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

// --- Custom Components for Polish ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700">
        <p className="font-semibold mb-2 text-gray-300">{label}</p>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Revenue:</span>
          <span className="font-bold">{currency}{payload[0].value}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Orders:</span>
          <span className="font-bold">{payload[1].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const KPICard = ({ title, value, icon: Icon, colorClass, subValue }) => (
  <Card className="p-6 flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {subValue && <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1"><TrendingUp size={12} /> {subValue}</p>}
    </div>
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
      <Icon size={24} className={colorClass.replace("bg-", "text-")} />
    </div>
  </Card>
);

// --- Main Component ---

const Reports = () => {
  const { axios, currency } = useAppContext();
  const navigate = useNavigate();

  // State
  const [range, setRange] = useState("30days");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [loading, setLoading] = useState(true);

  // Data State
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/admin/reports/overview?range=${range}&status=${status}&payment=${payment}`
      );

      if (!data.success) {
        toast.error(data.message || "Reports failed");
        return;
      }

      setStats(data.stats);
      setChart(data.chart);
      setStatusBreakdown(data.statusBreakdown);
      setPaymentBreakdown(data.paymentBreakdown);
      setTopProducts(data.topProducts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range, status, payment]);

  const exportCSV = () => {
    window.open(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/reports/export?range=${range}&status=${status}&payment=${payment}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Track your business performance and growth metrics.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          {/* Range Filter */}
          <div className="relative group">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer hover:text-indigo-600 transition-colors outline-none"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

          {/* Status Filter */}
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer hover:text-indigo-600 transition-colors outline-none"
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

           {/* Payment Filter */}
           <div className="relative">
            <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer hover:text-indigo-600 transition-colors outline-none"
            >
              <option value="all">All Payments</option>
              <option value="cod">COD</option>
              <option value="razorpay">Razorpay</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="ml-auto flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={`${currency}${Number(stats?.totalRevenue || 0).toFixed(2)}`} 
          icon={DollarSign} 
          colorClass="bg-indigo-100 text-indigo-600"
          subValue="Revenue"
        />
        <KPICard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          icon={ShoppingBag} 
          colorClass="bg-blue-100 text-blue-600"
        />
        <KPICard 
          title="Active Customers" 
          value={stats?.uniqueCustomers || 0} 
          icon={Users} 
          colorClass="bg-orange-100 text-orange-600"
        />
        <KPICard 
          title="Avg. Order Value" 
          value={`${currency}${Number(stats?.avgOrderValue || 0).toFixed(2)}`} 
          icon={Package} 
          colorClass="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* --- CHART SECTION --- */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Revenue Analysis</h2>
            <p className="text-sm text-gray-500">Income vs Orders over time</p>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#34d399" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorOrders)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* --- BREAKDOWNS & TOP PRODUCTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
          <div className="space-y-4">
            {statusBreakdown.length === 0 ? (
               <div className="text-center py-10 text-gray-400 text-sm">No data available</div>
            ) : (
              statusBreakdown.map((item) => (
                <div key={item.status} className="group">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600 capitalize group-hover:text-indigo-600 transition-colors">{item.status.replace(/_/g, " ")}</span>
                    <span className="font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full" 
                      style={{ width: `${(item.count / stats?.totalOrders) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Payment Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Methods</h3>
          <div className="space-y-4">
             {paymentBreakdown.length === 0 ? (
               <div className="text-center py-10 text-gray-400 text-sm">No data available</div>
            ) : (
              paymentBreakdown.map((item) => (
                <div key={item.method} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50 transition-all cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md border shadow-sm text-gray-500">
                      <CreditCard size={16} />
                    </div>
                    <span className="font-medium text-gray-700 capitalize">{item.method}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.count} orders</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Products (Spans 3 cols on mobile, 1 on LG if you want, but here I'll put it in a separate full-width section usually, but let's fit it in the grid or make it full width below) */}
      </div>
        
      {/* FULL WIDTH TOP PRODUCTS */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <div>
            <h3 className="text-lg font-bold text-gray-900">Top Performing Products</h3>
            <p className="text-sm text-gray-500">Highest revenue generating items</p>
           </div>
           <button onClick={() => navigate('/admin/products')} className="text-sm text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
             View All Inventory <ArrowRight size={16} />
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400">No sales data found</td>
                </tr>
              ) : (
                topProducts.map((p, index) => (
                  <tr key={p.productId} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 font-mono text-xs w-4">#{index + 1}</span>
                        <div className="h-10 w-10 rounded-lg border border-gray-200 bg-white p-1 overflow-hidden shadow-sm">
                           {p.image ? (
                             <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                           ) : (
                             <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-300"><Package size={16} /></div>
                           )}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">
                      {p.soldQty} <span className="text-xs text-gray-400 font-normal">units</span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {currency}{Number(p.revenue || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {/* Mock trend for visuals */}
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                         +12%
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;