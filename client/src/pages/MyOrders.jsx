import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  //   const fetchMyOrders = async () => {
  //     try {
  //       const { data } = await axios.get("/api/order/user");
  //       if (data.success) {
  //         console.log("Orders from API:", data.orders);
  //         setMyOrders(data.orders);
  //       }
  //     } catch (error) {
  //       console.log("Error fetching orders:", error);
  //     }
  //   };

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");

      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  return (
    <div className="mt-16 pb-16">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full" />
      </div>

      {myOrders.length === 0 && (
        <p className="text-gray-500 text-sm">You don&apos;t have any orders yet.</p>
      )}

      {myOrders.map((order, index) => (
        <div
          key={order._id || index}
          className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl"
        >
          <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col">
            <span>Order Id: {order._id}</span>
            <span>Payment: {order.payment.method}</span>
            <span>Total Amount: {currency}{order.pricing.total}</span>

          </p>

          {order.items?.map((item, idx) => {
            const product = item.product || {};
            const imageSrc =
              product.images?.[0] ||
              product.image?.[0] ||
              "https://via.placeholder.com/64";

            return (
              <div
                key={idx}
                className={`relative bg-white text-gray-500/70 ${order.items.length !== idx + 1 && "border-b"
                  } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}
              >
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <img src={imageSrc} alt="" className="w-16 h-16 object-cover" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-medium text-gray-800">
                      {product.name || "Product"}
                    </h2>
                    <p>Category: {product.category || "N/A"}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0 gap-1">
                  <p>
                    Delivery Status:{" "}
                    <span className="font-medium capitalize">
                      {order.delivery?.status.replaceAll("_", " ") || "pending"}
                    </span>
                  </p>

                  <p>
                    Payment Status:{" "}
                    <span className="font-medium">
                      {order.payment?.status || "pending"}
                    </span>
                  </p>

                  {order.courier?.name && (
                    <p>
                      Courier:{" "}
                      <span className="font-medium">{order.courier.name}</span>
                    </p>
                  )}

                  {order.delivery?.trackingId && (
                    <p>
                      Tracking ID:{" "}
                      <span className="font-medium">
                        {order.delivery.trackingId}
                      </span>
                    </p>
                  )}

                  <p>
                    Order Date:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>


                <p className="text-primary text-lg font-medium">
                  Amount: {currency}
                  {(product.offerPrice || 0) * (item.quantity || 1)}
                </p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
