import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; // Đảm bảo đường dẫn này chính xác

const StaffDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [selectedShipper, setSelectedShipper] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const translateCondition = (condition) => {
    const translations = {
      "Cancel is Processing": "Hủy đang xử lý",
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
    };
    return translations[condition] || condition;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:8080/staffmanager/ordernoship", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách đơn hàng.");
        }

        const data = await response.json();
        setOrders(data.orders || []);
        setShippers(data.accounts || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  // Xử lý khi bấm "Giao Hàng"
  const handleDelivery = async (orderID) => {
    const shipperID = selectedShipper[orderID];
    if (!shipperID) {
      setError("Vui lòng chọn một shipper.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/staffmanager/ordernoship/ship", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderid: orderID, accountid: shipperID }),
      });

      if (!response.ok) {
        throw new Error("Không thể giao hàng cho đơn hàng này.");
      }

      setOrders((prevOrders) => prevOrders.filter((order) => order.orderID !== orderID));
      setSuccessMessage("Đã sắp xếp giao hàng thành công!");
      setTimeout(() => setSuccessMessage(null), 3000); // Ẩn thông báo sau 3 giây
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
    navigate("/staff");
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
        <h2>Quản Lý Giao Hàng</h2>
      </div>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 ? (
        <p>Không có đơn hàng cần giao.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Đơn Hàng</th>
              <th>Ngày Đặt</th>
              <th>Trạng Thái</th>
              <th>Chọn Shipper</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderID}>
                <td>{order.orderID}</td>
                <td>{formatDate(order.date)}</td>
                <td>{translateCondition(order.condition)}</td>
                <td>
                  <select
                    className="category-select"
                    value={selectedShipper[order.orderID] || ""}
                    onChange={(e) =>
                      setSelectedShipper((prev) => ({
                        ...prev,
                        [order.orderID]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Chọn shipper</option>
                    {shippers.map((shipper) => (
                      <option key={shipper.accountID} value={shipper.accountID}>
                        {shipper.username}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="category-action-button"
                    onClick={() => handleDelivery(order.orderID)}
                  >
                    Giao Hàng
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

export default StaffDelivery;
