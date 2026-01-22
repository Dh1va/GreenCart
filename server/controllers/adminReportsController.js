import Order from "../models/Order.js";

const getRangeDates = ({ range }) => {
  const end = new Date();
  const start = new Date();

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (range === "7days") {
    start.setDate(end.getDate() - 7);
  } else if (range === "30days") {
    start.setDate(end.getDate() - 30);
  } else if (range === "90days") {
    start.setDate(end.getDate() - 90);
  } else {
    start.setDate(end.getDate() - 30);
  }

  return { start, end };
};

export const getReportsOverview = async (req, res) => {
  try {
    const range = req.query.range || "30days";
    const status = req.query.status || "all";
    const payment = req.query.payment || "all";

    const { start, end } = getRangeDates({ range });

    const match = {
      createdAt: { $gte: start, $lte: end },
    };

    // ✅ Your status is inside delivery.status
    if (status !== "all") {
      match["delivery.status"] = status;
    }

    // ✅ Your payment method is inside payment.method
    if (payment !== "all") {
      match["payment.method"] = payment;
    }

    // ============================
    // 1) KPI STATS
    // ============================
    const statsAgg = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.total" },
          totalOrders: { $sum: 1 },
          totalSubtotal: { $sum: "$pricing.subtotal" },
          totalTax: { $sum: "$pricing.tax" },
          totalShipping: { $sum: "$pricing.deliveryFee" },
          totalDiscount: { $sum: "$pricing.discount" },
          uniqueCustomers: { $addToSet: "$user" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          totalSubtotal: 1,
          totalTax: 1,
          totalShipping: 1,
          totalDiscount: 1,
          uniqueCustomers: { $size: "$uniqueCustomers" },
          avgOrderValue: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalRevenue", "$totalOrders"] },
            ],
          },
        },
      },
    ]);

    const stats = statsAgg[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalSubtotal: 0,
      totalTax: 0,
      totalShipping: 0,
      totalDiscount: 0,
      uniqueCustomers: 0,
      avgOrderValue: 0,
    };

    // ============================
    // 2) DAILY CHART (Revenue + Orders)
    // ============================
    const chart = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id.day",
          revenue: 1,
          orders: 1,
        },
      },
    ]);

    // ============================
    // 3) STATUS BREAKDOWN
    // ============================
    const statusBreakdown = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$delivery.status",
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.total" },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          revenue: 1,
        },
      },
    ]);

    // ============================
    // 4) PAYMENT BREAKDOWN
    // ============================
    const paymentBreakdown = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$payment.method",
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.total" },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          method: "$_id",
          count: 1,
          revenue: 1,
        },
      },
    ]);

    // ============================
    // 5) TOP PRODUCTS (Qty Sold)
    // ============================
    const topProducts = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          soldQty: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { soldQty: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: { $ifNull: ["$product.name", "Unknown"] },
          image: { $arrayElemAt: ["$product.images", 0] },
          soldQty: 1,
          revenue: 1,
        },
      },
    ]);

    res.json({
      success: true,
      filters: { range, status, payment },
      stats,
      chart,
      statusBreakdown,
      paymentBreakdown,
      topProducts,
    });
  } catch (err) {
    console.error("REPORTS OVERVIEW ERROR:", err);
    res.status(500).json({ success: false, message: "Reports failed" });
  }
};

export const exportReportsCSV = async (req, res) => {
  try {
    const range = req.query.range || "30days";
    const status = req.query.status || "all";
    const payment = req.query.payment || "all";

    const end = new Date();
    const start = new Date();
    if (range === "7days") start.setDate(end.getDate() - 7);
    else if (range === "30days") start.setDate(end.getDate() - 30);
    else if (range === "90days") start.setDate(end.getDate() - 90);
    else start.setDate(end.getDate() - 30);

    const match = { createdAt: { $gte: start, $lte: end } };
    if (status !== "all") match["delivery.status"] = status;
    if (payment !== "all") match["payment.method"] = payment;

    const orders = await Order.find(match)
      .select("pricing delivery payment createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const rows = [
      ["Date", "Status", "PaymentMethod", "PaymentStatus", "Subtotal", "Tax", "Shipping", "Discount", "Total"],
      ...orders.map((o) => [
        new Date(o.createdAt).toISOString().slice(0, 10),
        o.delivery?.status,
        o.payment?.method,
        o.payment?.status,
        o.pricing?.subtotal ?? 0,
        o.pricing?.tax ?? 0,
        o.pricing?.deliveryFee ?? 0,
        o.pricing?.discount ?? 0,
        o.pricing?.total ?? 0,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=reports_${range}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("EXPORT CSV ERROR:", err);
    res.status(500).json({ success: false, message: "Export failed" });
  }
};
