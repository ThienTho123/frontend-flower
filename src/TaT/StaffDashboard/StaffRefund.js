import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";
import "./StaffRefund.css";
const StaffRefund = () => {
  const [orders, setOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/staff/refund",
          {
            headers: { Authorization: `Bearer ${accesstoken}` },
          }
        );

        if (!response.ok) throw new Error("Không thể lấy danh sách hoàn tiền.");

        const data = await response.json();
        setOrders(data.refunds || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  const handleRefund = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/refund/${selectedOrderId}/complete`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      if (!response.ok) throw new Error("Hoàn tiền thất bại.");

      setToastMessage("Hoàn tiền thành công!");
      setIsSuccess(true);
      setIsToastVisible(true);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.refund.id === selectedOrderId
            ? { ...order, refund: { ...order.refund, status: "DISABLE" } }
            : order
        )
      );

      setTimeout(() => setIsToastVisible(false), 3000);
    } catch (err) {
      setToastMessage(err.message);
      setIsSuccess(false);
      setIsToastVisible(true);
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="admin-ql-container">
      <div className="title-container">
      <img
          src={returnIcon}
          alt="Quay Lại"
          className="return-button"
          onClick={() => navigate("/staff")}
        />
        <h2>Quản Lý Yêu Cầu Hoàn tiền</h2>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {isToastVisible && (
        <div
          className="toast"
          style={{
            backgroundColor: isSuccess ? "green" : "red",
            color: "white",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            textAlign: "center",
          }}
        >
          {toastMessage}
        </div>
      )}

      {orders.length === 0 ? (
        <p>Không có yêu cầu hoàn tiền nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Hoàn tiền</th>
              <th>Đơn hàng</th>
              <th>Thời gian hoàn tiền</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.refund.id}>
                <td>{order.refund.id}</td>
                <td>{order.refund.orderID?.orderID}</td>
                <td>
                  {order.refund.date
                    ? new Date(
                        order.refund.date[0],
                        order.refund.date[1] - 1,
                        order.refund.date[2],
                        order.refund.date[3],
                        order.refund.date[4],
                        order.refund.date[5]
                      ).toLocaleString()
                    : "Không có dữ liệu"}
                </td>
                <td>{order.refundMoney}</td>
                <td>{order.refund.status}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedOrderId(order.refund.id);
                      setIsModalOpen(true);
                    }}
                    disabled={order.refund.status === "DISABLE"}
                    style={{
                      backgroundColor:
                        order.refund.status === "DISABLE" ? "#ccc" : "#4CAF50",
                      cursor:
                        order.refund.status === "DISABLE" ? "not-allowed" : "pointer",
                    }}
                  >
                    {order.refund.status === "DISABLE" ? "Đã Xử Lý" : "Xử lý"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="refund-modal-overlay">
          <div className="refund-modal-content">
            <h3>Xác nhận hoàn tiền</h3>
            <p>Bạn có chắc chắn muốn hoàn tiền cho đơn hàng này không?</p>
            <div className="refund-modal-buttons">
              <button onClick={() => setIsModalOpen(false)}>Hủy</button>
              <button onClick={handleRefund} style={{ backgroundColor: "#4CAF50" }}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRefund;
