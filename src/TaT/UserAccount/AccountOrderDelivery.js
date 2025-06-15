import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrder.css";
import { useNavigate } from "react-router-dom";

const AccountOrderDelivery = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const translateCondition = (condition) => {
    const translations = {
      "CANCEL REQUEST IS WAITING": "Đang chờ xác nhận hủy đơn",
      CANCEL: "Đã hủy",
      "REFUND IS WAITING": "Đang chờ hoàn tiền",
      REFUND: "Hoàn tiền",
      ONGOING: "Đang tiến hành",
      SUCCESS: "Đã hoàn thành",
    };
    return translations[condition] || condition;
  };

  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-j61h.onrender.com/userorde",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawOrder = response.data?.orderDeliveryDTOS || [];
      console.log(rawOrder);
      if (!Array.isArray(rawOrder)) {
        console.error("Order data is not an array:", rawOrder);
        setOrderHistory([]);
        return;
      }

      const updatedOrder = rawOrder.map((item, index) => ({
        stt: index + 1,
        id: item.orderDeliveryID,
        start: Array.isArray(item.dateStart)
          ? dayjs(new Date(...item.dateStart)).format("YYYY-MM-DD HH:mm:ss")
          : "Chưa xác định",
        end: Array.isArray(item.dateEnd)
          ? dayjs(new Date(...item.dateEnd)).format("YYYY-MM-DD HH:mm:ss")
          : "Chưa xác định",
        total: item.total,
        orDeCondition: item.orDeCondition
          ? item.orDeCondition.replaceAll("_", " ")
          : "Đang chờ xử lý",
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

  const handleCancelOrder = async () => {
    setShowConfirm(false);
    try {
      const response = await axios.post(
        `https://deploybackend-j61h.onrender.com/userorde/${selectedOrderId}/cancel`,
        {
          // Thêm các trường trong RefundRequest nếu cần, ví dụ:
          reason: "Người dùng yêu cầu huỷ đơn",
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (response.status === 200) {
        setOrderHistory((prev) =>
          prev.map((order) =>
            order.id === selectedOrderId
              ? { ...order, condition: "CANCEL REQUEST IS WAITING" }
              : order
          )
        );
        setShowSuccessModal(true);
        getHistoryOrder();
      }
    } catch (error) {
      console.error(
        "Error cancelling order:",
        error.response?.data || error.message
      );
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
            <th>Ngày bắt đầu giao</th>
            <th>Ngày kết thúc</th>
            <th>Trạng thái</th>
            <th>Tổng</th>
            <th>Tương tác</th>
          </tr>
        </thead>
        <tbody>
          {orderHistory.length > 0 ? (
            orderHistory.map((order) => (
              <tr key={order.id}>
                <td>{order.stt}</td>
                <td>
                  <a
                    href={`/account/orde/${order.id}`}
                    className="history-link"
                  >
                    {order.id}
                  </a>
                </td>
                <td>{order.start}</td>
                <td>{order.end}</td>
                <td>{translateCondition(order.orDeCondition)}</td>
                <td>{order.total}</td>
                <td>
                  {order.orDeCondition === "REFUND" ||
                  order.orDeCondition === "REFUND IS WAITING" ? (
                    <button
                      className="cancel-btn"
                      onClick={() =>
                        navigate(`/account/orde/refund/${order.id}`)
                      }
                      disabled={order.orDeCondition === "REFUND IS WAITING"}
                    >
                      Hoàn tiền
                    </button>
                  ) : (
                    <button
                      className="cancel-btn"
                      onClick={() => confirmCancelOrder(order.id)}
                      disabled={[
                        "SUCCESS",
                        "CANCEL",
                        "CANCEL REQUEST IS WAITING",
                      ].includes(order.orDeCondition)}
                    >
                      Hủy
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">Không có đơn hàng nào.</td>
            </tr>
          )}
        </tbody>
      </table>

      {showConfirm && (
        <div className="modal">
          <div className="modal-content">
            <p>Bạn có chắc chắn muốn hủy đơn đặt giao hàng này không?</p>
            <button className="confirm-btn" onClick={handleCancelOrder}>
              Xác nhận
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowConfirm(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Đã gửi yêu cầu hủy đơn!</p>
            <button
              className="confirm-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountOrderDelivery;
