import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrder.css";
const HistoryOrder = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);

  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/account/orderHistory",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      console.log("Full Response Data:", response.data);

      const rawOrder = response.data?.orderHistory || [];
      console.log("Raw Order Data:", rawOrder);

      if (!Array.isArray(rawOrder)) {
        console.error("Order data is not an array:", rawOrder);
        setOrderHistory([]);
        return;
      }

      const updatedOrder = rawOrder.map((item, index) => ({
        stt: index + 1,
        id: item.orderID,
        total: item.total,
        date: dayjs(item.date).format("YYYY-MM-DD HH:mm:ss"),
        condition: item.condition.replaceAll("_", " "),
      }));

      setOrderHistory(updatedOrder);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.delete(
        "http://localhost:8080/account/cancel",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params: {
            OrderID: orderId,
          },
        }
      );

      if (response.status === 204) {
        console.log("Order cancelled successfully!");
        // Cập nhật lại danh sách sau khi hủy đơn
        setOrderHistory((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, condition: "Cancel_is_Processing" }
              : order
          )
        );
        getHistoryOrder();
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Order not found!");
      } else {
        console.error("Error cancelling order:", error.message);
      }
    }
  };

  useEffect(() => {
    getHistoryOrder();
  }, []);

  return (
<div className="table-container">
  <h2 className="history-title">Lịch sử đơn hàng</h2>
  <table className="history-table">
    <thead>
      <tr>
        <th>STT</th>
        <th>ID</th>
        <th>Total</th>
        <th>Date</th>
        <th>Condition</th>
        <th>Hủy</th>
      </tr>
    </thead>
    <tbody>
      {orderHistory.length > 0 ? (
        orderHistory.map((order) => (
          <tr key={order.id}>
            <td>{order.stt}</td>
            <td>
              <a href={`/account/history/${order.id}`} className="history-link">
                {order.id}
              </a>
            </td>
            <td>{order.total}</td>
            <td>{order.date}</td>
            <td>{order.condition}</td>
            <td>
              <button
                className="cancel-btn"
                onClick={() => handleCancelOrder(order.id)}
                disabled={
                  order.condition === "Cancel is Processing" ||
                  order.condition === "Cancel_is_Processing" ||
                  order.condition === "Cancelled" ||
                  order.condition === "In Transit" ||
                  order.condition === "Shipper Delivering" ||
                  order.condition === "First Attempt Failed" ||
                  order.condition === "Second Attempt Failed" ||
                  order.condition === "Third Attempt Failed" ||
                  order.condition === "Delivered Successfully" ||
                  order.condition === "Return to shop"
                }
              >
                Hủy
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6">Không có đơn hàng nào.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

  );
};

export default HistoryOrder;
