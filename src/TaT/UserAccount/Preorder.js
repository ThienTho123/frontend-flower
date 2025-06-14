import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrder.css";
import { useNavigate } from "react-router-dom";

const Preorder = () => {
  const access_token = localStorage.getItem("access_token");
  const [preOrder, setPreOrder] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const translateCondition = (precondition) => {
    const translations = {
      Waiting: "Đang chờ",
      Cancel: "Đã hủy",
      Ordering: "Đang đặt hàng",
      Refund: "Hoàn tiền",
      Refunding: "Đang hoàn tiền",
      Success: "Thành công",
    };
    return translations[precondition] || precondition;
  };

  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-1ta9.onrender.com/account/preorder",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawOrder = response.data?.preorders || [];
      if (!Array.isArray(rawOrder)) {
        console.error("Order data is not an array:", rawOrder);
        setPreOrder([]);
        return;
      }
      console.log(rawOrder);
      const updatedOrder = rawOrder.map((item, index) => {
        const [year, month, day, hour, minute, second] = item.date;
        const formattedDate = dayjs(
          new Date(year, month - 1, day, hour, minute, second)
        ).format("YYYY-MM-DD HH:mm:ss");
        return {
          stt: index + 1,
          id: item.id,
          total: item.totalAmount,
          date: formattedDate,
          condition: item.precondition,
        };
      });

      setPreOrder(updatedOrder);
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
    console.log("Cancel Order ID:", selectedOrderId);

    try {
      const response = await axios.delete(
        "https://deploybackend-1ta9.onrender.com/account/preorder/cancel",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params: { id: selectedOrderId }, // Đổi OrderID -> id
        }
      );

      if (response.status === 204) {
        // Kiểm tra thành công
        console.log("Order canceled successfully.");
        setShowSuccessModal(true);
        getHistoryOrder(); // Refresh danh sách đơn hàng
      } else {
        console.warn("Unexpected response:", response);
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
            <th>Tổng</th>
            <th>Ngày đặt</th>
            <th>Trạng thái</th>
            <th>Tương tác</th>
          </tr>
        </thead>
        <tbody>
          {preOrder.length > 0 ? (
            preOrder.map((order) => (
              <tr key={order.id}>
                <td>{order.stt}</td>
                <td>
                  <a
                    href={`/account/preorder/${order.id}`}
                    className="history-link"
                  >
                    {order.id}
                  </a>
                </td>
                <td>{order.total}</td>
                <td>{order.date}</td>
                <td>{translateCondition(order.condition)}</td>
                <td>
                  {order.condition === "Refund" ||
                  order.condition === "Refunding" ? (
                    <button
                      className="cancel-btn"
                      onClick={() =>
                        navigate(`/account/preorder/refund/${order.id}`)
                      }
                      disabled={order.condition === "Refunding"}
                    >
                      Hoàn tiền
                    </button>
                  ) : (
                    <button
                      className="cancel-btn"
                      onClick={() => confirmCancelOrder(order.id)}
                      disabled={
                        order.condition === "Ordering" ||
                        order.condition === "Success" ||
                        order.condition === "Cancel"
                      }
                    >
                      Hủy
                    </button>
                  )}
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

export default Preorder;
