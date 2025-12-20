import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    products,
    currency,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    cartItems,
    user,
    setShowUserLogin,
    setRedirectAfterLogin,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);

  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const product = products.find((item) => item._id === key);
      if (product) {
        tempArray.push({
          ...product,
          quantity: cartItems[key],
        });
      }
    }
    setCartArray(tempArray);
  };

  useEffect(() => {
    if (products.length > 0) getCart();
  }, [products, cartItems]);

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to continue");
      setRedirectAfterLogin("/checkout");
      setShowUserLogin(true);
      return;
    }
    navigate("/checkout");
  };

  const taxAmount = (getCartAmount() * 2) / 100;
  const totalAmount = getCartAmount() + taxAmount;

  return products.length > 0 ? (
    <div className="flex flex-col md:flex-row py-16 mt-16 gap-10">
      {/* LEFT – CART ITEMS */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary">
            {getCartCount()} Items
          </span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] items-center text-sm md:text-base pt-4"
          >
            <div className="flex items-center gap-4">
              <div
                onClick={() =>
                  navigate(
                    `/products/${product.category.toLowerCase()}/${product._id}`
                  )
                }
                className="cursor-pointer w-24 h-24 border rounded flex items-center justify-center"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover h-full"
                />
              </div>

              <div>
                <p className="font-semibold">{product.name}</p>
                <div className="text-gray-500 text-sm">
                  <div className="flex items-center gap-1">
                    <span>Qty:</span>
                    <select
                      value={product.quantity}
                      onChange={(e) =>
                        updateCartItem(
                          product._id,
                          Number(e.target.value)
                        )
                      }
                      className="outline-none cursor-pointer"
                    >
                      {Array(9)
                        .fill("")
                        .map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center">
              {currency}
              {product.offerPrice * product.quantity}
            </p>

            <button
              onClick={() => removeFromCart(product._id)}
              className="mx-auto"
            >
              <img
                src={assets.remove_icon}
                alt="remove"
                className="w-6"
              />
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 mt-8 text-primary font-medium"
        >
          <img
            src={assets.arrow_right_icon_colored}
            alt="arrow"
            className="-rotate-180"
          />
          Continue Shopping
        </button>
      </div>

      {/* RIGHT – PRICE SUMMARY */}
      <div className="w-full max-w-[360px] bg-gray-100/40 p-5 border border-gray-300/70">
        <h2 className="text-xl font-medium">Order Summary</h2>
        <hr className="my-5 border-gray-300" />

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
          onClick={handleCheckout}
          className="w-full py-3 mt-6 bg-primary text-white font-medium hover:bg-primary-dull transition"
        >
          Checkout
        </button>
      </div>
    </div>
  ) : null;
};

export default Cart;
