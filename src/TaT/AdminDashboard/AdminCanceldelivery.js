import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png"; // Điều chỉnh đường dẫn nếu cần

const AdminCancelDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const translations = {
    "Cancel is Processing": "Hủy đang xử lý",
    Cancel_is_Processing: "Hủy đang xử lý",
    Cancelled: "Đã hủy",
    "In Transit": "Đang vận chuyển",
    "Shipper Delivering": "Shipper đang giao hàng",
    "First Attempt Failed": "Lần giao hàng đầu tiên thất bại",
    "Second Attempt Failed": "Lần giao hàng thứ hai thất bại",
    "Third Attempt Failed": "Lần giao hàng thứ ba thất bại",
    "Delivered Successfully": "Giao hàng thành công",
    "Return to shop": "Trả về cửa hàng",
    "Order Placed": "Đặt hàng thành công",
    "Payment Pending": "Chờ thanh toán",
    Pending: "Đang chờ xử lý",
    Processing: "Đang xử lý",
    Prepare: "Chuẩn bị",
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "https://deploybackend-1ta9.onrender.com/adminmanager/cancelprocessing",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách đơn hàng.");
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  const handleAction = async (orderID, isAccepted) => {
    const apiEndpoint = isAccepted
      ? "https://deploybackend-1ta9.onrender.com/adminmanager/cancelprocessing/yes"
      : "https://deploybackend-1ta9.onrender.com/adminmanager/cancelprocessing/no";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderID }),
      });

      if (!response.ok) {
        throw new Error(
          isAccepted
            ? "Không thể chấp nhận hủy đơn hàng."
            : "Không thể từ chối hủy đơn hàng."
        );
      }

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.orderID !== orderID)
      );
      setToastMessage(
        isAccepted ? "Đã chấp nhận hủy đơn hàng!" : "Đã từ chối hủy đơn hàng!"
      );
      setIsSuccess(isAccepted);
      setIsToastVisible(true);
      setTimeout(() => setIsToastVisible(false), 3000); // Ẩn thông báo sau 3 giây
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateArray) => {
    if (!Array.isArray(dateArray)) return "Không xác định";
    const [year, month, day, hour, minute, second] = dateArray;
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="admin-ql-container">
      <div className="title-container">
        <img
          src={returnIcon}
          alt="Quay Lại"
          className="return-button"
          onClick={handleBackToDashboard}
        />
        <h2>Quản Lý Yêu Cầu Hủy Đơn</h2>
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
        <p>Không có yêu cầu hủy đơn hàng nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Đơn Hàng</th>
              <th>Ngày Đặt</th>
              <th>Trạng Thái Trước Đó</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderID}>
                <td>{order.orderID}</td>
                <td>{formatDate(order.date)}</td>
                <td>
                  {translations[order.condition] || "Trạng thái không xác định"}
                </td>
                <td>
                  <button
                    className="category-action-button"
                    onClick={() => handleAction(order.orderID, true)}
                  >
                    Yes
                  </button>
                  <button
                    className="category-action-button"
                    onClick={() => handleAction(order.orderID, false)}
                  >
                    No
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCancelDelivery;
