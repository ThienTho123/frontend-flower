import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrder.css";
import { useNavigate } from "react-router-dom";

const HistoryOrder = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const translateCondition = (condition) => {
    const translations = {
      "Cancel is Processing": "Đang chờ xác nhận",
      "Cancelled": "Đã hủy",
      "In Transit": "Đang vận chuyển",
      "Shipper Delivering": "Shipper đang giao hàng",
      "First Attempt Failed": "Lần giao hàng đầu tiên thất bại",
      "Second Attempt Failed": "Lần giao hàng thứ hai thất bại",
      "Third Attempt Failed": "Lần giao hàng thứ ba thất bại",
      "Delivered Successfully": "Giao hàng thành công",
      "Return to shop": "Trả về cửa hàng",
      "Pending": "Đang chờ xử lý",
      "Processing": "Đang xử lý",
      "Prepare": "Chuẩn bị",
      "Refund": "Gửi yêu cầu hoàn tiền",
      "Refund is Processing": "Đang chờ hoàn tiền"
    };
    return translations[condition] || condition;
  };

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

      const rawOrder = response.data?.orderHistory || [];
      console.log(rawOrder);
      if (!Array.isArray(rawOrder)) {
        console.error("Order data is not an array:", rawOrder);
        setOrderHistory([]);
        return;
      }

      const updatedOrder = rawOrder.map((item, index) => ({
        stt: index + 1,
        id: item.orderID,
        isPaid: item.isPaid,
        total: item.total,
        date: dayjs(item.date).format("YYYY-MM-DD HH:mm:ss"),
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

  const handleCancelOrder = async () => {
    setShowConfirm(false);
    try {
      const response = await axios.delete(
        "http://localhost:8080/account/cancel",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params: {
            orderID: selectedOrderId,
          },
        }
      );

      if (response.status === 204) {
        setOrderHistory((prev) =>
          prev.map((order) =>
            order.id === selectedOrderId
              ? { ...order, condition: "Cancel is Processing" }
              : order
          )
        );
        setShowSuccessModal(true);
        getHistoryOrder();
      }
    } catch (error) {
      console.error("Error cancelling order:", error.message);
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
            <th>Tổng</th>
            <th>Ngày đặt</th>
            <th>Trạng thái</th>
            <th>Tương tác</th>
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
                <td>{translateCondition(order.condition)}</td>
                <td>
                   {order.condition === "Refund" || order.condition ==="Refund is Processing" ? (
                    <button
                      className="cancel-btn"
                      onClick={() => navigate (`/account/order/refund/${order.id}`)}
                      disabled={order.condition ==="Refund is Processing"}
                    >
                      Hoàn tiền
                    </button>
                  ) : (
                    <button
                    className="cancel-btn"
                    onClick={() => confirmCancelOrder(order.id)}
                    disabled={
                      [
                        "Cancel is Processing",
                        "Cancelled",
                        "In Transit",
                        "Shipper Delivering",
                        "First Attempt Failed",
                        "Second Attempt Failed",
                        "Third Attempt Failed",
                        "Delivered Successfully",
                        "Return to shop",
                      ].includes(order.condition)
                    }
                  >
                    Hủy
                  </button>)}
                    
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

      {showConfirm && (
        <div className="modal">
          <div className="modal-content">
            <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
            <button className="confirm-btn" onClick={handleCancelOrder}>
              Xác nhận
            </button>
            <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Đã gửi yêu cầu hủy đơn hàng!</p>
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

export default HistoryOrder;
