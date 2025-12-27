import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import { useAppContext } from './context/AppContext'
import Login from './components/Login'
import AllProducts from './pages/AllProducts'
import ProductCategory from './pages/ProductCategory'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import AddAddress from './pages/AddAddress'
import MyOrders from './pages/MyOrders'
import AdminLayout from './pages/Admin/AdminLayout'
import AddProduct from './pages/Admin/AddProduct'
import ProductList from './pages/Admin/ProductList'
import AdminRoute from './components/Admin/AdminRoute'
import Orders from './pages/Admin/Orders'
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Contact from "./pages/Contact";
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'

const App = () => {

  const { showUserLogin } = useAppContext()
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  return (
    <div >

      {showUserLogin ? <Login /> : null}
      <Toaster />
     {!isAdminPath && <Navbar />}
      <div className={isAdminPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}>

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<AllProducts />}></Route>
          <Route path='/contact' element={<Contact />}></Route>
          <Route path='/products/:category' element={<ProductCategory />}></Route>
          <Route path='/products/:category/:id' element={<ProductDetails />}></Route>
          <Route path='/cart' element={<Cart />}></Route>
          <Route path='/checkout' element={<Checkout />}></Route>
          <Route path='/add-address' element={<AddAddress />}></Route>
          <Route path='/my-orders' element={<MyOrders />}></Route>
          <Route path='/profile' element={<Profile />}></Route>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AddProduct />} />
            <Route path="products" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />

          </Route>
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />


        </Routes>
      </div>
      {!isAdminPath && <Footer />}


    </div>
  )
}

export default App 