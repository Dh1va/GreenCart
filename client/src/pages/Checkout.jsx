import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import AddAddressModal from "../components/AddAddressModal";
import ConfirmActionModal from "../components/ConfirmActionModal";

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
          const verify = await axios.post(
            "/api/order/razorpay/verify",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartArray.map((i) => ({
                product: i._id,
                quantity: i.quantity,
              })),
              addressId: selectedAddress._id,
            }
          );

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
  const totalAmount = getCartAmount() + taxAmount + selectedCourier.price - discount;


  return (
    <div className="flex flex-col md:flex-row py-16 mt-16 gap-10">
      {/* LEFT */}
      <div className="flex-1 max-w-3xl">
        <h1 className="text-3xl font-medium mb-6">Checkout</h1>

        {/* ADDRESS */}
        <p className="text-sm font-medium uppercase">Delivery Address</p>

        <div className="relative mt-2">
          <p className="text-gray-500">
            {selectedAddress
              ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}, ${selectedAddress.zipCode}`
              : "No address found"}
          </p>

          <div className="flex gap-4 mt-2">
            {/* SELECT PREVIOUS ADDRESS */}
            <button
              onClick={() => setShowAddress((prev) => !prev)}
              className="text-primary hover:underline"
            >
              Change
            </button>

            {/* EDIT CURRENT ADDRESS */}
            <button
              onClick={() => {
                setEditAddress(selectedAddress);
                setShowAddModal(true);
              }}
              className="text-primary hover:underline"
            >
              Edit
            </button>
          </div>



          {/* ADDRESS SELECTOR */}
          {showAddress && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-md z-20">

              {/* HEADER */}
              <div className="flex justify-between items-center px-4 py-3">
                <p className="text-sm font-medium text-gray-700">Select Address</p>
                <button
                  onClick={() => setShowAddress(false)}
                  className="text-gray-500 hover:text-black text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {/* ADDRESS LIST */}
              <div className="max-h-60 overflow-y-auto">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`flex justify-between gap-3 px-4 py-3 text-sm ${selectedAddress?._id === address._id
                      ? "bg-indigo-50"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    {/* SELECT ADDRESS */}
                    <div
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddress(false);
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <p className="font-medium text-gray-800">
                        {address.label}
                        {address.isDefault && (
                          <span className="ml-2 text-xs text-green-600">(Default)</span>
                        )}
                      </p>
                      <p className="text-gray-500">
                        {address.street}, {address.city}, {address.state}
                      </p>
                    </div>

                    {/* DELETE ICON */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();

                        if (address.isDefault) {
                          toast.error("Cannot delete default address");
                          return;
                        }

                        setPendingDelete(address);
                        setConfirmOpen(true);
                      }}
                      title="Delete address"
                      className={`text-sm ${address.isDefault
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:text-red-300"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* ADD NEW */}
              <button
                onClick={() => {
                  setEditAddress(null);
                  setShowAddModal(true);
                  setShowAddress(false);
                }}
                className="w-full py-3 text-primary text-sm font-medium hover:bg-gray-100 rounded-b-md"
              >
                + Add new address
              </button>
            </div>
          )}



        </div>


        {/* COURIER SELECTION */}
        <p className="text-sm font-medium uppercase mt-8">Delivery Method</p>

        <div className="mt-3 space-y-3">
          {couriers.map((courier) => (
            <label
              key={courier.name}
              className="flex items-center justify-between cursor-pointer p-3 rounded hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {/* Custom Radio */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
        ${selectedCourier.name === courier.name
                      ? "border-[#4FBF8B]"
                      : "border-gray-400"
                    }
      `}
                >
                  {selectedCourier.name === courier.name && (
                    <div className="w-2 h-2 rounded-full bg-[#4FBF8B]" />
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
              </div>

              <span className="text-sm text-gray-600">
                {courier.price === 0 ? "Free" : `${currency}${courier.price}`}
              </span>
            </label>

          ))}
        </div>

      </div>

      {/* RIGHT – SUMMARY */}
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

        {/* PRICE BREAKUP */}
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{currency}{getCartAmount()}</span>
          </p>

          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>{currency}{taxAmount}</span>
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
              <span>-{currency}{discount}</span>
            </p>
          )}

          <hr />

          <p className="flex justify-between text-base font-medium text-gray-800">
            <span>Total</span>
            <span>{currency}{totalAmount}</span>
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
  );
};

export default Checkout;
