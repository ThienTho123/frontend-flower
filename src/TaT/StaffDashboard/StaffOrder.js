import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; // Adjust the path as needed

const StaffOrder = () => {
  const [orders, setOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState(null); 
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
  const orderConditions = [
    "Pending",
    "Processing",
    "Prepare",
    "In_Transit",
    "Shipper_Delivering",
    "First_Attempt_Failed",
    "Second_Attempt_Failed",
    "Third_Attempt_Failed",
    "Cancelled",
    "Delivered_Successfully",
    "Return_to_shop",
    "Cancel_is_Processing",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/staff/order", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách đơn hàng.");
        }

        const data = await response.json();
        const sanitizedData = data.map((order) => ({
          ...order,
          date: Array.isArray(order.date) ? order.date : null,
        }));
  
        setOrders(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  const handleSoftDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/order/softdelete/${id}`,
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

  // Xử lý xóa cứng
  const handleHardDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/order/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.ok) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.orderID !== id));
      } else {
        throw new Error("Không thể xóa vĩnh viễn đơn hàng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, status, paid, condition) => {
    const orderToUpdate = orders.find((order) => order.orderID === id);
  
    // Kiểm tra các trường bắt buộc
    if (
      !orderToUpdate.totalAmount ||
      !orderToUpdate.deliveryAddress ||
      !orderToUpdate.phoneNumber ||
      !orderToUpdate.name ||
      (orderToUpdate.shipping && !orderToUpdate.shipping.shippingID) || // Nếu có shipping thì kiểm tra shippingID
      !orderToUpdate.note
    ) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
  
    // Cấu trúc dữ liệu shipping
    const updatedShipping = orderToUpdate.shipping
      ? {
          ...orderToUpdate.shipping,
          shippingID: orderToUpdate.shipping.shippingID,
        }
      : null;
  
    try {
      const response = await fetch(`http://localhost:8080/api/v1/staff/order/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...orderToUpdate,
          status,
          paid,
          condition,
          shipping: updatedShipping,
        }),
      });
  
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.orderID === id ? updatedOrder : order))
        );
        setEditingOrderId(null);
        setError(null); // Reset lỗi khi thành công
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
  const validateInput = (field, value) => {
    if (field === "totalAmount" && value < 0) {
      return "Tổng tiền không thể là số âm.";
    }
    return null; // Không có lỗi
  };
  const handleInputChange = (e, id, field) => {
    let value = e.target.value;
    if (field === "totalAmount") {
      value = parseFloat(value) || 0; // Chuyển đổi sang số
    }
    const validationError = validateInput(field, value);
    setValidationError(validationError);
    if (!validationError) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === id ? { ...order, [field]: value } : order
        )
      );
    }
    // Check if the field is "shippingID" and handle empty or 0 value
    if (field === "shippingID") {
      value = value === "" || value === "0" ? null : value; // Set to null if empty or 0
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === id
            ? { ...order, shipping: { ...order.shipping, shippingID: value } }
            : order
        )
      );
    } else if (field === "paid") {
      value = e.target.value === "Yes" ? "Yes" : "No"; // Handle "Yes" and "No" for paid field
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === id ? { ...order, [field]: value } : order
        )
      );
    } else if (field === "date") {
      try {
        const date = new Date(e.target.value);
        if (!isNaN(date)) {
          value = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
          ];
        } else {
          throw new Error("Invalid date");
        }
      } catch {
        value = null;
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === id ? { ...order, [field]: value } : order
        )
      );
    } else {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === id ? { ...order, [field]: value } : order
        )
      );
    }
  };
  
  

  const handleBackToDashboard = () => {
    navigate("/staff");
  };
  const formatDate = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 3) {
      return "Không xác định"; // Giá trị mặc định nếu `dateArray` không hợp lệ
    }
  
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
  
    // Kiểm tra tính hợp lệ của dữ liệu trước khi tạo `Date`
    if (
      typeof year !== "number" ||
      typeof month !== "number" ||
      typeof day !== "number"
    ) {
      return "Không xác định";
    }
  
    try {
      // Lưu ý: Tháng trong JavaScript bắt đầu từ 0, cần trừ 1
      const date = new Date(year, month - 1, day, hour, minute, second);
      return date.toLocaleDateString("en-GB"); // Định dạng ngày tháng
    } catch (error) {
      return "Không xác định";
    }
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
        <h2>Quản Lý Đơn Hàng - Nhân viên</h2>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID Đơn Hàng</th>
                <th>Ngày</th>
                <th>Thanh Toán</th>
                <th>Tổng Tiền</th>
                <th>Địa Chỉ</th>
                <th>Số Điện Thoại</th>
                <th>Người Nhận</th>
                <th>Shipping ID</th>
                <th>Ghi Chú</th>
                <th>Quá trình</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
            {orders.map((order) => (
              <tr key={order.orderID}>
                <td>{order.orderID}</td>

                {/* Cột Ngày */}
                <td>
                {editingOrderId === order.orderID ? (
                  <input
                    type="date"
                    value={
                      Array.isArray(order.date)
                        ? `${order.date[0]}-${String(order.date[1]).padStart(2, "0")}-${String(order.date[2]).padStart(2, "0")}`
                        : ""
                    }
                    onChange={(e) => handleInputChange(e, order.orderID, "date")}
                  />
                ) : (
                  formatDate(order.date) // Hiển thị dạng dễ đọc
                )}
              </td>

                {/* Cột Thanh Toán */}
                <td>
                {editingOrderId === order.orderID ? (
                  <select
                    value={order.paid === "Yes" ? "Yes" : "No"} // Kiểm tra và chọn Yes/No
                    onChange={(e) => handleInputChange(e, order.orderID, "paid")}
                  >
                    <option value="Yes">Có</option>
                    <option value="No">Không</option>
                  </select>
                ) : (
                  order.paid // Hiển thị Yes/No
                )}
              </td>

                {/* Cột Tổng Tiền */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <input
                      type="number"
                      value={order.totalAmount}
                      onChange={(e) => handleInputChange(e, order.orderID, "totalAmount")}
                    />
                  ) : (
                    order.totalAmount
                  )}
                </td>

                {/* Cột Địa Chỉ */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <input
                      type="text"
                      value={order.deliveryAddress}
                      onChange={(e) => handleInputChange(e, order.orderID, "deliveryAddress")}
                    />
                  ) : (
                    order.deliveryAddress
                  )}
                </td>

                {/* Cột Số Điện Thoại */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <input
                      type="text"
                      value={order.phoneNumber}
                      onChange={(e) => handleInputChange(e, order.orderID, "phoneNumber")}
                    />
                  ) : (
                    order.phoneNumber
                  )}
                </td>

                {/* Cột Người Nhận */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <input
                      type="text"
                      value={order.name}
                      onChange={(e) => handleInputChange(e, order.orderID, "name")}
                    />
                  ) : (
                    order.name
                  )}
                </td>

                {/* Cột Shipping ID */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <input
                      type="text"
                      value={order.shipping ? order.shipping.shippingID : ""}
                      onChange={(e) => handleInputChange(e, order.orderID, "shippingID")}
                    />
                  ) : (
                    order.shipping ? order.shipping.shippingID : "Chưa có"
                  )}
                </td>




                {/* Cột Ghi Chú */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <textarea
                      value={order.note || ""}
                      onChange={(e) => handleInputChange(e, order.orderID, "note")}
                    />
                  ) : (
                    order.note || "Không có"
                  )}
                </td>

                {/* Cột Điều Kiện */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <select
                      value={order.condition}
                      onChange={(e) => handleInputChange(e, order.orderID, "condition")}
                    >
                      {orderConditions.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  ) : (
                    order.condition
                  )}
                </td>

                {/* Cột Trạng Thái */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <select
                      value={order.status}
                      onChange={(e) => handleInputChange(e, order.orderID, "status")}
                    >
                      <option value="ENABLE">ENABLE</option>
                      <option value="DISABLE">DISABLE</option>
                    </select>
                  ) : (
                    order.status
                  )}
                </td>

                {/* Cột Hành Động */}
                <td>
                  {editingOrderId === order.orderID ? (
                    <button
                      onClick={() =>
                        handleSave(order.orderID, order.status, order.paid, order.condition)
                      }
                    >
                      Lưu
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleUpdateClick(order.orderID)}>
                        Chỉnh Sửa
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

export default StaffOrder;
