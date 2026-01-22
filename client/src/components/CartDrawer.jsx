import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const FREE_DELIVERY_THRESHOLD = 999;

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
                    {/* BACKDROP */}
                    <motion.div
                        // 👇 CHANGED: z-[100] to cover Navbar, blur-[1px] for subtle effect
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px]"
                        variants={backdropVariants}
                        initial="hidden" animate="visible" exit="hidden"
                        onClick={onClose}
                    />

                    {/* DRAWER */}
                    <motion.aside
                        // 👇 CHANGED: z-[110] to stay above backdrop
                        className="fixed top-0 right-0 z-[110] h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col"
                        variants={drawerVariants}
                        initial="hidden" animate="visible" exit="exit"
                    >
                        {/* HEADER */}
                        <div className="px-6 py-5 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                                <p className="text-xs text-gray-500 font-medium">{cartArray.length} Items Selected</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-2xl">×</button>
                        </div>

                        {/* MAIN CONTENT */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
                            <AnimatePresence mode="popLayout">
                                {cartArray.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="py-10 text-center"
                                    >
                                        <p className="text-gray-400 mb-8 font-medium">Your cart is currently empty.</p>

                                        {/* RECOMMENDATIONS */}
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold text-gray-900 mb-4 px-2 border-l-4 border-primary">Recommended for you</h3>
                                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                                {recommendations.map(p => (
                                                    <div
                                                        key={p._id}
                                                        onClick={() => navigate(`/product/${p._id}`)}
                                                        className="min-w-[140px] cursor-pointer group"
                                                    >
                                                        <div className="aspect-square bg-gray-50 rounded-xl p-2 mb-2 border border-gray-100">
                                                            <img src={p.images?.[0]} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                                                        <p className="text-xs text-primary font-bold">{currency}{p.offerPrice}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    cartArray.map((item) => (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            drag="x"
                                            dragConstraints={{ right: 0, left: -100 }}
                                            onDragEnd={(e, info) => {
                                                if (info.offset.x < -80) removeFromCart(item._id);
                                            }}
                                            className="relative flex gap-4 bg-white"
                                        >
                                            {/* SWIPE REVEAL BACKGROUND */}
                                            <div className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end px-6 -z-10">
                                                <span className="text-white text-xs font-bold">RELEASE TO REMOVE</span>
                                            </div>

                                            <div className="flex gap-4 w-full bg-white transition-transform">
                                                <div className="w-20 h-24 bg-gray-50 rounded-xl border border-gray-100 p-2 flex-shrink-0">
                                                    <img src={item.images?.[0]} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                </div>

                                                <div className="flex flex-col flex-1 justify-between py-1">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                                        <p className="text-xs text-gray-500 mt-1">{currency}{item.offerPrice} / unit</p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                                            <button
                                                                onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))}
                                                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateCartItem(item._id, item.quantity + 1)}
                                                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <p className="font-black text-sm">{currency}{item.offerPrice * item.quantity}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* FOOTER */}
                        {cartArray.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
                                {/* TOTALS */}
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-sm text-gray-500 font-medium">Subtotal Amount</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-primary leading-none">
                                            {currency}{subtotal}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 italic">
                                            Taxes & shipping calculated at checkout
                                        </p>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate("/cart");
                                        }}
                                        className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                                    >
                                        View Full Cart
                                    </button>

                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98]"
                                    >
                                        Secure Checkout
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