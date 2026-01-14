import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// --- ICONS ---
const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const BagIcon = () => <svg className="w-12 h-12 text-indigo-100 bg-indigo-50 p-2.5 rounded-full mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const TruckIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v9h1m8-9h2.414a1 1 0 01.707.293l2.586 2.586a1 1 0 01.293.707V16h-1.828" /></svg>;

const CreateOrder = () => {
  const { products, axios, currency, fetchProducts, couriers, fetchCouriersOnce } = useAppContext();
  const navigate = useNavigate();

  // State
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState(null); // New Courier State
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Search State
  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const userRef = useRef(null);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    if (!products.length) fetchProducts();
    fetchCouriersOnce(); // Load couriers

    const loadUsers = async () => {
      try {
        const { data } = await axios.get("/api/admin-users/users");
        if (data.success) {
          setUsers(data.users);
        } else {
          toast.error("Failed to load users list");
        }
      } catch (error) {
        toast.error("Error connecting to server");
      }
    };
    loadUsers();
  }, []);

  // Set default courier when loaded
  useEffect(() => {
    if (couriers.length > 0 && !selectedCourier) {
      setSelectedCourier(couriers[0]);
    }
  }, [couriers]);

  // Click Outside
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- 2. FILTER LOGIC ---
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = userSearch.toLowerCase();
    return users.filter(u => 
      (u.name && u.name.toLowerCase().includes(term)) || 
      (u.mobile && u.mobile.includes(term))
    ).slice(0, 5);
  }, [users, userSearch]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    const term = productSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(term)).slice(0, 5);
  }, [products, productSearch]);

  // --- 3. CART LOGIC ---
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) {
        return prev.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setProductSearch("");
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i._id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i._id !== id));

  // --- CALCULATIONS ---
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const taxAmount = Math.floor(subtotal * 0.02);
  const shippingFee = selectedCourier?.price || 0;
  const totalAmount = subtotal + taxAmount + shippingFee;

  // --- 4. SUBMIT ---
  const handleConfirmClick = () => {
    if (!selectedUser) return toast.error("Please select a customer");
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!selectedCourier) return toast.error("Please select a shipping method");
    setShowConfirmModal(true);
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        userId: selectedUser._id,
        items: cart.map(i => ({ 
            product: i._id, 
            quantity: i.quantity, 
            price: i.price 
        })),
        paymentMethod: "COD",
        courier: selectedCourier // ✅ SEND COURIER DATA
      };

      const { data } = await axios.post("/api/admin-orders/create", payload);
      
      if (data.success) {
        toast.success("Order created successfully");
        setShowConfirmModal(false);
        // await axios.get("/api/admin-orders/orders"); // Optional if navigate handles reload
        navigate("/admin/orders", { state: { refresh: true } });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-gray-100 font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
        <div className=" mx-auto space-y-8 pb-20">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Order</h1>
              <p className="text-sm text-slate-500 mt-1">Manually create an order for a customer.</p>
            </div>
            <button 
              onClick={() => navigate('/admin/orders')} 
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Customer Selection */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" ref={userRef}>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px]">1</span>
                  Select Customer
                </h2>
                
                <div className="relative">
                  <div 
                    onClick={() => setShowUserDropdown(true)}
                    className="flex items-center border border-slate-200 rounded-xl px-4 py-3 cursor-text bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm hover:border-slate-300"
                  >
                    <UserIcon />
                    <input 
                      type="text" 
                      placeholder="Search by name or mobile..." 
                      className="flex-1 ml-3 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setShowUserDropdown(true);
                        if(!e.target.value) setSelectedUser(null);
                      }}
                    />
                    {selectedUser ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(null); setUserSearch(""); }}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        ×
                      </button>
                    ) : (
                      <ChevronDownIcon />
                    )}
                  </div>

                  {/* User Dropdown */}
                  {showUserDropdown && filteredUsers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-60 overflow-y-auto animate-slideInDown">
                      {filteredUsers.map(u => (
                        <div 
                          key={u._id} 
                          onClick={() => {
                            setSelectedUser(u);
                            setUserSearch(u.name);
                            setShowUserDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.mobile}</p>
                          </div>
                          {u.isBlocked && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">BLOCKED</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!selectedUser && <p className="text-xs text-slate-400 mt-2 ml-1">Search to select an existing customer.</p>}
              </div>

              {/* 2. Product Search */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px]">2</span>
                  Add Products
                </h2>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm"
                  />
                  
                  {/* Product Dropdown */}
                  {productSearch && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-40 overflow-hidden max-h-64 overflow-y-auto animate-slideInDown">
                      {filteredProducts.map(p => (
                        <div 
                          key={p._id} 
                          onClick={() => addToCart(p)}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{p.name}</p>
                              <p className="text-xs text-slate-500">Price: {currency}{p.price}</p>
                            </div>
                          </div>
                          <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Order Items Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-700">Order Items</h3>
                  <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{cart.length}</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 font-semibold w-[40%]">Product</th>
                        <th className="px-6 py-3 font-semibold text-center w-[20%]">Qty</th>
                        <th className="px-6 py-3 font-semibold text-right w-[20%]">Total</th>
                        <th className="px-6 py-3 w-[10%]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cart.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-12 text-center">
                            <div className="text-slate-300 mb-2">
                              <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <p className="text-slate-400 text-sm">No items added yet.</p>
                          </td>
                        </tr>
                      ) : (
                        cart.map(item => (
                          <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                  <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900 text-sm line-clamp-1">{item.name}</p>
                                  <p className="text-xs text-slate-500">{currency}{item.price}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2 bg-slate-100 rounded-lg w-fit mx-auto px-1 py-1 border border-slate-200">
                                <button onClick={() => updateQty(item._id, -1)} className="w-6 h-6 rounded bg-white shadow-sm hover:text-indigo-600 flex items-center justify-center text-slate-500 text-xs disabled:opacity-50 transition-colors font-bold">-</button>
                                <span className="text-sm font-bold w-6 text-center text-slate-700">{item.quantity}</span>
                                <button onClick={() => updateQty(item._id, 1)} className="w-6 h-6 rounded bg-white shadow-sm hover:text-indigo-600 flex items-center justify-center text-slate-500 text-xs transition-colors font-bold">+</button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                              {currency}{(item.price * item.quantity).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => removeItem(item._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><TrashIcon /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Summary */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 pb-4 border-b border-slate-100">
                  Payment Summary
                </h2>
                
                {/* 🆕 Courier Selection */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Shipping Method</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <TruckIcon />
                        </div>
                        <select 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
                            onChange={(e) => {
                                const courier = couriers.find(c => c._id === e.target.value);
                                setSelectedCourier(courier);
                            }}
                            value={selectedCourier?._id || ""}
                        >
                            {couriers.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.name} - {c.price === 0 ? "Free" : `${currency}${c.price}`}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                            <ChevronDownIcon />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">{currency}{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Estimated Tax (2%)</span>
                    <span className="font-medium text-slate-900">{currency}{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery Fee</span>
                    {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">FREE</span>
                    ) : (
                        <span className="font-medium text-slate-900">{currency}{shippingFee}</span>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <span className="font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-bold text-slate-900 leading-none">
                      {currency}{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleConfirmClick}
                  disabled={loading || cart.length === 0 || !selectedUser || !selectedCourier}
                  className="w-full mt-8 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  Place Order
                </button>
                
                {!selectedUser && (
                  <p className="text-center text-xs text-amber-600 mt-3 font-medium bg-amber-50 py-2 rounded-lg border border-amber-100">
                    ⚠ Please select a customer to proceed
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center isolate">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={() => setShowConfirmModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 m-4 animate-scaleIn text-center">
                <div className="flex justify-center"><BagIcon /></div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Confirm Order Creation?</h2>
                <p className="text-sm text-slate-500 mb-6">
                    You are about to create an order for <strong>{selectedUser?.name}</strong> totaling <strong>{currency}{totalAmount.toLocaleString()}</strong>.
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancel</button>
                    <button 
                        onClick={createOrder} 
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg transition-colors flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Creating...</>
                        ) : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default CreateOrder;