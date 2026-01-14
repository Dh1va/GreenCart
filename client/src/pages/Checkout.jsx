import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import AddAddressModal from "../components/AddAddressModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Clock, ShieldCheck } from "lucide-react";

const Checkout = () => {
  const {
    cartItems,
    products,
    currency,
    getCartAmount,
    axios,
    user,
    navigate,
    setShowUserLogin,
    setRedirectAfterLogin,
    setCartItems,
    authChecked,
  } = useAppContext();

  // --- STATES ---
  const [couriers, setCouriers] = useState([]); // Dynamic Couriers
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [loadingCouriers, setLoadingCouriers] = useState(true);

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD or RAZORPAY

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      toast.error("Please login to continue");
      setRedirectAfterLogin("/checkout");
      setShowUserLogin(true);
      navigate("/cart");
    }
  }, [authChecked, user]);

  /* ---------------- LOAD DATA (Cart & Couriers) ---------------- */
  useEffect(() => {
    // 1. Build Cart Array
    const temp = [];
    for (const key in cartItems) {
      const product = products.find((p) => p._id === key);
      if (product) temp.push({ ...product, quantity: cartItems[key] });
    }
    setCartArray(temp);

    // 2. Fetch Active Couriers
    const fetchCouriers = async () => {
      try {
        const { data } = await axios.get("/api/courier/active");
        if (data.success) {
          setCouriers(data.couriers);
          // Default to first option (usually sorted by price in backend)
          if (data.couriers.length > 0) setSelectedCourier(data.couriers[0]);
        }
      } catch (error) {
        console.error("Courier fetch error:", error);
        toast.error("Could not load shipping options");
      } finally {
        setLoadingCouriers(false);
      }
    };

    if (user) fetchCouriers();
  }, [cartItems, products, user]);

  /* ---------------- LOAD ADDRESSES ---------------- */
  const fetchAddresses = async () => {
    const { data } = await axios.get("/api/address/get");
    if (data.success) {
      setAddresses(data.addresses);
      // Auto-select default or first address
      const def = data.addresses.find(a => a.isDefault);
      setSelectedAddress(def || data.addresses[0] || null);
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  /* ---------------- ORDER PLACEMENT ---------------- */
  
  // 1. Cash On Delivery
  const placeOrderCOD = async () => {
    try {
      const { data } = await axios.post("/api/order/cod", {
        items: cartArray.map((i) => ({
          product: i._id,
          quantity: i.quantity,
        })),
        addressId: selectedAddress._id,
        courier: selectedCourier, // ✅ Passing full courier object
      });

      if (data.success) {
        toast.success("Order placed successfully!");
        setCartItems({});
        navigate("/my-orders");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed");
    }
  };

  // 2. Online Payment (Razorpay)
  const placeOnlineOrder = async () => {
    try {
      const { data } = await axios.post("/api/order/razorpay/order", {
        items: cartArray.map((i) => ({
          product: i._id,
          quantity: i.quantity,
        })),
        addressId: selectedAddress._id,
        courier: selectedCourier, // ✅ Passing full courier object
        coupon: discount > 0 ? { code: couponCode, discount } : null
      });

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: "INR",
        name: "Your Store Name",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await axios.post("/api/order/razorpay/verify", {
              ...response,
              items: cartArray.map((i) => ({
                product: i._id,
                quantity: i.quantity,
              })),
              addressId: selectedAddress._id,
              courier: selectedCourier, // ✅ Passing full courier object again for verification save
            });
            toast.success("Payment successful!");
            setCartItems({});
            navigate("/my-orders");
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
          email: selectedAddress.email,
          contact: selectedAddress.phone,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Online payment initialization failed");
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress?._id) return toast.error("Please select an address");
    if (cartArray.length === 0) return toast.error("Your cart is empty");
    if (!selectedCourier) return toast.error("Please select a shipping method");

    if (paymentMethod === "COD") placeOrderCOD();
    else placeOnlineOrder();
  };

  /* ---------------- COUPON LOGIC ---------------- */
  const applyCoupon = async () => {
    try {
      // Calculate amount before discount
      const subtotal = getCartAmount();
      const tax = subtotal * 0.02;
      const shipping = selectedCourier?.price || 0;
      const orderAmount = subtotal + tax + shipping;

      const { data } = await axios.post("/api/coupon/validate", {
        code: couponCode,
        orderAmount,
      });

      if (data.success) {
        setDiscount(data.discount);
        toast.success("Coupon applied!");
      } else {
        toast.error(data.message);
        setDiscount(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
      setDiscount(0);
    }
  };

  /* ---------------- CALCULATIONS ---------------- */
  const taxAmount = (getCartAmount() * 2) / 100;
  const shippingFee = selectedCourier?.price || 0;
  const totalAmount = getCartAmount() + taxAmount + shippingFee - discount;

  /* ---------------- UI HELPERS ---------------- */
  const AddressSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );

  return (
    <div className="py-16 mt-16 bg-gray-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your purchase securely.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* --- LEFT COLUMN (Address & Shipping) --- */}
          <motion.div 
            className="flex-1 w-full space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            
            {/* 1. ADDRESS SECTION */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">1</div>
                  Delivery Address
                </h2>
                {selectedAddress && (
                  <button onClick={() => setShowAddress(!showAddress)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                    CHANGE
                  </button>
                )}
              </div>

              <div className="p-6">
                {!addresses ? (
                  <AddressSkeleton />
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">You haven't added any addresses yet.</p>
                    <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                      + Add Address
                    </button>
                  </div>
                ) : selectedAddress ? (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{selectedAddress.label}</span>
                      <span className="text-sm text-gray-600">({selectedAddress.firstName} {selectedAddress.lastName})</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Contact: {selectedAddress.phone}</p>
                  </div>
                ) : (
                  <button onClick={() => setShowAddress(true)} className="text-indigo-600 font-medium text-sm">Select an address</button>
                )}
              </div>

              {/* Address Selection Dropdown */}
              {showAddress && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => { setSelectedAddress(addr); setShowAddress(false); }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-black bg-white ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <div className="flex justify-between">
                        <span className="font-bold text-sm">{addr.label}</span>
                        {selectedAddress?._id === addr._id && <div className="w-2 h-2 rounded-full bg-black"></div>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{addr.street}, {addr.city}</p>
                    </div>
                  ))}
                  <button onClick={() => { setShowAddModal(true); setShowAddress(false); }} className="w-full py-3 text-sm font-medium text-indigo-600 border border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl hover:bg-indigo-50">
                    + Add New Address
                  </button>
                </div>
              )}
            </div>

            {/* 2. SHIPPING METHOD (Dynamic) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</div>
                  Shipping Method
                </h2>
              </div>

              <div className="p-6">
                {loadingCouriers ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>)}
                  </div>
                ) : couriers.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-4">No shipping methods available.</div>
                ) : (
                  <div className="space-y-3">
                    {couriers.map((courier) => (
                      <label 
                        key={courier._id} 
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedCourier?._id === courier._id 
                            ? "border-black bg-gray-50 ring-1 ring-black" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCourier?._id === courier._id ? 'border-black' : 'border-gray-300'}`}>
                            {selectedCourier?._id === courier._id && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                          </div>
                          <input type="radio" name="courier" className="hidden" checked={selectedCourier?._id === courier._id} onChange={() => setSelectedCourier(courier)} />
                          
                          <div>
                            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              {courier.name}
                              <Truck className="w-3.5 h-3.5 text-gray-400" />
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 
                              {courier.minDays} - {courier.maxDays} Business Days
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-sm font-bold text-gray-900">
                          {courier.price === 0 ? <span className="text-green-600">FREE</span> : `${currency}${courier.price}`}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. PAYMENT METHOD */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">3</div>
                  Payment
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === "RAZORPAY" ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <ShieldCheck className={`w-6 h-6 ${paymentMethod === "RAZORPAY" ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-bold">Pay Online</span>
                  <span className="text-[10px] text-gray-500">Cards, UPI, NetBanking</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === "COD" ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <Truck className={`w-6 h-6 ${paymentMethod === "COD" ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-bold">Cash on Delivery</span>
                  <span className="text-[10px] text-gray-500">Pay at your doorstep</span>
                </button>
              </div>
            </div>

          </motion.div>

          {/* --- RIGHT COLUMN (Summary) --- */}
          <div className="w-full lg:w-[380px] lg:sticky lg:top-24">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

              {/* Items List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {cartArray.map(item => (
                  <div key={item._id} className="flex gap-4">
                    <div className="w-14 h-14 border border-gray-100 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <img src={item.images?.[0]} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {currency}{item.offerPrice * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Promo Code" 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-all"
                />
                <button onClick={applyCoupon} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all">
                  Apply
                </button>
              </div>

              {/* Calculations */}
              <div className="space-y-3 pt-6 border-t border-gray-100 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{currency}{getCartAmount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (2%)</span>
                  <span>{currency}{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shippingFee === 0 ? <span className="text-green-600 font-medium">Free</span> : <span>{currency}{shippingFee}</span>}
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{currency}{discount}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-4 mt-4 border-t border-gray-100">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{currency}{totalAmount.toFixed(2)}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
              >
                Place Order
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <AddAddressModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        editAddress={editAddress}
        onSaved={(updated) => { fetchAddresses(); setSelectedAddress(updated); }}
      />

      <ConfirmActionModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingDelete(null); }}
        title="Delete Address"
        description="Permanently remove this address?"
        confirmText="Delete"
        danger
        loading={confirmLoading}
        onConfirm={async () => {
          try {
            setConfirmLoading(true);
            const { data } = await axios.delete(`/api/address/${pendingDelete._id}`);
            if (data.success) {
              toast.success("Address deleted");
              const updated = addresses.filter(a => a._id !== pendingDelete._id);
              setAddresses(updated);
              if (selectedAddress?._id === pendingDelete._id) setSelectedAddress(updated[0] || null);
            }
          } catch { toast.error("Delete failed"); } 
          finally { setConfirmLoading(false); setConfirmOpen(false); setPendingDelete(null); }
        }}
      />
    </div>
  );
};

export default Checkout;