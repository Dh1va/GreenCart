import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { Trash2, X, Plus, Minus, ShoppingCart, Lock, ArrowRight, Truck } from "lucide-react";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 350, damping: 35 },
  },
  exit: {
    x: "100%",
    transition: { type: "spring", stiffness: 350, damping: 35 },
  },
};

const CartDrawer = ({ open, onClose }) => {
  const {
    cartItems,
    products,
    currency,
    getCartAmount,
    updateCartItem,
    removeFromCart,
    navigate,
  } = useAppContext();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [open]);

  const cartArray = useMemo(() => {
    if (!cartItems || !products) return [];
    return Object.keys(cartItems)
      .map((id) => {
        const product = products.find((p) => p._id === id);
        return product ? { ...product, quantity: cartItems[id] } : null;
      })
      .filter(Boolean);
  }, [cartItems, products]);

  const subtotal = getCartAmount() || 0;
  const freeShippingThreshold = 500; 
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY - Solid Black Opacity, No Blur */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60"
            variants={backdropVariants}
            initial="hidden" animate="visible" exit="hidden"
            onClick={onClose}
          />

          <motion.aside
            className="fixed top-0 right-0 z-[110] h-[100dvh] w-full sm:w-[440px] bg-white shadow-2xl flex flex-col overflow-hidden"
            variants={drawerVariants}
            initial="hidden" animate="visible" exit="exit"
          >
            {/* HEADER - Restored Previous Color */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-[#1E2A5E]" />
                <h2 className="text-xl font-bold text-[#1E2A5E] tracking-tight">Your Cart</h2>
                <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {cartArray.length}
                </span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartArray.length === 0 ? (
                  <div className="flex flex-col h-full items-center justify-center text-center space-y-4">
                    <ShoppingCart className="w-12 h-12 text-gray-200" />
                    <p className="text-gray-400 font-medium">Your cart is empty.</p>
                    <button onClick={onClose} className="text-[#1E2A5E] font-bold text-sm underline underline-offset-4">Continue Shopping</button>
                  </div>
                ) : (
                  cartArray.map((item) => (
                    <motion.div 
                        key={item._id} 
                        layout 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95 }} 
                        className="flex gap-4 p-3 rounded-xl border border-gray-50 hover:border-gray-200 transition-all"
                    >
                      <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 shrink-0 border border-gray-100">
                        <img src={item.images?.[0] || ""} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-[#1E2A5E] leading-tight truncate mr-2">
                            {item.name}
                          </h3>
                          <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                        <p className="text-sm font-bold text-[#008779] mt-1">{currency}{Number(item.offerPrice || item.price).toLocaleString()}</p>
                        
                        <div className="mt-auto">
                          <div className="inline-flex items-center bg-gray-100 rounded-lg h-8 p-1">
                            <button 
                                onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))} 
                                className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#1E2A5E]"
                            >
                                <Minus size={12}/>
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-[#1E2A5E]">{item.quantity}</span>
                            <button 
                                onClick={() => updateCartItem(item._id, item.quantity + 1)} 
                                className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#1E2A5E]"
                            >
                                <Plus size={12}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* FOOTER - Restored Previous Colors */}
            {cartArray.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.03)] shrink-0 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Subtotal</span>
                    <p className="text-2xl font-bold text-[#1E2A5E]">
                      {currency}{Number(subtotal).toLocaleString()}
                    </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleCheckout} 
                    className="w-full py-4 bg-[#1E2A5E] text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#151f42] transition-all"
                  >
                    Proceed to Checkout 
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => { onClose(); navigate("/cart"); }} 
                    className="w-full py-2 text-[#1E2A5E] font-bold uppercase tracking-widest text-[10px] hover:text-[#131c47] transition-colors"
                  >
                    View Full Cart
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <Lock size={10} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Checkout</span>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;