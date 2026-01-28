import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import AddAddressModal from "../components/AddAddressModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  ShieldCheck, 
  MapPin, 
  CheckCircle, 
  Pencil, 
  Trash2, 
  Plus, 
  ShoppingBag, 
  Lock,
  User,
  Mail,
  Phone,
  Globe,
  Save,
  Loader2,
  CreditCard,
  Banknote
} from "lucide-react";

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

  // --- DATA STATES ---
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [loadingCouriers, setLoadingCouriers] = useState(true);

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // --- UI STATES ---
  const [showAddressList, setShowAddressList] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
  // --- EDIT ADDRESS STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // --- MODAL STATES ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  // --- ORDER & PAYMENT STATES ---
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  
  // Stores backend settings (Tax, Payment Methods)
  const [paymentSettings, setPaymentSettings] = useState({
    codEnabled: true,
    enabledGateway: null, // 'razorpay' | 'phonepe' | null
    taxPercent: 0, 
    loading: true
  });
  
  // Stores USER selection ('COD' or 'ONLINE')
  const [paymentMethod, setPaymentMethod] = useState("COD"); 

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

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    // 1. Prepare Cart Array
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
          if (data.couriers.length > 0) setSelectedCourier(data.couriers[0]);
        }
      } catch (error) {
        console.error("Courier error:", error);
      } finally {
        setLoadingCouriers(false);
      }
    };

    // 3. Fetch Payment Settings (Backend)
    const fetchPaymentSettings = async () => {
      try {
        const { data } = await axios.get("/api/payments/enabled");
        if (data.success) {
          setPaymentSettings({
            codEnabled: data.codEnabled,
            enabledGateway: data.enabledGateway, // 'razorpay' or 'phonepe'
            taxPercent: data.taxPercent ?? 0,    // Fix: Use 0 if undefined
            loading: false
          });
          
          // Smart Default Selection
          if (data.enabledGateway) {
            setPaymentMethod("ONLINE"); // Prefer Online if available
          } else if (data.codEnabled) {
            setPaymentMethod("COD");
          }
        }
      } catch (error) {
        console.error("Payment settings error", error);
        setPaymentSettings(prev => ({ ...prev, loading: false }));
      }
    };

    if (user) {
        fetchCouriers();
        fetchPaymentSettings();
        fetchAddresses();
    }
  }, [cartItems, products, user]);

  /* ---------------- LOAD ADDRESSES ---------------- */
  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        // Filter out admin addresses if any
        const validAddresses = data.addresses.filter(addr => 
            !addr.email?.includes("admin@system") && 
            addr.street !== "Admin Created Order"
        );

        setAddresses(validAddresses);

        // Auto-select default
        if (validAddresses.length > 0) {
            if (!selectedAddress || !validAddresses.find(a => a._id === selectedAddress._id)) {
                const def = validAddresses.find((a) => a.isDefault);
                setSelectedAddress(def || validAddresses[0]);
            }
        } else {
            setSelectedAddress(null);
        }
      }
    } catch (error) {
      console.error("Address fetch failed", error);
    }
  };

  /* ---------------- ORDER PLACEMENT HANDLER ---------------- */
  const handlePlaceOrder = () => {
    // Validation
    if (!selectedAddress?._id) return toast.error("Please select an address");
    if (isEditing) return toast.error("Please save your address changes first");
    if (cartArray.length === 0) return toast.error("Your cart is empty");
    
    // DECISION LOGIC: COD vs ONLINE
    if (paymentMethod === "COD") {
         placeOrderCOD();
    } else {
         // Determine which online gateway is active from settings
         if (paymentSettings.enabledGateway === "razorpay") {
            placeRazorpayOrder();
         } else if (paymentSettings.enabledGateway === "phonepe") {
            placePhonePeOrder();
         } else {
            toast.error("No online payment gateway is currently configured.");
         }
    }
  };

  // --- 1. COD LOGIC ---
  const placeOrderCOD = async () => {
   setOrderLoading(true);
   try {
     const { data } = await axios.post("/api/order/cod", {
       items: cartArray.map((i) => ({ product: i._id, quantity: i.quantity })),
       addressId: selectedAddress._id,
       courier: selectedCourier ? {
             _id: selectedCourier._id,
             name: selectedCourier.name,
             price: selectedCourier.price,
             minDays: selectedCourier.minDays,
             maxDays: selectedCourier.maxDays,
             chargePerItem: selectedCourier.chargePerItem,
           } : null,
     });

     if (data.success) {
       toast.success("Order Placed Successfully!");
       setCartItems({});
       navigate("/my-orders");
       window.scrollTo(0, 0);
     } else {
       toast.error(data.message);
     }
   } catch (e) {
     toast.error(e.response?.data?.message || "Order Failed");
   } finally {
     setOrderLoading(false);
   }
  };

  // --- 2. RAZORPAY LOGIC ---
  const placeRazorpayOrder = async () => { 
    setOrderLoading(true);
    try {
        // Step 1: Create Order on Backend
        const { data } = await axios.post("/api/payments/razorpay/create", {
           items: cartArray.map((i) => ({ product: i._id, quantity: i.quantity })),
           addressId: selectedAddress._id,
           courier: selectedCourier,
           coupon: discount > 0 ? { code: couponCode, discount } : null,
        });
        
        if (!data.success) throw new Error(data.message);
        
        // Step 2: Open Razorpay Modal
        const options = {
           key: data.key,
           amount: data.amount * 100,
           currency: "INR",
           name: "Order Payment",
           description: `Order #${data.order.id}`,
           order_id: data.order.id,
           handler: async (response) => {
               try {
                   // Step 3: Verify Payment on Backend
                   await axios.post("/api/payments/razorpay/verify", { 
                       ...response, 
                       items: cartArray.map(i => ({product: i._id, quantity: i.quantity})), 
                       addressId: selectedAddress._id, 
                       courier: selectedCourier 
                   });
                   toast.success("Payment Successful!"); 
                   setCartItems({}); 
                   navigate("/my-orders");
               } catch (err) {
                   toast.error("Payment Verification Failed");
                   setOrderLoading(false);
               }
           },
           modal: {
               ondismiss: () => {
                   setOrderLoading(false);
                   toast("Payment Cancelled");
               }
           },
           prefill: { 
               name: `${selectedAddress.firstName} ${selectedAddress.lastName}`, 
               email: selectedAddress.email, 
               contact: selectedAddress.phone 
           },
           theme: { color: "#1E2A5E" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
   } catch(e) { 
       toast.error(e.message || "Razorpay initiation failed"); 
       setOrderLoading(false);
   }
  };

  // --- 3. PHONEPE LOGIC ---
  const placePhonePeOrder = async () => {
    setOrderLoading(true);
    try {
        const { data } = await axios.post("/api/payments/phonepe/create", {
            items: cartArray.map((i) => ({ product: i._id, quantity: i.quantity })),
            addressId: selectedAddress._id,
            courier: selectedCourier,
            coupon: discount > 0 ? { code: couponCode, discount } : null,
        });

        if (data.success && data.redirectUrl) {
            // Redirect user to PhonePe payment page
            window.location.href = data.redirectUrl; 
        } else {
            throw new Error(data.message || "Failed to initiate PhonePe");
        }
    } catch (e) {
        console.error(e);
        toast.error(e.response?.data?.message || "PhonePe failed");
        setOrderLoading(false);
    }
  };

  /* ---------------- INLINE EDIT HANDLERS ---------------- */
  const handleStartEdit = () => { setEditFormData({ ...selectedAddress }); setIsEditing(true); setShowAddressList(false); };
  const handleCancelEdit = () => { setIsEditing(false); setEditFormData({}); };
  const handleInputChange = (e) => { const { name, value } = e.target; setEditFormData(prev => ({ ...prev, [name]: value })); };

  const handleSaveEdit = async () => {
    setSaveLoading(true);
    try {
        const { data } = await axios.put(`/api/address/${selectedAddress._id}`, { address: editFormData });
        if (data.success) {
            toast.success("Address updated");
            const updatedList = addresses.map(a => a._id === selectedAddress._id ? data.address : a);
            setAddresses(updatedList);
            setSelectedAddress(data.address);
            setIsEditing(false);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error("Failed to update address");
    } finally {
        setSaveLoading(false);
    }
  };

  const handleAddNew = () => setShowAddModal(true);
  const handleDeleteAddress = (addr) => { setPendingDelete(addr); setConfirmOpen(true); };

  const applyCoupon = async () => {
    try {
      const subtotal = getCartAmount();
      // Use dynamic tax for coupon logic
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
      setDiscount(0);
    }
  };

  /* ---------------- CALCULATIONS ---------------- */
  // ✅ FIX: Use Dynamic Tax Percent from Backend
  const subtotal = getCartAmount();
  const taxAmount = (subtotal * paymentSettings.taxPercent) / 100;
  const shippingFee = selectedCourier?.price || 0;
  const totalAmount = subtotal + taxAmount + shippingFee - discount;

  /* ---------------- COMPONENTS ---------------- */
  const FormField = ({ label, name, value, icon: Icon, fullWidth, type = "text" }) => (
    <div className={`flex flex-col ${fullWidth ? 'md:col-span-2' : ''}`}>
        <label className="text-xs uppercase text-gray-500 font-bold mb-2 flex items-center gap-1.5">{Icon && <Icon className="w-3.5 h-3.5" />}{label}</label>
        {isEditing ? (
            <input type={type} name={name} value={editFormData[name] || ""} onChange={handleInputChange} className="bg-white border border-gray-300 focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E] rounded-lg px-4 py-3.5 text-base text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400" />
        ) : (
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3.5 text-base font-medium text-gray-800 shadow-sm min-h-[50px] flex items-center">{value || "N/A"}</div>
        )}
    </div>
  );

  const AddressSkeleton = () => (
    <div className="animate-pulse space-y-4 p-8">
      <div className="grid grid-cols-2 gap-6"><div className="h-12 bg-gray-100 rounded-lg"></div><div className="h-12 bg-gray-100 rounded-lg"></div><div className="h-12 bg-gray-100 rounded-lg col-span-2"></div></div>
    </div>
  );

  return (
    <div className="min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* HEADER */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E2A5E] tracking-tight">Checkout</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mt-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure SSL Encrypted Transaction</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* --- LEFT COLUMN: ADDRESS --- */}
          <motion.div className="flex-1 w-full space-y-6 lg:sticky lg:top-24 h-fit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-colors ${isEditing ? 'border-[#1E2A5E] ring-1 ring-[#1E2A5E]' : 'border-gray-200'}`}>
              <div className="px-6 py-5 border-b border-gray-100 bg-[#F9FAFB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#1E2A5E] flex items-center gap-2"><MapPin className="w-4 h-4" />{isEditing ? "Editing Shipping Details" : "Shipping Details"}</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!isEditing && selectedAddress && (
                        <>
                            <button onClick={handleStartEdit} className="flex-1 sm:flex-none text-xs font-bold text-gray-600 hover:text-[#1E2A5E] flex items-center justify-center gap-1 bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:border-gray-300 transition-all shadow-sm"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                            <button onClick={() => setShowAddressList(!showAddressList)} className="flex-1 sm:flex-none text-xs font-bold text-[#008779] hover:text-teal-700 tracking-wide bg-teal-50 px-4 py-2.5 rounded-lg border border-teal-100 transition-all text-center">{showAddressList ? "CLOSE LIST" : "CHANGE ADDRESS"}</button>
                        </>
                    )}
                </div>
              </div>

              {/* Address Form Logic */}
              {!showAddressList && (
                  <div className="">
                    {!addresses ? ( <AddressSkeleton /> ) : addresses.length === 0 ? (
                        <div className="text-center py-10"><MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 mb-6 text-base">No addresses found.</p><button onClick={handleAddNew} className="px-6 py-3 bg-[#1E2A5E] text-white rounded-lg text-sm font-bold hover:bg-[#162044] transition-all">+ Add New Address</button></div>
                    ) : selectedAddress ? (
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <FormField label="First Name" name="firstName" value={isEditing ? editFormData.firstName : selectedAddress.firstName} icon={User} />
                                <FormField label="Last Name" name="lastName" value={isEditing ? editFormData.lastName : selectedAddress.lastName} />
                                <FormField label="Email Address" name="email" value={isEditing ? editFormData.email : selectedAddress.email} icon={Mail} />
                                <FormField label="Phone Number" name="phone" value={isEditing ? editFormData.phone : selectedAddress.phone} icon={Phone} />
                                <FormField label="Street Address" name="street" value={isEditing ? editFormData.street : selectedAddress.street} icon={MapPin} fullWidth />
                                <FormField label="City" name="city" value={isEditing ? editFormData.city : selectedAddress.city} />
                                <FormField label="State" name="state" value={isEditing ? editFormData.state : selectedAddress.state} />
                                <FormField label="Zip Code" name="zipCode" value={isEditing ? editFormData.zipCode : selectedAddress.zipCode} />
                                <FormField label="Country" name="country" value={isEditing ? editFormData.country : selectedAddress.country} icon={Globe} />
                            </div>
                            {isEditing && (<div className="mt-8 pt-6 border-t border-gray-100 flex gap-4"><button onClick={handleSaveEdit} disabled={saveLoading} className="flex-1 bg-[#1E2A5E] text-white py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#162044] transition-all disabled:opacity-70 shadow-md">{saveLoading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}</button><button onClick={handleCancelEdit} disabled={saveLoading} className="px-8 py-3.5 border border-gray-200 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all">Cancel</button></div>)}
                        </div>
                    ) : ( <div className="p-10 text-center"><button onClick={() => setShowAddressList(true)} className="text-[#1E2A5E] font-bold text-base underline underline-offset-4">Please select a delivery address to continue</button></div> )}
                  </div>
              )}
              <AnimatePresence>
                {showAddressList && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-gray-50 border-t border-gray-100">
                        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {addresses.map((addr) => (
                                <div key={addr._id} onClick={() => { setSelectedAddress(addr); setShowAddressList(false); }} className={`relative p-5 rounded-xl border cursor-pointer transition-all group hover:shadow-md ${selectedAddress?._id === addr._id ? 'border-[#1E2A5E] bg-white ring-1 ring-[#1E2A5E]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <div className="flex justify-between items-start pr-16"><div><p className="font-bold text-base text-[#1E2A5E] mb-1">{addr.firstName} {addr.lastName}</p><p className="text-sm text-gray-600 mt-0.5 truncate max-w-[300px]">{addr.street}, {addr.city}</p></div>{selectedAddress?._id === addr._id && <CheckCircle className="w-6 h-6 text-[#008779]" />}</div>
                                    <div className="absolute top-4 right-4"><button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr); }} className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button></div>
                                </div>
                            ))}
                            <button onClick={() => { handleAddNew(); setShowAddressList(false); }} className="w-full py-4 flex items-center justify-center gap-2 text-sm font-bold text-[#1E2A5E] border border-dashed border-[#1E2A5E]/30 bg-white rounded-xl hover:bg-[#1E2A5E]/5 transition-colors"><Plus className="w-5 h-5" /> Add New Address</button>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: SUMMARY & PAYMENT --- */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 lg:p-8">
              <h3 className="text-xl font-bold text-[#1E2A5E] mb-6 border-b border-gray-100 pb-4">Order Summary</h3>

              {/* Items List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {cartArray.map((item) => (
                    <div key={item._id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 p-1 shrink-0"><img src={item.images?.[0]} alt="" className="w-full h-full object-contain mix-blend-multiply" /></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start"><h4 className="font-bold text-[#1E2A5E] text-sm leading-tight line-clamp-2">{item.name}</h4><p className="font-bold text-[#008779] text-sm ml-2 whitespace-nowrap">{currency}{item.offerPrice * item.quantity}</p></div>
                            <div className="flex items-center gap-2 mt-1"><span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Qty: {item.quantity}</span><span className="text-[10px] text-gray-400">× {currency}{item.offerPrice}</span></div>
                        </div>
                    </div>
                ))}
              </div>

              {/* Courier Selection */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping Method</h4>
                {loadingCouriers ? (<div className="space-y-2 animate-pulse"><div className="h-12 bg-gray-100 rounded-lg"></div></div>) : (
                  <div className="space-y-2">
                    {couriers.map((courier) => (
                      <div key={courier._id} onClick={() => setSelectedCourier(courier)} className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer text-sm transition-all ${selectedCourier?._id === courier._id ? "border-[#1E2A5E] bg-[#fdfdfd] ring-1 ring-[#1E2A5E] shadow-sm" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                        <div className="flex items-center gap-3"><div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedCourier?._id === courier._id ? 'border-[#1E2A5E]' : 'border-gray-300'}`}>{selectedCourier?._id === courier._id && <div className="w-2 h-2 rounded-full bg-[#1E2A5E]"></div>}</div><div><p className="font-medium text-[#1E2A5E]">{courier.name}</p><p className="text-[10px] text-gray-500 font-medium flex items-center gap-1"><Truck className="w-3 h-3" /> {courier.minDays}-{courier.maxDays} Days</p></div></div>
                        <span className="font-bold text-[#1E2A5E]">{courier.price === 0 ? <span className="text-[#008779]">Free</span> : `${currency}${courier.price}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- USER PAYMENT SELECTION --- */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Method</h4>
                
                {paymentSettings.loading ? (
                    <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                ) : (
                    <div className="space-y-3">
                        {/* Option 1: Online Payment */}
                        {paymentSettings.enabledGateway && (
                            <div 
                                onClick={() => setPaymentMethod("ONLINE")} 
                                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "ONLINE" ? "border-[#1E2A5E] bg-blue-50/50 ring-1 ring-[#1E2A5E]" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "ONLINE" ? 'border-[#1E2A5E]' : 'border-gray-300'}`}>
                                    {paymentMethod === "ONLINE" && <div className="w-2 h-2 rounded-full bg-[#1E2A5E]"></div>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[#1E2A5E] flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" /> 
                                        Pay Online
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Secure payment via {paymentSettings.enabledGateway === "razorpay" ? "Razorpay" : "PhonePe"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Option 2: COD */}
                        {paymentSettings.codEnabled && (
                            <div 
                                onClick={() => setPaymentMethod("COD")} 
                                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "COD" ? "border-[#1E2A5E] bg-blue-50/50 ring-1 ring-[#1E2A5E]" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "COD" ? 'border-[#1E2A5E]' : 'border-gray-300'}`}>
                                    {paymentMethod === "COD" && <div className="w-2 h-2 rounded-full bg-[#1E2A5E]"></div>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[#1E2A5E] flex items-center gap-2">
                                        <Banknote className="w-4 h-4" /> 
                                        Cash on Delivery
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">Pay with cash upon delivery</p>
                                </div>
                            </div>
                        )}

                        {/* Fallback */}
                        {!paymentSettings.codEnabled && !paymentSettings.enabledGateway && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl text-center border border-red-100">
                                No payment methods are currently available. Please contact support.
                            </div>
                        )}
                    </div>
                )}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-8">
                <div className="relative flex-1"><input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Discount Code" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-3 py-3 text-sm outline-none focus:border-[#1E2A5E] focus:ring-1 focus:ring-[#1E2A5E] transition-all font-medium uppercase placeholder:normal-case placeholder:text-gray-400" /></div>
                <button onClick={applyCoupon} className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#1E2A5E] transition-all shadow-md">Apply</button>
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-gray-100 text-sm text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-gray-900">{currency}{subtotal.toFixed(2)}</span></div>
                
                {/* ✅ TAX IS NOW DYNAMIC */}
                <div className="flex justify-between">
                    <span>Tax ({paymentSettings.taxPercent}%)</span>
                    <span className="font-medium text-gray-900">{currency}{taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between"><span>Shipping</span>{shippingFee === 0 ? <span className="text-[#008779] font-bold">Free</span> : <span className="font-medium text-gray-900">{currency}{shippingFee}</span>}</div>
                {discount > 0 && (<div className="flex justify-between text-[#008779] bg-teal-50 p-2 rounded"><span className="font-bold">Discount Applied</span><span className="font-bold">-{currency}{discount}</span></div>)}
              </div>
              <div className="flex justify-between items-end pt-5 mt-5 border-t border-gray-200">
                <span className="text-base font-bold text-[#1E2A5E]">Total to Pay</span>
                <span className="text-2xl font-bold text-[#008779]">{currency}{totalAmount.toFixed(2)}</span>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isEditing || orderLoading || (!paymentSettings.codEnabled && !paymentSettings.enabledGateway)}
                className={`w-full mt-8 bg-[#1E2A5E] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-[#151f42] hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${(isEditing || orderLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {orderLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                ) : (
                    <><ShoppingBag className="w-4 h-4" />Place Order</>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-gray-400 font-medium bg-gray-50 py-2 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                Payments are secure and encrypted
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <AddAddressModal open={showAddModal} onClose={() => setShowAddModal(false)} editAddress={null} onSaved={(updated) => { fetchAddresses(); setSelectedAddress(updated); }} />
      <ConfirmActionModal open={confirmOpen} onClose={() => { setConfirmOpen(false); setPendingDelete(null); }} title="Delete Address" description="Are you sure you want to remove this address?" confirmText="Delete" danger loading={confirmLoading} onConfirm={async () => { try { setConfirmLoading(true); const { data } = await axios.delete(`/api/address/${pendingDelete._id}`); if (data.success) { toast.success("Address deleted"); const updated = addresses.filter(a => a._id !== pendingDelete._id); setAddresses(updated); if (selectedAddress?._id === pendingDelete._id) setSelectedAddress(updated[0] || null); } } catch { toast.error("Delete failed"); } finally { setConfirmLoading(false); setConfirmOpen(false); setPendingDelete(null); } }} />
    </div>
  );
};

export default Checkout;