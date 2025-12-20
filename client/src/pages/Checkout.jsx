import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

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

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [paymentOption, setPaymentOption] = useState("COD");

  /* ---------------- GUARD (GUEST USER) ---------------- */
 useEffect(() => {
  if (!authChecked) return;

  if (!user) {
    toast.error("Please login to continue");
    setRedirectAfterLogin("/checkout");
    setShowUserLogin(true);
    navigate("/cart");
  }
}, [authChecked, user]);


  /* ---------------- CART ARRAY ---------------- */
  useEffect(() => {
    const temp = [];
    for (const key in cartItems) {
      const product = products.find((p) => p._id === key);
      if (product) {
        temp.push({ ...product, quantity: cartItems[key] });
      }
    }
    setCartArray(temp);
  }, [cartItems, products]);

  /* ---------------- FETCH ADDRESSES ---------------- */
  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  /* ---------------- PLACE ORDER ---------------- */
  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    const itemsPayload = cartArray.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    if (itemsPayload.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      /* ---------- COD ---------- */
      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", {
          items: itemsPayload,
          address: selectedAddress._id,
        });

        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
        return;
      }

      /* ---------- ONLINE (RAZORPAY) ---------- */
      if (paymentOption === "Online") {
        const { data } = await axios.post("/api/order/razorpay/order", {
          items: itemsPayload,
          addressId: selectedAddress._id,
        });

        if (!data.success) {
          toast.error(data.message || "Payment init failed");
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
            try {
              const verify = await axios.post(
                "/api/order/razorpay/verify",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items: itemsPayload,
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
            } catch (err) {
              toast.error(err.message);
            }
          },
          theme: { color: "#3399cc" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const taxAmount = (getCartAmount() * 2) / 100;
  const totalAmount = getCartAmount() + taxAmount;

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
              ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
              : "No address found"}
          </p>

          <button
            onClick={() => setShowAddress(!showAddress)}
            className="text-primary hover:underline mt-2"
          >
            Change
          </button>

          {showAddress && (
            <div className="absolute top-full left-0 mt-1 bg-white border w-full z-10 shadow-md">
              {addresses.map((address, index) => (
                <p
                  key={index}
                  onClick={() => {
                    setSelectedAddress(address);
                    setShowAddress(false);
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  {address.street}, {address.city}
                </p>
              ))}
              <p
                onClick={() => navigate("/add-address")}
                className="text-primary text-center p-2 hover:bg-indigo-500/10 cursor-pointer"
              >
                Add address
              </p>
            </div>
          )}
        </div>

        {/* PAYMENT */}
        <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
        <select
          onChange={(e) => setPaymentOption(e.target.value)}
          className="w-full border px-3 py-2 mt-2 outline-none"
        >
          <option value="COD">Cash On Delivery</option>
          <option value="Online">Online Payment</option>
        </select>
      </div>

      {/* RIGHT – SUMMARY */}
      <div className="w-full max-w-[360px] bg-gray-100/40 p-5 border">
        <h2 className="text-xl font-medium">Order Summary</h2>
        <hr className="my-5" />

        <div className="space-y-2 text-gray-500">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{currency}{getCartAmount()}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>{currency}{taxAmount}</span>
          </p>
          <p className="flex justify-between text-lg font-medium pt-3">
            <span>Total Amount</span>
            <span>{currency}{totalAmount}</span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full py-3 mt-6 bg-primary text-white font-medium hover:bg-primary-dull transition"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Pay"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
