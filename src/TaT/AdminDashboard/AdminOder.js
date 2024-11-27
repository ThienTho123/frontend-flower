import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; // Adjust the path as needed

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/order", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách đơn hàng.");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/order/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderID === id ? { ...order, status: "DISABLE" } : order
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa đơn hàng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, status, paid) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/order/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, paid }),
        }
      );

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map((order) => (order.orderID === id ? updatedOrder : order)));
        setEditingOrderId(null);
      } else {
        throw new Error("Không thể cập nhật đơn hàng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateClick = (orderId) => {
    setEditingOrderId(orderId);
  };

  const handleInputChange = (e, id, field) => {
    const value = field === "paid" ? e.target.value === "1" : e.target.value;
    setOrders(
      orders.map((order) =>
        order.orderID === id ? { ...order, [field]: value } : order
      )
    );
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
        <h2>Quản Lý Đơn Hàng</h2>
      </div>
      {error && <p>{error}</p>}
      {orders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID Đơn Hàng</th>
                <th>Ngày</th>
                <th>Đã Thanh Toán</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderID}>
                  <td>{order.orderID}</td>
                  <td>{new Date(order.date).toLocaleDateString("en-GB")}</td>
                  <td>
                    {editingOrderId === order.orderID ? (
                      <select
                        value={order.paid ? "1" : "0"}
                        onChange={(e) => handleInputChange(e, order.orderID, "paid")}
                      >
                        <option value="1">Có</option>
                        <option value="0">Không</option>
                      </select>
                    ) : (
                      order.paid ? "Có" : "Không"
                    )}
                  </td>
                  <td>
                    {editingOrderId === order.orderID ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleInputChange(e, order.orderID, "status")}
                      >
                        <option value="ENABLE">Enable</option>
                        <option value="DISABLE">Disable</option>
                      </select>
                    ) : (
                      order.status
                    )}
                  </td>
                  <td>
                    {editingOrderId === order.orderID ? (
                      <button onClick={() => handleSave(order.orderID, order.status, order.paid)}>
                        Lưu
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleUpdateClick(order.orderID)}>
                          Chỉnh Sửa
                        </button>
                        <button onClick={() => handleDelete(order.orderID)}>
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AdminOrder;
