import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    products,
    currency,
    removeFromCart,
    updateCartItem,
    navigate,
    getCartAmount,
    cartItems,
    user,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let tempArray = [];
      for (const key in cartItems) {
        const product = products.find((item) => item._id === key);
        if (product) {
          tempArray.push({ ...product, quantity: cartItems[key] });
        }
      }
      setCartArray(tempArray);
    }
  }, [products, cartItems]);

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    updateCartItem(id, newQty);
    toast.success("Cart updated");
  };

  const handleCheckout = () => {
    navigate("/checkout"); // Guest can now proceed
  };

  const subtotal = getCartAmount();

  if (cartArray.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-[#1E2A5E] mb-2">Your Cart is Empty</h2>
        <button onClick={() => navigate("/products")} className="bg-[#1E2A5E] text-white px-8 py-3 rounded-lg font-bold mt-4">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-16">
        <button onClick={() => navigate("/products")} className="flex items-center gap-2 text-[#008779] font-bold text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>
        <h1 className="text-4xl font-bold text-[#1E2A5E] text-center mb-12">Your Cart</h1>

        <div className="max-w-6xl mx-auto space-y-8">
          {cartArray.map((item) => (
            <div key={item._id} className="flex flex-col md:grid md:grid-cols-[3fr_1fr_1fr] gap-6 items-center border-b border-gray-100 pb-6">
              <div onClick={() => navigate(`/product/${item._id}`)} className="flex items-center gap-6 w-full cursor-pointer group">
                <div className="w-24 h-24 bg-[#F9FAFB] rounded-xl p-2 border border-gray-100 shrink-0">
                  <img src={item.images[0]} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div>
                  <h3 className="text-[#1E2A5E] font-bold text-lg leading-tight">{item.name}</h3>
                  <p className="text-sm text-gray-500">{currency}{item.offerPrice}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-[#eff6ff] rounded-lg h-10 px-1">
                  <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} className="w-8 h-full flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} className="w-8 h-full flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
              </div>

              <div className="text-right w-full md:w-auto">
                <p className="text-xl font-bold text-[#008779]">{currency}{item.offerPrice * item.quantity}</p>
              </div>
            </div>
          ))}

          <div className="flex flex-col items-end pt-10">
            <div className="w-full md:w-[400px] space-y-4">
              <div className="flex justify-between items-end border-b pb-4">
                <span className="text-xl font-bold text-[#1E2A5E]">Subtotal:</span>
                <span className="text-3xl font-bold text-[#1E2A5E]">{currency}{subtotal}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-[#1E2A5E] text-white font-bold text-lg py-4 rounded-lg hover:bg-[#008779] transition-colors">
                Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;