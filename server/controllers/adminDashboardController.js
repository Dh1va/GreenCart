import Order from "../models/Order.js";
import Product from "../models/product.js";
import User from "../models/user.js";

export const getDashboardStats = async (req, res) => {
  try {
    /* ---------------- 1. FETCH ALL DATA ---------------- */
    // Note: As your app grows, use MongoDB aggregation ($match, $group) instead of fetching all.
    const [orders, products, users] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).lean(),
      Product.find().lean(),
      User.find({ role: "user" }).lean(),
    ]);

    /* ---------------- 2. DATE SETUP ---------------- */
    const now = new Date();
    
    // Start of This Month (e.g., Dec 1st)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Start of Last Month (e.g., Nov 1st)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // End of Last Month (e.g., Nov 30th 23:59:59)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    /* ---------------- 3. CALCULATE METRICS ---------------- */
    
    // -- REVENUE --
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    // -- ORDERS --
    const totalOrders = orders.length;
    let thisMonthOrders = 0;
    let lastMonthOrders = 0;

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const amount = Number(order.pricing?.total || 0);
      const isPaid = order.delivery?.status !== "cancelled"; // Logic for valid revenue

      // 1. Total Revenue (Lifetime)
      if (isPaid) totalRevenue += amount;

      // 2. This Month vs Last Month Logic
      if (orderDate >= thisMonthStart) {
        thisMonthOrders++;
        if (isPaid) thisMonthRevenue += amount;
      } else if (orderDate >= lastMonthStart && orderDate <= lastMonthEnd) {
        lastMonthOrders++;
        if (isPaid) lastMonthRevenue += amount;
      }
    });

    // -- USERS --
    const totalUsers = users.length;
    let thisMonthUsers = 0;
    let lastMonthUsers = 0;

    users.forEach((user) => {
      const userDate = new Date(user.createdAt);
      if (userDate >= thisMonthStart) {
        thisMonthUsers++;
      } else if (userDate >= lastMonthStart && userDate <= lastMonthEnd) {
        lastMonthUsers++;
      }
    });

    const totalProducts = products.length; // Products usually don't need monthly trends

    /* ---------------- 4. RECENT ORDERS ---------------- */
    const recentOrders = orders.slice(0, 5);

    /* ---------------- 5. REVENUE CHART (LAST 7 DAYS) ---------------- */
    const revenueMap = {};
    orders.forEach((order) => {
        if (order.delivery?.status === "cancelled") return;
        const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
        revenueMap[dateKey] = (revenueMap[dateKey] || 0) + Number(order.pricing?.total || 0);
    });

    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      revenueChart.push({ date: key, total: revenueMap[key] || 0 });
    }

    /* ---------------- RESPONSE ---------------- */
    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        // Send the granular data for calculating trends on frontend
        trends: {
            revenue: { current: thisMonthRevenue, previous: lastMonthRevenue },
            orders: { current: thisMonthOrders, previous: lastMonthOrders },
            users: { current: thisMonthUsers, previous: lastMonthUsers }
        }
      },
      recentOrders,
      revenueChart,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard data" });
  }
};