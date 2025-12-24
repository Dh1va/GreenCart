import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import AddAddressModal from "../components/AddAddressModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import { motion, AnimatePresence } from "framer-motion";

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

  // COURIERS (TEMP – HARDCODED)
  const [couriers] = useState([
    { name: "Standard Delivery", price: 0 },
    { name: "Express Delivery", price: 49 },
    { name: "Same Day Delivery", price: 99 },
  ]);

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(couriers[0]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

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

  /* ---------------- CART ---------------- */
  useEffect(() => {
    const temp = [];
    for (const key in cartItems) {
      const product = products.find((p) => p._id === key);
      if (product) temp.push({ ...product, quantity: cartItems[key] });
    }
    setCartArray(temp);
  }, [cartItems, products]);

  /* ---------------- ADDRESSES ---------------- */
  const fetchAddresses = async () => {
    const { data } = await axios.get("/api/address/get");
    if (data.success) {
      setAddresses(data.addresses);
      if (data.addresses.length > 0) {
        setSelectedAddress(data.addresses[0]);
      }
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  /* ---------------- ONLINE PAYMENT ONLY ---------------- */
  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    if (cartArray.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const { data } = await axios.post("/api/order/razorpay/order", {
        items: cartArray.map((i) => ({
          product: i._id,
          quantity: i.quantity,
        })),
        addressId: selectedAddress._id,
        courier: {
          name: selectedCourier.name,
          price: selectedCourier.price,
        },
      });

      if (!data.success) {
        toast.error(data.message || "Payment initiation failed");
        return;
      }

      const { order, key } = data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Your Store",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response) {
          const verify = await axios.post("/api/order/razorpay/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items: cartArray.map((i) => ({
              product: i._id,
              quantity: i.quantity,
            })),
            addressId: selectedAddress._id,
          });

          if (verify.data.success) {
            toast.success("Payment successful");
            setCartItems({});
            navigate("/my-orders");
          } else {
            toast.error(verify.data.message);
          }
        },

        theme: { color: "#3399cc" },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Coupon apply
  const applyCoupon = async () => {
    try {
      const { data } = await axios.post("/api/coupon/validate", {
        code: couponCode,
        orderAmount: getCartAmount() + taxAmount + selectedCourier.price,
      });

      if (data.success) {
        setDiscount(data.discount);
        toast.success("Coupon applied");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const taxAmount = (getCartAmount() * 2) / 100;
  const totalAmount =
    getCartAmount() + taxAmount + selectedCourier.price - discount;

  const AddressSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );

  return (
    <div className="py-16 mt-16">
      {/* PAGE TITLE */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-0 mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your order and complete payment
        </p>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col md:flex-row gap-10 items-start max-w-[1280px] mx-auto px-4 md:px-0">
        {/* LEFT */}
        <motion.div
          className="flex-1 max-w-4xl space-y-6 md:sticky"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* ================= DELIVERY ADDRESS ================= */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-1 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center px-5 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                1. Delivery Address
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddress(true)}
                  className="text-xs font-bold text-primary hover:text-primary-dull transition-colors"
                >
                  CHANGE
                </button>
                {selectedAddress && (
                  <button
                    onClick={() => {
                      setEditAddress(selectedAddress);
                      setShowAddModal(true);
                    }}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    EDIT
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {!addresses.length ? (
                <AddressSkeleton />
              ) : selectedAddress ? (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {selectedAddress.label}
                      </span>

                      {selectedAddress.isDefault && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {selectedAddress.street}, {selectedAddress.city}, 
                      {selectedAddress.state}, {selectedAddress.country} -{" "}
                      {selectedAddress.zipCode}, <span className="text-gray-800 px-2">Phone: {selectedAddress.phone}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">
                    No delivery address selected
                  </p>
                  <button
                    onClick={() => setShowAddress(true)}
                    className="text-sm font-medium px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition"
                  >
                    Select an Address
                  </button>
                </div>
              )}
            </div>

            {/* ================= ADDRESS SELECTOR MODAL-LIKE POPUP ================= */}
            {showAddress && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 gap-3">
                  {addresses.map((address) => (
                    <button
                      key={address._id}
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddress(false);
                      }}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedAddress?._id === address._id
                          ? "bg-white border-primary shadow-md ring-1 ring-primary"
                          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-gray-900">
                          {address.label}
                        </span>
                        {selectedAddress?._id === address._id && (
                          <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {address.street}, {address.city}, {address.state}
                      </p>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setEditAddress(null);
                      setShowAddModal(true);
                      setShowAddress(false);
                    }}
                    className="flex items-center justify-center gap-2 p-3 text-sm font-semibold text-primary border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <span>+ Add New Address</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================= DELIVERY ETA ================= */}
<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hidden md:block">
  {/* HEADER */}
  <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
       Estimated Delivery
    </h2>
  </div>

  {/* CONTENT */}
  <div className="p-6 flex items-center gap-4">
    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">
        Delivery Timeline
      </p>

      <AnimatePresence mode="wait">
        <motion.p
          key={selectedCourier.name}
          className="text-sm font-semibold text-gray-800"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {selectedCourier.name === "Same Day Delivery"
            ? "Arriving Today"
            : selectedCourier.name === "Express Delivery"
            ? "Arriving in 1–2 business days"
            : "Arriving in 3–5 business days"}
        </motion.p>
      </AnimatePresence>
    </div>
  </div>
</div>


          {/* ================= DELIVERY INSTRUCTIONS ================= */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hidden md:block">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
               Delivery Instructions
            </h2>
            <textarea
              placeholder="E.g. Call before delivery, leave with security…"
              className="w-full p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              rows={3}
            />
          </div>

          
        </motion.div>

        {/* RIGHT – SUMMARY */}
        <div className="w-full max-w-[360px] bg-white p-5 border border-gray-200 rounded-md">
          <h2 className="text-lg font-medium mb-4">Review your cart</h2>

          {/* CART ITEMS */}
          <div className="space-y-4 mb-5">
            {cartArray.map((item) => (
              <div key={item._id} className="flex gap-3">
                <div className="w-16 h-16 border rounded flex items-center justify-center">
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="object-contain h-full"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.quantity}x</p>
                  <p className="text-sm mt-1">
                    {currency}
                    {item.offerPrice * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* COUPON */}
          <div className="border rounded-md px-3 py-2 flex items-center gap-3 mb-5">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Discount code"
              className="flex-1 outline-none text-sm bg-transparent"
            />

            <button
              onClick={applyCoupon}
              className="text-primary text-sm font-medium cursor-pointer"
            >
              Apply
            </button>
          </div>

          {/* DELIVERY METHOD */}
          <div className="mb-5">
            <p className="text-sm font-medium uppercase mb-3 text-gray-700">
              Delivery Method
            </p>

            <div className="space-y-2">
              {couriers.map((courier) => (
                <label
                  key={courier.name}
                  className={`flex items-center justify-between p-3 rounded cursor-pointer border
          ${
            selectedCourier.name === courier.name
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:bg-gray-50"
          }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Radio */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${
                selectedCourier.name === courier.name
                  ? "border-primary"
                  : "border-gray-400"
              }`}
                    >
                      {selectedCourier.name === courier.name && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>

                    <input
                      type="radio"
                      name="courier"
                      checked={selectedCourier.name === courier.name}
                      onChange={() => setSelectedCourier(courier)}
                      className="hidden"
                    />

                    <span className="text-sm text-gray-700">
                      {courier.name}
                    </span>
                    {/* MOBILE ETA */}
  <span className="md:hidden text-xs text-gray-500 mt-0.5">
    {courier.name === "Same Day Delivery"
      ? "Arrives today"
      : courier.name === "Express Delivery"
      ? "1–2 business days"
      : "3–5 business days"}
  </span>
                  </div>

                  <span className="text-sm text-gray-600">
                    {courier.price === 0
                      ? "Free"
                      : `${currency}${courier.price}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* PRICE BREAKUP */}
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>
                {currency}
                {getCartAmount()}
              </span>
            </p>

            <p className="flex justify-between">
              <span>Tax (2%)</span>
              <span>
                {currency}
                {taxAmount}
              </span>
            </p>

            <p className="flex justify-between">
              <span>Delivery</span>
              <span>
                {selectedCourier.price === 0
                  ? "Free"
                  : `${currency}${selectedCourier.price}`}
              </span>
            </p>

            {discount > 0 && (
              <p className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>
                  -{currency}
                  {discount}
                </span>
              </p>
            )}

            <hr />

            <p className="flex justify-between text-base font-medium text-gray-800">
              <span>Total</span>
              <span>
                {currency}
                {totalAmount}
              </span>
            </p>
          </div>

          <button
            onClick={placeOrder}
            className="w-full py-3 mt-5 bg-primary text-white font-medium rounded hover:bg-primary-dull transition"
          >
            Proceed to Pay
          </button>
        </div>

        {/* ADD ADDRESS MODAL */}
        <AddAddressModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          editAddress={editAddress}
          onSaved={(updatedAddress) => {
            fetchAddresses();
            setSelectedAddress(updatedAddress); // ✅ SELECT UPDATED ADDRESS
          }}
        />

        <ConfirmActionModal
          open={confirmOpen}
          onClose={() => {
            setConfirmOpen(false);
            setPendingDelete(null);
          }}
          title="Delete Address"
          description="This address will be removed permanently."
          confirmText="Delete"
          cancelText="Cancel"
          danger
          loading={confirmLoading}
          onConfirm={async () => {
            try {
              setConfirmLoading(true);
              const { data } = await axios.delete(
                `/api/address/${pendingDelete._id}`
              );

              if (data.success) {
                toast.success("Address deleted");

                const updated = addresses.filter(
                  (a) => a._id !== pendingDelete._id
                );
                setAddresses(updated);

                if (selectedAddress?._id === pendingDelete._id) {
                  setSelectedAddress(updated[0] || null);
                }
              } else {
                toast.error(data.message);
              }
            } catch (err) {
              toast.error(err.message);
            } finally {
              setConfirmLoading(false);
              setConfirmOpen(false);
              setPendingDelete(null);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Checkout;
