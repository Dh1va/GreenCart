import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import {Toaster} from 'react-hot-toast'
import Footer from './components/Footer'
import { useAppContext } from './context/AppContext'
import Login from './components/Login'
import AllProducts from './pages/AllProducts'
import ProductCategory from './pages/ProductCategory'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import AddAddress from './pages/AddAddress'
import MyOrders from './pages/MyOrders'
import SellerLogin from './components/seller/SellerLogin'
import Sellerlayout from './pages/seller/Sellerlayout'
import AddProduct from './pages/seller/AddProduct'
import ProductList from './pages/seller/ProductList'
import Orders from './pages/seller/Orders'
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Contact from "./pages/Contact";

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const {showUserLogin, isSeller} = useAppContext()
  return (
    <div >  
      {isSellerPath ? null : <Navbar/>}
      {showUserLogin ? <Login/> : null}
      <Toaster/>
      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"} `}>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/products' element={<AllProducts/>}></Route>
          <Route path='/contact' element={<Contact/>}></Route>
          <Route path='/products/:category' element={<ProductCategory/>}></Route>
          <Route path='/products/:category/:id' element={<ProductDetails/>}></Route>
          <Route path='/cart' element={<Cart/>}></Route>
          <Route path='/add-address' element={<AddAddress/>}></Route>
          <Route path='/my-orders' element={<MyOrders/>}></Route>
          <Route path='/seller' element={isSeller ? <Sellerlayout/> : <SellerLogin/>}>
            <Route index element={isSeller ? <AddProduct/> : null}/>
            <Route path='product-list' element={<ProductList/>}/>
            <Route path='orders' element={<Orders/>}/>
          </Route>
           <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund" element={<Refund />} />


        </Routes>
      </div>
      {!isSellerPath && <Footer/>}
    </div>
  )
}

export default App 