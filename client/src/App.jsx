import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAppContext } from "./context/AppContext";
import Login from "./components/Login";

// Layouts
import UserLayout from "./layouts/UserLayout";

// Pages (User)
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import VerifyPhonePe from './pages/VerifyPhonePe';

// Pages (Admin)
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminRoute from "./components/Admin/AdminRoute";
import Dashboard from "./pages/Admin/Dashboard";
import ProductList from "./pages/Admin/ProductList";
import AddProduct from "./pages/Admin/AddProduct";
import Orders from "./pages/Admin/Orders";
import CreateOrder from "./pages/Admin/CreateOrder";
import Users from "./pages/Admin/Users";
import CustomerOrders from "./pages/Admin/CustomerOrders";
import CategoryList from "./pages/Admin/CategoryList";
import AddCategory from "./pages/Admin/AddCategory";
import ManageCategory from "./pages/Admin/ManageCategory";
import CategoryGroupList from "./pages/Admin/CategoryGroupList";
import AddCategoryGroup from "./pages/Admin/AddCategoryGroup";
import Coupons from "./pages/Admin/Coupons";
import Shipping from "./pages/Admin/Shipping";
import Invoices from "./pages/Admin/Invoices";
import Reports from "./pages/Admin/Reports";
import Settings from "./pages/Admin/Settings";
import CategoryGroup from "./pages/CategoryGroup";
import Wishlist from "./pages/Wishlist";
import OrderDetails from "./pages/OrderDetails";
import AdminOrderDetails from "./pages/Admin/AdminOrderDetails";
import OrderSuccess from './pages/OrderSuccess';
const App = () => {
  const { showUserLogin, user, authChecked } = useAppContext();

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

      <Routes>
        {/* ===================== USER ROUTES (UserLayout) ===================== */}
        <Route
          path="/"
          element={
            <UserLayout>
              <Home />
            </UserLayout>
          }
        />

        <Route
          path="/products"
          element={
            <UserLayout>
              <AllProducts />
            </UserLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <UserLayout>
              <Contact />
            </UserLayout>
          }
        />

        <Route
          path="/products/:category"
          element={
            <UserLayout>
              <ProductCategory />
            </UserLayout>
          }
        />

        <Route
          path="/collections/:group"
          element={
            <UserLayout>
              <CategoryGroup />
            </UserLayout>
          }
        />

        <Route path="/order-success/:orderId" element={<OrderSuccess />} />

        <Route
          path="/product/:id"
          element={
            <UserLayout>
              <ProductDetails />
            </UserLayout>
          }
        />

        <Route
      path="/wishlist"
      element={
        <UserLayout>
          <Wishlist />
        </UserLayout>
      }
    />

        <Route
          path="/cart"
          element={
            <UserLayout>
              <Cart />
            </UserLayout>
          }
        />

        <Route
          path="/checkout"
          element={
            <UserLayout>
              <Checkout />
            </UserLayout>
          }
        />

        <Route
          path="/add-address"
          element={
            <UserLayout>
              <AddAddress />
            </UserLayout>
          }
        />

        <Route
          path="/my-orders"
          element={
            <UserLayout>
              <MyOrders />
            </UserLayout>
          }
        />

        <Route
      path="/order-details/:id"
      element={
        <UserLayout>
          <OrderDetails />
        </UserLayout>
      }
    />
     
        <Route path="/payment/phonepe" element={<VerifyPhonePe />} />

        <Route
          path="/profile"
          element={
            <UserLayout>
              <Profile />
            </UserLayout>
          }
        />

        <Route
          path="/terms"
          element={
            <UserLayout>
              <Terms />
            </UserLayout>
          }
        />

        <Route
          path="/privacy"
          element={
            <UserLayout>
              <Privacy />
            </UserLayout>
          }
        />

        <Route
          path="/refund"
          element={
            <UserLayout>
              <Refund />
            </UserLayout>
          }
        />

        {/* ===================== ADMIN ROUTES (No UserLayout) ===================== */}
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
          <Route path="orders/:orderId" element={<AdminOrderDetails />} />

          <Route path="users" element={<Users />} />
          <Route path="users/:userId/orders" element={<CustomerOrders />} />

          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="category/manage/:id" element={<ManageCategory />} />

          <Route path="category-groups" element={<CategoryGroupList />} />
          <Route path="category-groups/add" element={<AddCategoryGroup />} />
          <Route path="category-groups/edit/:id" element={<AddCategoryGroup />} />

          <Route path="coupons" element={<Coupons />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
