import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { Trash2, X, Plus, Minus } from "lucide-react"; // Imported icons
import toast from "react-hot-toast";

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const drawerVariants = {
    hidden: { x: "100%" },
    visible: {
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
        x: "100%",
        transition: { type: "spring", stiffness: 300, damping: 35 },
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
        user,
        navigate,
        setShowUserLogin,
        setRedirectAfterLogin,
    } = useAppContext();

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => (document.body.style.overflow = "");
    }, [open]);

    const cartArray = useMemo(() => {
        return Object.keys(cartItems)
            .map((id) => {
                const product = products.find((p) => p._id === id);
                return product ? { ...product, quantity: cartItems[id] } : null;
            })
            .filter(Boolean);
    }, [cartItems, products]);

    // Recommended products logic
    const recommendations = useMemo(() => {
        return products.filter(p => !cartItems[p._id]).slice(0, 4);
    }, [products, cartItems]);

    const subtotal = getCartAmount();

    const handleCheckout = () => {
        if (!user) {
            toast.error("Please login to continue");
            setRedirectAfterLogin("/checkout");
            setShowUserLogin(true);
            return;
        }
        onClose();
        navigate("/checkout");
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* BACKDROP - Solid Black Overlay (No Blur) */}
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black/60"
                        variants={backdropVariants}
                        initial="hidden" animate="visible" exit="hidden"
                        onClick={onClose}
                    />

                    {/* DRAWER */}
                    <motion.aside
                        className="fixed top-0 right-0 z-[110] h-full w-full sm:w-[450px] bg-white shadow-2xl flex flex-col"
                        variants={drawerVariants}
                        initial="hidden" animate="visible" exit="exit"
                    >
                        {/* HEADER */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h2 className="text-2xl font-bold text-[#1E2A5E]">Your Cart</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">{cartArray.length} Items Selected</p>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* MAIN CONTENT */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 space-y-8">
                            <AnimatePresence mode="popLayout">
                                {cartArray.length === 0 ? (
                                    <div className="flex flex-col h-full justify-center items-center text-center pb-20">
                                        <p className="text-gray-400 mb-8 font-medium text-lg">Your cart is currently empty.</p>
                                        
                                        {/* Recommendations for empty state */}
                                        <div className="w-full">
                                            <h3 className="text-left text-sm font-bold text-[#1E2A5E] mb-4 uppercase tracking-wider">You might like</h3>
                                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                                {recommendations.map(p => (
                                                    <div 
                                                        key={p._id} 
                                                        onClick={() => { navigate(`/product/${p._id}`); onClose(); }}
                                                        className="min-w-[120px] cursor-pointer group"
                                                    >
                                                        <div className="aspect-square bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
                                                            <img src={p.images?.[0]} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                                                        <p className="text-xs text-[#008779] font-bold">{currency}{p.offerPrice}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    cartArray.map((item) => (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex gap-6 border-b border-gray-50 pb-6 last:border-0"
                                        >
                                            {/* LEFT: IMAGE */}
                                            <div className="w-24 h-24 bg-[#F9FAFB] rounded-xl p-2 flex-shrink-0 border border-gray-100">
                                                <img 
                                                    src={item.images?.[0]} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-contain mix-blend-multiply" 
                                                />
                                            </div>

                                            {/* RIGHT: DETAILS */}
                                            <div className="flex flex-col flex-1 justify-between">
                                                <div>
                                                    {/* Brand / Category */}
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                                                        {typeof item.category === 'string' ? item.category : 'Product'}
                                                    </p>
                                                    {/* Title */}
                                                    <h3 className="text-[#1E2A5E] font-bold text-base leading-tight mb-1">
                                                        {item.name}
                                                    </h3>
                                                    {/* Unit Price */}
                                                    <p className="text-sm text-gray-500">
                                                        {currency}{item.offerPrice}
                                                    </p>
                                                </div>

                                                {/* ACTIONS ROW: Qty + Remove + Total */}
                                                <div className="flex items-center justify-between mt-3">
                                                    
                                                    <div className="flex items-center gap-4">
                                                        {/* Quantity Selector (Blue BG) */}
                                                        <div className="flex items-center bg-[#F0F4F8] rounded-lg h-10 px-1">
                                                            <button
                                                                onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))}
                                                                className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-[#1E2A5E] transition-colors"
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="w-6 text-center text-sm font-bold text-[#1E2A5E]">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateCartItem(item._id, item.quantity + 1)}
                                                                className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-[#1E2A5E] transition-colors"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        {/* Trash Icon */}
                                                        <button 
                                                            onClick={() => removeFromCart(item._id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    {/* Total Price (Teal Color) */}
                                                    <p className="text-lg font-bold text-[#008779]">
                                                        {currency}{item.offerPrice * item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* FOOTER */}
                        {cartArray.length > 0 && (
                            <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
                                {/* TOTALS */}
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[#1E2A5E] leading-none">
                                            {currency}{subtotal}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            Taxes & shipping calculated at checkout
                                        </p>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-4 bg-[#1E2A5E] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-900/10 hover:bg-[#151f42] hover:shadow-xl transition-all active:scale-[0.99]"
                                    >
                                        Checkout Now
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate("/cart");
                                        }}
                                        className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.99]"
                                    >
                                        View Cart
                                    </button>
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