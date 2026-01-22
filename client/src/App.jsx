import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Login from "./components/Login";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import AdminLayout from "./pages/Admin/AdminLayout";
import AddProduct from "./pages/Admin/AddProduct";
import ProductList from "./pages/Admin/ProductList";
import AdminRoute from "./components/Admin/AdminRoute";
import Orders from "./pages/Admin/Orders";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Admin/Dashboard";
import CategoryList from "./pages/Admin/CategoryList";
import AddCategory from "./pages/Admin/AddCategory";
import Users from "./pages/Admin/Users";
import CustomerOrders from "./pages/Admin/CustomerOrders";
import CreateOrder from "./pages/Admin/CreateOrder";
import Coupons from "./pages/Admin/Coupons";
import Shipping from "./pages/Admin/Shipping";
import Invoices from "./pages/Admin/Invoices";
import Reports from "./pages/Admin/Reports";
import Settings from "./pages/Admin/Settings";
import ManageCategory from "./pages/Admin/ManageCategory";
import AddCategoryGroup from "./pages/Admin/AddCategoryGroup";
import CategoryGroupList from "./pages/Admin/CategoryGroupList";


const App = () => {
  const {
    showUserLogin,
    user,
    authChecked,
  } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPath = location.pathname.startsWith("/admin");

  /* 🔐 AUTO REDIRECT ADMIN AFTER RELOAD */
  useEffect(() => {
    if (!authChecked || !user) return;

    if (user.role === "admin" && !isAdminPath) {
      navigate("/admin", { replace: true });
    }
  }, [authChecked, user, isAdminPath, navigate]);

  return (
    <div>
      {showUserLogin && <Login />}
      <Toaster />

      {!isAdminPath && <Navbar />}

      <div className={isAdminPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/add-product" element={<AddProduct />} />
            <Route path="products/edit-product/:id" element={<AddProduct />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/create" element={<CreateOrder />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:userId/orders" element={<CustomerOrders />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/add" element={<AddCategory />} />
            
            <Route path="category/manage/:id" element={<ManageCategory />} />
            <Route path="category-groups" element={<CategoryGroupList />} />
            <Route path="category-groups/add" element={<AddCategoryGroup />} />
            <Route path="category-groups/edit/:id" element={<AddCategoryGroup />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="shipping" element={<Shipping/>} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />




          </Route>

          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
        </Routes>
      </div>

      {!isAdminPath && <Footer />}
    </div>
  );
};

export default App;
