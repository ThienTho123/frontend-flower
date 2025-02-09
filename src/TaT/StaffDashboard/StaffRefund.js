import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";

const StaffRefund = () => {
  const [orders, setOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [bankList, setBankList] = useState([]);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBankList = async () => {
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks");
        const data = await response.json();
        setBankList(data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ngân hàng:", error);
        setBankList([]);
      }
    };
    fetchBankList();
  }, []);

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

  const handleRefund = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/refund/${id}/complete`,
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
          order.id === id ? { ...order, status: "DISABLE" } : order
        )
      );

      setTimeout(() => setIsToastVisible(false), 3000);
    } catch (err) {
      setToastMessage(err.message);
      setIsSuccess(false);
      setIsToastVisible(true);
    }
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/refund/${editingOrder.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify({
            number: editingOrder.number,
            bank: editingOrder.bank,
            status: editingOrder.status,
          }),
        }
      );

      if (!response.ok) throw new Error("Cập nhật hoàn tiền thất bại.");

      setToastMessage("Cập nhật thành công!");
      setIsSuccess(true);
      setIsToastVisible(true);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === editingOrder.id ? editingOrder : order
        )
      );

      setEditingOrder(null);
      setTimeout(() => setIsToastVisible(false), 3000);
    } catch (err) {
      setToastMessage(err.message);
      setIsSuccess(false);
      setIsToastVisible(true);
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
              <th>Đơn đặt trước</th>
              <th>Thời gian hoàn tiền</th>
              <th>Mã ngân hàng</th>
              <th>Số tài khoản</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.orderID?.orderID}</td>
                <td>{order.preorderID?.id}</td>
                <td>
                  {order.date
                    ? new Date(
                        order.date[0],
                        order.date[1] - 1,
                        order.date[2],
                        order.date[3],
                        order.date[4],
                        order.date[5]
                      ).toLocaleString()
                    : "Không có dữ liệu"}
                </td>
                <td>{order.bank}</td>
                <td>{order.number}</td>
                <td>{order.status}</td>
                <td>
                  <button
                    onClick={() => handleRefund(order.id)}
                    disabled={order.status === "DISABLE"}
                    style={{
                      backgroundColor:
                        order.status === "DISABLE" ? "#ccc" : "#4CAF50",
                      cursor:
                        order.status === "DISABLE" ? "not-allowed" : "pointer",
                    }}
                  >
                    {order.status === "DISABLE" ? "Đã Xử Lý" : "Xử lý"}
                  </button>
                  <button
                    onClick={() => handleEditClick(order)}
                    style={{ marginLeft: "10px", backgroundColor: "#f39c12" }}
                  >
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingOrder && (
        <div className="edit-modal">
          <h3>Chỉnh Sửa Hoàn Tiền</h3>
          <label>Số tài khoản:</label>
          <input
            type="text"
            value={editingOrder.number}
            onChange={(e) =>
              setEditingOrder({ ...editingOrder, number: e.target.value })
            }
          />
          <label>Ngân hàng:</label>
          <select
            value={editingOrder.bank}
            onChange={(e) =>
              setEditingOrder({ ...editingOrder, bank: e.target.value })
            }
          >
            {bankList.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
          <label>Trạng thái:</label>
          <select
            value={editingOrder.status}
            onChange={(e) =>
              setEditingOrder({ ...editingOrder, status: e.target.value })
            }
          >
            <option value="ENABLE">ENABLE</option>
            <option value="DISABLE">DISABLE</option>
          </select>
          <button onClick={handleSaveEdit}>Lưu</button>
          <button onClick={() => setEditingOrder(null)}>Hủy</button>
        </div>
      )}
    </div>
  );
};

export default StaffRefund;
