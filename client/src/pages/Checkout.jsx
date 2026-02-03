import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import AddAddressModal from "../components/AddAddressModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, ShieldCheck, MapPin, CheckCircle, Pencil, Trash2, Plus, 
  ShoppingBag, Lock, User as UserIcon, Mail, Phone, Save, 
  Loader2, CreditCard, Banknote, Calendar, TicketPercent
} from "lucide-react";

const Checkout = () => {
  const {
    cartItems, products, currency, getCartAmount, axios,
    user, navigate, setShowUserLogin, setRedirectAfterLogin,
    setCartItems, authChecked,
  } = useAppContext();

  // --- DATA STATES ---
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [loadingCouriers, setLoadingCouriers] = useState(true);
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressList, setShowAddressList] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // --- PERSISTED GUEST ADDRESS LOGIC ---
  const [editFormData, setEditFormData] = useState(() => {
    const saved = localStorage.getItem("guest_checkout_address");
    return saved ? JSON.parse(saved) : {
      firstName: "", lastName: "", email: "", phone: "", 
      street: "", city: "", state: "", zipCode: "", country: "India"
    };
  });

  useEffect(() => {
    if (!user) localStorage.setItem("guest_checkout_address", JSON.stringify(editFormData));
  }, [editFormData, user]);

  // --- MODAL & PAYMENT STATES ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD"); 
  const [paymentSettings, setPaymentSettings] = useState({
    codEnabled: true, enabledGateway: null, taxPercent: 0, loading: true
  });

  /* ---------------- LOGIC HANDLERS ---------------- */
  useEffect(() => {
    if (!authChecked) return;
    if (!user) setIsEditing(true);
    else fetchAddresses();
  }, [authChecked, user]);

  useEffect(() => {
    const temp = [];
    for (const key in cartItems) {
      const product = products.find((p) => p._id === key);
      if (product) temp.push({ ...product, quantity: cartItems[key] });
    }
    setCartArray(temp);

    const fetchData = async () => {
      try {
        const [courierRes, payRes] = await Promise.all([
          axios.get("/api/courier/active"),
          axios.get("/api/payments/enabled")
        ]);
        if (courierRes.data.success) {
          setCouriers(courierRes.data.couriers);
          if (courierRes.data.couriers.length > 0) setSelectedCourier(courierRes.data.couriers[0]);
        }
        if (payRes.data.success) {
          setPaymentSettings({ ...payRes.data, loading: false });
          setPaymentMethod(payRes.data.enabledGateway ? "ONLINE" : "COD");
        }
      } catch (error) { console.error(error); }
      finally { setLoadingCouriers(false); }
    };
    fetchData();
  }, [cartItems, products]);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        const valid = data.addresses.filter(addr => !addr.email?.includes("admin@system"));
        setAddresses(valid);
        if (valid.length > 0) {
          const def = valid.find((a) => a.isDefault);
          setSelectedAddress(def || valid[0]);
        }
      }
    } catch (error) { console.error(error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartEdit = () => {
    if (user) setEditFormData({ ...selectedAddress });
    setIsEditing(true);
    setShowAddressList(false);
  };

  const handleSaveEdit = async () => {
    if (!user) return setIsEditing(false);
    setSaveLoading(true);
    try {
      const { data } = await axios.put(`/api/address/${selectedAddress._id}`, { address: editFormData });
      if (data.success) {
        toast.success("Address updated");
        fetchAddresses();
        setIsEditing(false);
      }
    } catch (error) { toast.error("Update failed"); }
    finally { setSaveLoading(false); }
  };

  const applyCoupon = async () => {
    try {
      const subtotal = getCartAmount();
      const tax = (subtotal * paymentSettings.taxPercent) / 100;
      const shipping = selectedCourier?.price || 0;
      const orderAmount = subtotal + tax + shipping;
      const { data } = await axios.post("/api/coupon/validate", { code: couponCode, orderAmount });
      if (data.success) {
        setDiscount(data.discount);
        toast.success("Coupon applied!");
      } else {
        toast.error(data.message);
        setDiscount(0);
      }
    } catch (err) { setDiscount(0); toast.error("Invalid coupon"); }
  };

  const handlePlaceOrder = () => {
    if (cartArray.length === 0) return toast.error("Your cart is empty");
    if (user) {
      if (!selectedAddress?._id) return toast.error("Please select an address");
      if (isEditing) return toast.error("Please save address changes first");
    } else {
      const required = ['firstName', 'email', 'phone', 'street', 'city'];
      for (let field of required) if (!editFormData[field]) return toast.error(`Please fill in ${field}`);
    }
    
    if (paymentMethod === "COD") placeOrderCOD();
    else if (paymentSettings.enabledGateway === "razorpay") placeRazorpayOrder();
    else if (paymentSettings.enabledGateway === "phonepe") placePhonePeOrder();
  };

  const placeOrderCOD = async () => {
    setOrderLoading(true);
    try {
      const payload = {
        items: cartArray.map(i => ({ product: i._id, quantity: i.quantity })),
        courier: selectedCourier,
        coupon: discount > 0 ? { code: couponCode, discount } : null,
      };
      if (user) payload.addressId = selectedAddress._id;
      else payload.guestAddress = editFormData;

      const { data } = await axios.post("/api/order/cod", payload);
      if (data.success) {
        toast.success("Order Placed Successfully!");
        setCartItems({});
        localStorage.removeItem("guest_cart");
        localStorage.removeItem("guest_checkout_address");
        navigate(user ? "/my-orders" : "/"); 
        window.scrollTo(0, 0);
      }
    } catch (e) { toast.error("Order Failed"); }
    finally { setOrderLoading(false); }
  };

  const placeRazorpayOrder = async () => {
    setOrderLoading(true);
    try {
      const payload = {
        items: cartArray.map(i => ({ product: i._id, quantity: i.quantity })),
        courier: selectedCourier,
        coupon: discount > 0 ? { code: couponCode, discount } : null,
      };
      if (user) payload.addressId = selectedAddress?._id;
      else payload.guestAddress = editFormData;

      const { data } = await axios.post("/api/payments/razorpay/create", payload);
      if (!data.success) throw new Error(data.message);
      
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "Order Payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await axios.post("/api/payments/razorpay/verify", { ...response, ...payload });
            toast.success("Payment Successful!"); 
            setCartItems({}); 
            localStorage.removeItem("guest_cart");
            localStorage.removeItem("guest_checkout_address");
            navigate(user ? "/my-orders" : "/");
          } catch (err) { toast.error("Payment Verification Failed"); }
        },
        modal: { ondismiss: () => setOrderLoading(false) },
        prefill: { 
          name: user ? `${selectedAddress.firstName}` : editFormData.firstName, 
          email: user ? selectedAddress.email : editFormData.email, 
          contact: user ? selectedAddress.phone : editFormData.phone 
        },
        theme: { color: "#4F46E5" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch(e) { toast.error("Payment failed"); setOrderLoading(false); }
  };

  const placePhonePeOrder = async () => {
    setOrderLoading(true);
    try {
      const payload = {
        items: cartArray.map(i => ({ product: i._id, quantity: i.quantity })),
        courier: selectedCourier,
        coupon: discount > 0 ? { code: couponCode, discount } : null,
      };
      if (user) payload.addressId = selectedAddress._id;
      else payload.guestAddress = editFormData;
      const { data } = await axios.post("/api/payments/phonepe/create", payload);
      if (data.success && data.redirectUrl) window.location.href = data.redirectUrl;
    } catch (e) { toast.error("PhonePe failed"); setOrderLoading(false); }
  };

  const subtotalValue = getCartAmount();
  const taxAmount = (subtotalValue * paymentSettings.taxPercent) / 100;
  const shippingFee = selectedCourier?.price || 0;
  const totalAmount = subtotalValue + taxAmount + shippingFee - discount;

  const FormField = ({ label, name, value, icon: Icon, fullWidth, type = "text" }) => (
    <div className={`flex flex-col ${fullWidth ? 'md:col-span-2' : ''}`}>
      <label className="text-[11px] uppercase text-slate-400 font-bold mb-1.5 tracking-wider flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </label>
      {isEditing ? (
        <input 
          type={type} name={name} value={editFormData[name] || ""} 
          onChange={handleInputChange} 
          className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none transition-all" 
        />
      ) : (
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 min-h-[46px] flex items-center">
          { (user ? value : editFormData[name]) || "—"}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen  pt-6 md:pt-10 pb-20 antialiased">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* HEADER */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Checkout</h1>
            <p className="text-slate-500 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Secure payment session
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* LEFT COLUMN: SHIPPING & COURIER */}
          <div className="flex-1 space-y-8">
            
            {/* SHIPPING SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 md:px-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">1</div>
                  <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Shipping Information</h2>
                </div>
                {!isEditing && (user ? selectedAddress : true) && (
                  <button onClick={handleStartEdit} className="text-xs font-bold text-indigo-600 flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl transition-all">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <FormField label="First Name" name="firstName" value={selectedAddress?.firstName} icon={UserIcon} />
                  <FormField label="Last Name" name="lastName" value={selectedAddress?.lastName} />
                  <FormField label="Email" name="email" value={selectedAddress?.email} icon={Mail} />
                  <FormField label="Phone" name="phone" value={selectedAddress?.phone} icon={Phone} />
                  <FormField label="Street Address" name="street" value={selectedAddress?.street} icon={MapPin} fullWidth />
                  <FormField label="City" name="city" value={selectedAddress?.city} />
                  <FormField label="Zip" name="zipCode" value={selectedAddress?.zipCode} />
                </div>
                {isEditing && (
                  <button onClick={handleSaveEdit} className="mt-8 w-full bg-slate-900 text-white py-3.5 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg transition-all">
                    <Save className="w-4 h-4" /> Confirm Details
                  </button>
                )}
              </div>
            </section>

            {/* DELIVERY METHOD SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 md:px-8 border-b border-slate-50 flex items-center gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">2</div>
                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Delivery Speed</h2>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {couriers.map((c) => (
                    <div 
                      key={c._id} 
                      onClick={() => setSelectedCourier(c)} 
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedCourier?._id === c._id ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200 bg-white"}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCourier?._id === c._id ? 'border-indigo-600' : 'border-slate-300'}`}>
                          {selectedCourier?._id === c._id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                        </div>
                        <span className="font-bold text-slate-900">{c.price === 0 ? "FREE" : `${currency}${c.price}`}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm mb-1">{c.name}</p>
                      <p className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Arrives in {c.minDays}–{c.maxDays} days
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SUMMARY CARD (CLEAN SaaS UI) */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Order Summary</h3>
                <span className="bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full font-bold">
                  {cartArray.length} items
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-[180px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {cartArray.map((item) => (
                    <div key={item._id} className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl p-1.5 shrink-0 overflow-hidden border border-slate-100">
                          <img src={item.images?.[0]} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                            <p className="text-[10px] text-slate-400">Qty: {item.quantity} × {currency}{item.offerPrice}</p>
                        </div>
                        <p className="font-bold text-sm text-slate-900">{currency}{item.offerPrice * item.quantity}</p>
                    </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-8 p-1 bg-slate-50 rounded-2xl flex items-center gap-2 border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                <TicketPercent size={18} className="ml-3 text-slate-400" />
                <input 
                  type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                  placeholder="PROMO CODE" 
                  className="flex-1 bg-transparent border-none py-2 text-xs font-bold outline-none uppercase placeholder:text-slate-300" 
                />
                <button onClick={applyCoupon} className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all">APPLY</button>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Payment Option</p>
                {paymentSettings.enabledGateway && (
                  <div onClick={() => setPaymentMethod("ONLINE")} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${paymentMethod === "ONLINE" ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === "ONLINE" ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><CreditCard size={20} /></div>
                    <div className="flex-1"><p className="font-bold text-sm text-slate-800">Pay Online</p></div>
                    {paymentMethod === "ONLINE" && <CheckCircle size={18} className="text-indigo-600" />}
                  </div>
                )}
                {paymentSettings.codEnabled && (
                  <div onClick={() => setPaymentMethod("COD")} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${paymentMethod === "COD" ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === "COD" ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><Banknote size={20} /></div>
                    <div className="flex-1"><p className="font-bold text-sm text-slate-800">Cash on Delivery</p></div>
                    {paymentMethod === "COD" && <CheckCircle size={18} className="text-indigo-600" />}
                  </div>
                )}
              </div>

              {/* Totals Section */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{currency}{subtotalValue.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-500"><span>Shipping</span><span>{shippingFee === 0 ? "FREE" : `${currency}${shippingFee}`}</span></div>
                <div className="flex justify-between text-sm text-slate-500"><span>Estimated Tax</span><span>{currency}{taxAmount.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-indigo-600 font-bold text-sm"><span>Discount</span><span>-{currency}{discount}</span></div>}
                <div className="flex justify-between items-center pt-4 mt-2">
                  <span className="text-lg font-extrabold text-slate-900">Total</span>
                  <span className="text-3xl font-black text-indigo-600">{currency}{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder} disabled={orderLoading || isEditing} 
                className={`w-full mt-8 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 ${isEditing ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {orderLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShoppingBag size={20} /> Place Order Now</>}
              </motion.button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 py-3 rounded-xl">
                 <Lock size={12} /> Encrypted Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <AddAddressModal open={showAddModal} onClose={() => setShowAddModal(false)} onSaved={() => fetchAddresses()} />
      <ConfirmActionModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete Address" danger loading={confirmLoading} onConfirm={async () => { try { setConfirmLoading(true); await axios.delete(`/api/address/${pendingDelete._id}`); toast.success("Deleted"); fetchAddresses(); } finally { setConfirmLoading(false); setConfirmOpen(false); } }} />
    </div>
  );
};

export default Checkout;