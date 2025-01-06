import DynamicTable from "../components/DynamicTable";
import { useState, useEffect, useMemo } from "react";
import { getOrdersDataRestaurantId } from "../services/Order";
import statusChecker from "../utils/checkStatus.js";
import { Pencil } from "lucide-react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
  Typography,
  IconButton,
  Checkbox,
} from "@material-tailwind/react";
import { updateOrderStatus } from "../services/Order";
import OrderType from "../utils/getOrderType.js";
import io from "socket.io-client"; // Import socket.io-client

// Initialize socket connection
const socket = io(import.meta.env.VITE_BACKEND_DOMAIN_URL); // Replace with your backend URL

export default function RestaurantOrders(props) {
  let [isLoading, setIsLoading] = useState(false);
  let [orderData, setOrderData] = useState([]);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [status, setStatus] = useState(null);
  const [editDialogLoading, setEditDialogLoading] = useState(false);
  const [isAmountTaken, setIsAmountTaken] = useState(false);
  let header = useMemo(() => [
    { 
      title: "Username / Usermobile",
      value: "userName",
      render: (item) => (
        <div className="text-sm font-normal">
          <div className="font-semibold">{item.userName}</div>
          <div className="text-xs">{item.userMobile}</div>
        </div>
      ),
    },
    {
      title: "Orderid / Items",
      value: "items",
      render: (item) => (
        <div className="text-sm font-normal">
          <div className="font-semibold">{item._id}</div>
          <div className="text-xs">{item.items}</div>
        </div>
      ),
    },
    { 
      title: "CreatedByRestaurant / PaymentMode",
      value: "items",
      render: (item) => (
        <div className="text-sm font-normal"> 
          <div className="font-semibold">{item.createdByRestaurant}</div>
          <div className="text-xs">{item.paymentMode}</div>
        </div>
      ),
    },
    {
      title: "Type",
      value: "items",
      render: (item) => (
        <div className="text-sm font-normal">
          <div className="font-semibold">
            {OrderType.getOrderType(item.orderType)}
          </div>
        </div>
      ),
    },
    { title: "Amount(in ₹)", value: "amount" },
    {
      title: "Status",
      value: "status",
      render: (item) => (
        <div
          className={`text-sm font-medium truncate ${
            item.status === "Preparing"
              ? "text-preparing"
              : item.status === "Ready"
              ? "text-ready"
              : item.status === "Delivered"
              ? "text-delivered"
              : "text-gray-700"
          }`}
        >
          {statusChecker.checkStatus(item)}
        </div>
      ),
    },
    {
      title: "Action",
      value: "edit",
      render: (item) => (
        <button
          disabled={item.status === "Delivered" ? true : false}
          onClick={() => editClicked(item)}
        >
          <Pencil
            className={`h-4 ${
              item.status === "Delivered" ? "text-gray-400" : ""
            }`}
          />
        </button>
      ),
    },
  ]);

  async function updateStatus() {
    try {
      setEditDialogLoading(true);
      let res = await updateOrderStatus({
        orderId: selectedItem._id,
        status: { [status]: true },
      });
      if (res.success) {
        setEditDialog(false);
        refreshBtnClicked();
        setStatus(null);
      }
    } catch (error) {
      console.error("Error while updating orders data ----> ", error);
      throw new Error(error);
    } finally {
      setEditDialogLoading(false);
    }
  }

  function editClicked(item) {
    // console.log('edit clicked --- ',item);
    setSelectedItem(item);
    setEditDialog(!editDialog);
  }

  async function getOrdersData() {
    try {
      setIsLoading(true);
      if (props.restaurantData?._id) {
        let { data } = await getOrdersDataRestaurantId(
          props.restaurantData?._id
        );
        let sortedData = data.sort((a, b) => b?._id?.localeCompare(a?._id));
        setOrderData(sortedData);
      }
    } catch (error) {
      console.error("Error while fetching orders data ----> ", error);
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Compute the order data
  const computedOrderData = useMemo(() => {
    return orderData.map((data) => {
      return {
        _id: data?._id,
        codAmount: data?.codAmount,
        paidAmount: data?.paidAmount,
        amount: data?.amount,
        orderType: data?.orderType,
        createdByRestaurant: data?.createdByRestaurant ? "Yes" : "No",
        paymentMode: data?.paymentMode || "NA",
        items: data?.items?.map((item) => item?.name)?.join(", "),
        userName: data?.user?.name,
        userMobile: data?.user?.mobile,
        userEmail: data?.user?.email,
        isDelivered: data?.isDelivered,
        prepareUpto: data?.prepareUpto,
        status: statusChecker.checkStatus(data),
      };
    });
  }, [orderData]);

  async function refreshBtnClicked() {
    try {
      await getOrdersData();
    } catch (error) {
      console.error("Error while refreshing ----> ", error);
      throw new Error(error);
    }
  }

  function handleDialog() {
    setEditDialog(false);
    setStatus(null);
    setIsAmountTaken(false);
  }

  useEffect(() => {
    // Fetch initial orders data
    refreshBtnClicked();

    // Listen for the "orderCreatedByRestaurant" event
    socket.on("orderCreatedByRestaurant", (newOrder) => {
      console.log("New order received:", newOrder);
      setOrderData((prevData) => [newOrder.data, ...prevData]); // Add the new order to the list
    });

    // Cleanup on component unmount
    return () => {
      socket.off("orderCreatedByRestaurant");
    };
  }, [props.restaurantData?._id]);

  // useEffect(() => {
  //   refreshBtnClicked();
  // }, [props.restaurantData?._id]);

  return (
    <>
      <DynamicTable
        header={header}
        items={computedOrderData}
        refresh={() => refreshBtnClicked()}
        isLoading={isLoading}
      />

      <Dialog open={editDialog}>
        <DialogHeader className="justify-between">
          <div>
            <Typography variant="h5" color="blue-gray">
              {selectedItem.userName}({selectedItem.userMobile})
            </Typography>
            <Typography color="gray" variant="paragraph">
              {selectedItem._id}
            </Typography>
          </div>

          <IconButton
            color="blue-gray"
            size="sm"
            variant="text"
            onClick={handleDialog}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </DialogHeader>

        <DialogBody>
          <div>
            Are you sure you wants to change the status of{" "}
            <strong> {selectedItem?.userName}</strong>, who has ordered{" "}
            <strong>{selectedItem?.items}</strong> with an amount of{" "}
            <strong> ₹{selectedItem?.amount} </strong> ?
          </div>
          <div className="mt-3 flex items-center gap-6">
            <div className="w-max">
              <Select
                label="Status"
                value={status}
                onChange={(val) => setStatus(val)}
              >
                {[
                  {
                    name: "Ready",
                    value: "isReady",
                    isDisable: selectedItem.status == "Ready",
                  },
                  {
                    name: "Delivered",
                    value: "isDelivered",
                    isDisable: selectedItem.status == "Delivered",
                  },
                ].map((status) => (
                  <Option
                    value={status.value}
                    key={status.value}
                    disabled={status.isDisable}
                  >
                    {status.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          {status == "isDelivered" && (
            <div className="flex items-center">
              <Checkbox
                label={
                  <>
                    Is{" "}
                    <span className="font-bold">
                      ₹{selectedItem?.codAmount || 0}
                    </span>{" "}
                    COD Amount taken by the restaurant?
                  </>
                }
                value={isAmountTaken}
                onChange={() => setIsAmountTaken(!isAmountTaken)}
              />
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            variant="gradient"
            color="blue"
            disabled={
              !status ||
              editDialogLoading ||
              (status == "isDelivered" && !isAmountTaken)
            }
            loading={editDialogLoading}
            onClick={() => updateStatus()}
          >
            <span>Update</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
