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
  const [wishlist, setWishlist] = useState([]);

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

        const dbCart = data.user.cartItems || {};
        setCartItems(dbCart);
        setWishlist(data.user.wishlist || []);

        // ✅ merge guest cart → user cart (only once after login)
        await mergeGuestCartToUserCart(dbCart);
      }
    } catch {
      setUser(null);

      // fallback: if user not logged in, keep guest cart
      const guestCart = getGuestCart();
      setCartItems(guestCart);
    } finally {
      setAuthChecked(true);
    }
  };

  const addToWishlist = async (productId) => {
  if (!user) {
    toast.error("Please login to use wishlist");
    setShowUserLogin(true);
    return;
  }

  try {
    const { data } = await axios.post("/api/user/wishlist", { productId });

    if (data.success) {
      setWishlist(data.wishlist || []);
      toast.success(data.message);
    } else {
      toast.error(data.message || "Wishlist update failed");
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
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
   🛒 COMPLETE CART FLOW
============================ */

  const getGuestCart = () => {
    try {
      return JSON.parse(localStorage.getItem("guest_cart")) || {};
    } catch {
      return {};
    }
  };

  const saveGuestCart = (cart) => {
    localStorage.setItem("guest_cart", JSON.stringify(cart));
  };

  // 🔒 Always sanitize cart (remove invalid qty)
  const sanitizeCart = (cart) => {
    const clean = {};
    for (const id in cart) {
      const qty = Number(cart[id]);
      if (!Number.isNaN(qty) && qty > 0) clean[id] = qty;
    }
    return clean;
  };

  const syncCartToServer = async (updatedCart) => {
    try {
      await axios.post("/api/cart/update", { cartItems: updatedCart });
    } catch (err) {
      console.error("Cart sync failed:", err?.message);
    }
  };

  // ✅ Count total items
  const getCartCount = () => {
    let total = 0;
    for (const id in cartItems) {
      total += Number(cartItems[id]) || 0;
    }
    return total;
  };

  // ✅ Total cart amount using offerPrice (your UI uses offerPrice)
  const getCartAmount = () => {
    let total = 0;

    for (const id in cartItems) {
      const qty = Number(cartItems[id]) || 0;
      if (qty <= 0) continue;

      const product = products.find((p) => p._id === id);
      if (!product) continue;

      const price = Number(product.offerPrice ?? product.price ?? 0);
      total += price * qty;
    }

    return total;
  };

  // ✅ Add to cart (increment)
  const addToCart = async (productId, qty = 1) => {
    if (!productId) return;

    const safeQty = Number(qty);
    if (Number.isNaN(safeQty) || safeQty <= 0) return;

    setCartItems((prev) => {
      const updated = sanitizeCart({
        ...prev,
        [productId]: (Number(prev[productId]) || 0) + safeQty,
      });

      // guest
      if (!user) saveGuestCart(updated);

      // logged in
      if (user) syncCartToServer(updated);

      return updated;
    });
  };

  // ✅ Remove from cart (delete item fully)
  const removeFromCart = async (productId) => {
    if (!productId) return;

    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[productId];

      const clean = sanitizeCart(updated);

      // guest
      if (!user) saveGuestCart(clean);

      // logged in
      if (user) syncCartToServer(clean);

      return clean;
    });
  };

  // ✅ Update cart item quantity (Cart page dropdown + CartDrawer +/-)
  const updateCartItem = async (productId, qty) => {
    if (!productId) return;

    const safeQty = Number(qty);
    if (Number.isNaN(safeQty)) return;

    setCartItems((prev) => {
      const updated = { ...prev };

      // if qty <= 0 remove item
      if (safeQty <= 0) {
        delete updated[productId];
      } else {
        updated[productId] = safeQty;
      }

      const clean = sanitizeCart(updated);

      // guest
      if (!user) saveGuestCart(clean);

      // logged in
      if (user) syncCartToServer(clean);

      return clean;
    });
  };

  // ✅ Clear cart
  const clearCart = async () => {
    setCartItems({});

    // guest
    saveGuestCart({});

    // logged in
    if (user) syncCartToServer({});
  };

  // ✅ Merge guest cart into user cart after login
  const mergeGuestCartToUserCart = async (dbCart = {}) => {
    const guestCart = sanitizeCart(getGuestCart());

    // Nothing to merge
    if (!guestCart || Object.keys(guestCart).length === 0) return;

    // Merge logic: sum quantities
    const merged = { ...sanitizeCart(dbCart) };
    for (const id in guestCart) {
      merged[id] = (Number(merged[id]) || 0) + (Number(guestCart[id]) || 0);
    }

    // 🔕 prevent Navbar cart drawer auto-open because cart count increases
    setSuppressCartAutoOpen(true);

    // Update UI
    setCartItems(merged);

    // Sync to DB
    await syncCartToServer(merged);

    // Clear guest cart after merge
    saveGuestCart({});
  };

  /* ============================
     🆕 FETCH-ONCE FUNCTIONS
     (NO EXISTING CODE TOUCHED)
  ============================ */

  const fetchCategoriesOnce = async (force = false) => {
  if (categoriesLoaded && !force) return;

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

    wishlist,
    setWishlist,
    addToWishlist,

    addToCart,
    removeFromCart,
    updateCartItem,
    getCartCount,
    getCartAmount,
    clearCart,
    setCartItems,

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
