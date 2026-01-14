import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";
import socket from "../socket";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const Appcontext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [suppressCartAutoOpen, setSuppressCartAutoOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const [invoices, setInvoices] = useState([]);
  

  const [dashboardData, setDashboardData] = useState({
    loaded: false,
    stats: null,
    recentOrders: [],
    revenueChart: [],
  });

  /* ============================
     🔒 CACHE FLAGS (NEW)
  ============================ */
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [couponsLoaded, setCouponsLoaded] = useState(false);
  const [couriersLoaded, setCouriersLoaded] = useState(false);
  const [invoicesLoaded, setInvoicesLoaded] = useState(false);

  /* ============================
     EXISTING FUNCTIONS (UNCHANGED)
  ============================ */

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      }
    } catch {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        setCategories(data.categories);
      }
    } catch {
      console.error("Failed to fetch categories");
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/admin-orders/orders");
      if (data.success) {
        setOrders(data.orders);
        setOrdersLoaded(true);
      }
    } catch {
      toast.error("Failed to load orders");
    }
  };

  const fetchDashboardOnce = async () => {
    if (dashboardData.loaded) return;
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      if (data.success) {
        setDashboardData({
          loaded: true,
          stats: data.stats,
          recentOrders: data.recentOrders,
          revenueChart: data.revenueChart,
        });
      }
    } catch {
      console.error("Dashboard preload failed");
    }
  };

  /* ============================
     🆕 FETCH-ONCE FUNCTIONS
     (NO EXISTING CODE TOUCHED)
  ============================ */

  const fetchCategoriesOnce = async () => {
    if (categoriesLoaded) return;
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        setCategories(data.categories);
        setCategoriesLoaded(true);
      }
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const [couriers, setCouriers] = useState([]);

  const fetchCouriersOnce = async () => {
    if (couriersLoaded) return;
    try {
      const { data } = await axios.get("/api/courier/list");
      if (data.success) {
        setCouriers(data.couriers);
        setCouriersLoaded(true);
      }
    } catch {
      toast.error("Failed to load couriers");
    }
  };

  const [users, setUsers] = useState([]);

  const fetchUsersOnce = async () => {
    if (usersLoaded) return;
    try {
      const { data } = await axios.get("/api/admin-users/users");
      if (data.success) {
        setUsers(data.users);
        setUsersLoaded(true);
      }
    } catch {
      toast.error("Failed to load users");
    }
  };

  const [coupons, setCoupons] = useState([]);

  const fetchCouponsOnce = async (force = false) => {
  if (couponsLoaded && !force) return;

  try {
    const { data } = await axios.get("/api/coupon/list");
    if (data.success) {
      setCoupons(data.coupons);
      setCouponsLoaded(true);
    }
  } catch {
    toast.error("Failed to load coupons");
  }
};

const fetchInvoicesOnce = async (force = false) => {
  if (invoicesLoaded && !force) return;

  try {
    const { data } = await axios.get("/api/admin-invoices");
    if (data.success) {
      setInvoices(data.invoices);
      setInvoicesLoaded(true);
    }
  } catch {
    toast.error("Failed to load invoices");
  }
};


  /* ============================
     SOCKET (UNCHANGED)
  ============================ */
  useEffect(() => {
    socket.connect();

    socket.on("order:update", (order) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o._id === order._id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = order;
          return updated;
        }
        return [order, ...prev];
      });
    });

    return () => socket.off("order:update");
  }, []);

  /* ============================
     PRODUCTS (UNCHANGED)
  ============================ */
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const guestCart = JSON.parse(localStorage.getItem("guest_cart"));
    if (guestCart) setCartItems(guestCart);
    fetchUser();
    fetchProducts();
  }, []);

  const invalidateCategories = () => setCategoriesLoaded(false);
const invalidateUsers = () => setUsersLoaded(false);
const invalidateCoupons = () => setCouponsLoaded(false);
const invalidateCouriers = () => setCouriersLoaded(false);
  /* ============================
     CONTEXT VALUE (ONLY APPENDED)
  ============================ */
  const value = {
    navigate,
    user,
    setUser,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    cartItems,
    searchQuery,
    setSearchQuery,
    axios,
    fetchProducts,
    redirectAfterLogin,
    setRedirectAfterLogin,
    authChecked,
    setAuthChecked,
    suppressCartAutoOpen,
    setSuppressCartAutoOpen,

    orders,
    setOrders,
    ordersLoaded,
    fetchOrders,

    invoices,
    setInvoices,
    fetchInvoicesOnce,


    dashboardData,
    fetchDashboardOnce,

    /* 🆕 OPTIMIZED SHARED DATA */
    categories,
    fetchCategoriesOnce,
    invalidateCategories,


    couriers,
    fetchCouriersOnce,
    invalidateCouriers,

    users,
    setUsers,
    fetchUsersOnce,
    invalidateUsers,

    coupons,
    fetchCouponsOnce,
    invalidateCoupons,
  };

  return <Appcontext.Provider value={value}>{children}</Appcontext.Provider>;
};

export const useAppContext = () => useContext(Appcontext);
