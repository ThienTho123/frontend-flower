import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrder.css";
import { useNavigate } from "react-router-dom";

const AccountCustomize = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const translateCondition = (condition) => {
    const translations = {
      PROCESSING: "Đang xử lý",
      ACCEPT: "Đã chấp nhận",
      PAID: "Đã thanh toán",
      SUCCESS: "Đã hoàn thành",
      CANCEL: "Đã hủy",
    };
    return translations[condition] || condition;
  };

  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-j61h.onrender.com/acccus",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawCustom = response.data?.customize || [];
      console.log(rawCustom);
      if (!Array.isArray(rawCustom)) {
        console.error("Order data is not an array:", rawCustom);
        setOrderHistory([]);
        return;
      }

      const updatedOrder = rawCustom.map((item, index) => ({
        stt: index + 1,
        id: item.customID,
        description: item.description,
        total: item.totalAmount,
        date: dayjs(
          new Date(
            item.date[0],
            item.date[1] - 1,
            item.date[2],
            item.date[3],
            item.date[4],
            item.date[5]
          )
        ).format("YYYY-MM-DD HH:mm:ss"),
        condition: item.condition.replaceAll("_", " "),
      }));

      setOrderHistory(updatedOrder);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  const confirmCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirm(true);
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
            <th>Tổng</th>
            <th>Ngày đặt</th>
            <th>Trạng thái</th>
            <th>Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {orderHistory.length > 0 ? (
            orderHistory.map((order) => (
              <tr key={order.id}>
                <td>{order.stt}</td>
                <td>
                  <a
                    href={`/account/custom/${order.id}`}
                    className="history-link"
                  >
                    {order.id}
                  </a>
                </td>
                <td>{order.total}</td>
                <td>{order.date}</td>
                <td>{translateCondition(order.condition)}</td>
                <td>{order.description}</td>
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

export default AccountCustomize;
