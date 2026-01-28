import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2, Minus, Plus, Truck, ArrowLeft } from "lucide-react";

const Cart = () => {
  const {
    products,
    currency,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    cartItems,
    user,
    setShowUserLogin,
    setRedirectAfterLogin,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);

  // Transform cartItems object into array of products
  useEffect(() => {
    if (products.length > 0) {
      let tempArray = [];
      for (const key in cartItems) {
        const product = products.find((item) => item._id === key);
        if (product) {
          tempArray.push({
            ...product,
            quantity: cartItems[key],
          });
        }
      }
      setCartArray(tempArray);
    }
  }, [products, cartItems]);

  // Wrapper for update with Toast
  const handleUpdateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    updateCartItem(id, newQty);
    toast.success("Cart updated");
  };

  // Wrapper for remove with Toast
  const handleRemoveItem = (id) => {
    removeFromCart(id);
    toast.success("Item removed from cart");
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to continue");
      setRedirectAfterLogin("/checkout");
      setShowUserLogin(true);
      return;
    }
    navigate("/checkout");
  };

  // Subtotal (No Tax/Shipping here as requested)
  const subtotal = getCartAmount();

  if (cartArray.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-[#1E2A5E] mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <button 
          onClick={() => navigate("/products")}
          className="bg-[#1E2A5E] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#151f42] transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        
        {/* Header */}
        <div className="mb-10">
            <button 
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 text-[#008779] font-bold text-sm mb-6 hover:underline"
            >
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </button>
            
            <h1 className="text-4xl font-bold text-[#1E2A5E] text-center mb-8">Your Cart</h1>

           
        </div>

        {/* --- Cart Table --- */}
        <div className="max-w-6xl mx-auto">
            
            {/* Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-[3fr_1fr_1fr] gap-4 border-b border-gray-200 pb-4 mb-6 text-sm text-gray-500 font-medium">
                <div>Product</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Total</div>
            </div>

            {/* Items */}
            <div className="space-y-8 md:space-y-6">
                {cartArray.map((item) => (
                    <div key={item._id} className="flex flex-col md:grid md:grid-cols-[3fr_1fr_1fr] gap-6 items-center border-b border-gray-100 pb-6 md:border-none md:pb-0">
                        
                        {/* Product Info (CLICKABLE) */}
                        <div 
                            onClick={() => navigate(`/product/${item._id}`)}
                            className="flex items-center gap-6 w-full cursor-pointer group"
                        >
                            <div className="w-24 h-24 bg-[#F9FAFB] rounded-xl p-2 border border-gray-100 flex-shrink-0 group-hover:border-[#008779] transition-colors">
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{item.brand || "BRAND"}</p>
                                <h3 className="text-[#1E2A5E] font-bold text-lg leading-tight mb-1 group-hover:text-[#008779] transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-gray-500">{currency}{item.offerPrice}</p>
                            </div>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center justify-between w-full md:justify-center">
                            <span className="md:hidden text-sm font-bold text-gray-500">Qty:</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-[#eff6ff] rounded-lg h-10 px-1">
                                    <button 
                                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                        className="w-8 h-full flex items-center justify-center text-[#1E2A5E] hover:opacity-70"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold text-[#1E2A5E]">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                        className="w-8 h-full flex items-center justify-center text-[#1E2A5E] hover:opacity-70"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => handleRemoveItem(item._id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Line Total */}
                        <div className="flex items-center justify-between w-full md:block md:text-right">
                            <span className="md:hidden text-sm font-bold text-gray-500">Total:</span>
                            <p className="text-xl font-bold text-[#008779]">
                                {currency}{item.offerPrice * item.quantity}
                            </p>
                        </div>

                    </div>
                ))}
            </div>

            {/* --- Footer / Checkout Section --- */}
            <div className="mt-16 border-t border-gray-200 pt-10">
                <div className="flex flex-col md:flex-row justify-end items-start gap-10">

                    {/* Discount/Note Section  */}
                    <div className="flex-1 hidden md:block"></div>

                    {/* Checkout Box */}
                    <div className="w-full md:w-[400px] space-y-4">
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-xl font-bold text-[#1E2A5E]">Subtotal:</span>
                            <span className="text-3xl font-bold text-[#1E2A5E]">{currency}{subtotal}</span>
                        </div>
                        
                        <p className="text-xs text-gray-500 text-left">
                            Tax included. <span className="text-[#008779] font-bold">Shipping</span> and discounts calculated at checkout.
                        </p>

                        <div className="pt-4">
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-[#1E2A5E] text-white font-bold text-lg py-4 rounded-lg hover:bg-[#008779] transition-colors shadow-sm disabled:opacity-70"
                            >
                                Check Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;