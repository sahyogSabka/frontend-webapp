import React, { useState, useEffect } from "react";
import OrderCard from "../components/OrderCard";
import dateFormatter from "../utils/formatDate.js";
import { NoOrderFound } from "../components/NoOrderFound.jsx"; // Ensure correct import
import Notification from "../components/Notification";
import moment from "moment";
import { getOrdersDataByUserId } from "../services/Order";
import statusChecker from "../utils/checkStatus.js";
import localStorageFunctions from "../utils/localStorageFunctions.js";
import RefreshBtn from "../components/RefreshBtn.jsx";
import { useLocation } from "react-router-dom";
import OrderType from "../utils/getOrderType.js";
import io from "socket.io-client"; // Import socket.io-client

// Initialize socket connection
const socket = io(import.meta.env.VITE_BACKEND_DOMAIN_URL); // Replace with your backend URL

export function Orders() {
  const location = useLocation();
  const [ordersData, setOrdersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Access the state from route
  const rawData = location.state;

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      let userId = localStorageFunctions.getDatafromLocalstorage("userId");
      let ordersData = await getOrdersDataByUserId(userId);
      setOrdersData(ordersData?.data || []);
    } catch (error) {
      console.error("Error --> ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh()

    // Set up socket listeners
    socket.on("orderCreated", (newOrder) => {
      setOrdersData((prevOrders) => [newOrder, ...prevOrders]);
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrdersData((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder.data._id ? updatedOrder.data : order
        )
      );
    });

    // Clean up socket listeners on component unmount
    return () => {
      socket.off("orderCreated");
      socket.off("orderUpdated");
    };
  }, []);

  async function handleRefresh() {
    try {
      await fetchUserData();
    } catch (error) {
      console.error("Error --> ", error);
    }
  }

  return (
    <div>
      {!ordersData.length ? (
        <NoOrderFound />
      ) : (
        <div className="mx-auto my-4 max-w-6xl px-2 md:my-6 md:px-0">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Order Details</h2>
            <RefreshBtn isLoading={isLoading} refresh={handleRefresh} />
          </div>
          <div className="mt-3 text-sm mb-3">
            Check the status of recent and old orders
          </div>
          {ordersData
            .sort((a, b) => b?._id?.localeCompare(a?._id))
            ?.map((order) => (
              <React.Fragment key={order?._id}>
                {order?.prepareUpto && !order?.isDelivered ? (
                  <Notification
                    msg={
                      moment(new Date()).isBefore(moment(order?.prepareUpto))
                        ? `Your order will be prepared upto ${dateFormatter.formatDate(
                            order?.prepareUpto,
                            "MMMM Do YYYY, h:mm:ss a"
                          )}`
                        : "Your order is ready please take away from restaurant."
                    }
                    notificationClass={`mt-6 ${
                      statusChecker.checkStatus(order) == "Delivered"
                        ? "bg-delivered"
                        : statusChecker.checkStatus(order) == "Ready"
                        ? "bg-ready"
                        : statusChecker.checkStatus(order) == "Preparing"
                        ? "bg-preparing"
                        : "bg-gray-700"
                    }`}
                    textClass="text-black"
                    hideCloseBtn={true}
                  />
                ) : (
                  <span></span>
                )}
                <OrderCard
                  key={order?._id}
                  items={order?.items || []}
                  orderStatus={statusChecker.checkStatus(order)}
                  rawData={{
                    orderId: order?._id,
                    amount: order?.amount,
                    paidAmount: order?.paidAmount,
                    codAmount: order?.codAmount,
                    orderType: OrderType.getOrderType(order?.orderType),
                    createdAt: dateFormatter.formatDate(
                      order?.createdAt,
                      "MMMM Do YYYY, h:mm:ss a"
                    ),
                  }}
                />
              </React.Fragment>
            ))}
        </div>
      )}
    </div>
  );
}
