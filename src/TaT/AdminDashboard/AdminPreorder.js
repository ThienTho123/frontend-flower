import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import returnIcon from "./ImageDashboard/return-button.png"; // Adjust the path as needed
import { Link } from "react-router-dom";
import "../StaffDashboard/StaffPreorder.css"
const AdminPreorder = () => {
  const [preOrder, setPreOrders] = useState([]);
  const [editingPreOrderId, setEditingPreOrderId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [originalPreOrders, setOriginalPreOrders] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const translateCondition = (precondition) => {
    const translations = {
      Waiting: "Đang chờ",
      Ordering: "Đang đặt hàng",
      Refund: "Hoàn tiền",
      Refunding: "Đang hoàn tiền",
      Cancel: "Đã hủy",
      Success: "Thành công",
    };
    return translations[precondition] || precondition;
  };
  const orderPreconditions = [
    "Waiting",
    "Ordering",
    "Refund",
    "Refunding",
    "Cancel",
    "Success",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/preorder",
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
        const sanitizedData = data.map((order) => ({
          ...order,
          date: Array.isArray(order.date) ? order.date : null,
        }));

        setPreOrders(sanitizedData);
        setOriginalPreOrders(sanitizedData); // Lưu dữ liệu gốc
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  const handleCancelEdit = (id) => {
    // Khôi phục dữ liệu cũ từ originalPreOrders
    const restoredOrders = originalPreOrders.find((order) => order.id === id);
    setPreOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === id ? restoredOrders : order))
    );
    setEditingPreOrderId(null);
  };

  const handleSave = async (id) => {
    const orderToUpdate = preOrder.find((order) => order.id === id); // Sửa orderID thành id

    if (!orderToUpdate || orderToUpdate.id === undefined) {
      console.error("Lỗi: orderID bị undefined.");
      return;
    }

    const updatedOrder = {
      ...orderToUpdate,
      totalAmount: orderToUpdate.totalAmount || 0,
    };
    console.log("update: ", updatedOrder);
    console.log("id: ", id);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/preorder/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedOrder),
        }
      );

      if (!response.ok) throw new Error("Không thể cập nhật đơn hàng.");

      const updatedData = await response.json();
      setPreOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === id ? updatedData : order))
      );
      setEditingPreOrderId(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateClick = (id) => {
    setEditingPreOrderId(id);
  };

  const handleInputChange = (e, id, field) => {
    let value = e.target.value;

    if (field === "totalAmount") value = parseFloat(value) || 0; // Đảm bảo không bị undefined
    setPreOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              [field]: value,
            }
          : order
      )
    );
  };
  const handleCancelable = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/admin/preorder/cancelable",
        {
          method: "POST", // Hoặc `GET` nếu backend sử dụng `@GetMapping`
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái đơn hàng.");
      }

      // Sau khi cập nhật, gọi lại danh sách đơn hàng để làm mới dữ liệu
      const updatedResponse = await fetch(
        "http://localhost:8080/api/v1/admin/preorder",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!updatedResponse.ok) {
        throw new Error("Không thể lấy danh sách đơn hàng sau khi cập nhật.");
      }

      const updatedData = await updatedResponse.json();
      setPreOrders(updatedData);
      setOriginalPreOrders(updatedData);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCancelableById = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/preorder/cancelable/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái đơn hàng.");
      }

      // Cập nhật lại danh sách đơn hàng sau khi thay đổi
      const updatedResponse = await fetch(
        "http://localhost:8080/api/v1/admin/preorder",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!updatedResponse.ok) {
        throw new Error("Không thể lấy danh sách đơn hàng sau khi cập nhật.");
      }

      const updatedData = await updatedResponse.json();
      setPreOrders(updatedData);
      setOriginalPreOrders(updatedData);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCompletePreorder = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/preorder/complete/${id}`,
        {
          method: "POST", // Hoặc "PUT" nếu backend sử dụng `@PutMapping`
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể hoàn thành đơn hàng.");
      }

      // Cập nhật lại danh sách đơn hàng sau khi hoàn thành
      const updatedResponse = await fetch(
        "http://localhost:8080/api/v1/admin/preorder",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!updatedResponse.ok) {
        throw new Error("Không thể lấy danh sách đơn hàng sau khi cập nhật.");
      }

      const updatedData = await updatedResponse.json();
      setPreOrders(updatedData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/admin/preorder/total",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu để xuất Excel.");
      }

      const data = await response.json();

      const formattedData = data.map((item) => ({
        STT: item.id,
        "Tên hoa": item.flower,
        "Kích thước": item.size,
        "Mã Size Hoa": item.flowersizeid,
        "Số lượng": item.number,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PreorderList");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const dataBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(dataBlob, "PreorderList.xlsx");
    } catch (err) {
      setError(err.message);
    }
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
        <h2>Quản Lý Đơn Đơn Đặt Trước - Nhân viên</h2>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleCancelable} style={{ marginBottom: "10px" }}>
        {preOrder.some((order) => order.precondition === "Waiting")
          ? "Đặt hàng toàn bộ"
          : "Hoàn tác toàn bộ"}
      </button>
      <button onClick={handleExportExcel} className="export-btn">
        Xuất Excel
      </button>
      {preOrder.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID Đơn đặt trước</th>
                <th>Tài khoản</th>
                <th>Ngày đặt</th>
                <th>Tổng Tiền</th>
                <th>Địa Chỉ</th>
                <th>Số Điện Thoại</th>
                <th>Người Nhận</th>
                <th>Ghi Chú</th>
                <th>Quá trình</th>
                <th>Trạng Thái</th>
                <th>Mã thanh toán VNPay</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {preOrder.map((preorder) => (
                <tr key={preorder.id}>
                  <td>
                    <Link
                      to={`/AdminPreorder/${preorder.id}`}
                      style={{
                        marginLeft: "10px",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                    >
                      {preorder.id}
                    </Link>
                  </td>

                  {/* Cột Ngày */}
                  <td>{preorder.account.accountID}</td>
                  {/* Cột Thanh Toán */}
                  <td>
                    {preorder.date
                      ? new Date(
                          preorder.date[0],
                          preorder.date[1] - 1,
                          preorder.date[2],
                          preorder.date[3],
                          preorder.date[4],
                          preorder.date[5]
                        ).toLocaleString()
                      : "Không có dữ liệu"}
                  </td>
                  {/* Cột Tổng Tiền */}
                  <td>{preorder.totalAmount}</td>
                  {/* Cột Địa Chỉ */}
                  <td>
                    {editingPreOrderId === preorder.id ? (
                      <input
                        type="text"
                        value={preorder.deliveryAddress}
                        onChange={(e) =>
                          handleInputChange(e, preorder.id, "deliveryAddress")
                        }
                      />
                    ) : (
                      preorder.deliveryAddress
                    )}
                  </td>
                  {/* Cột Số Điện Thoại */}
                  <td>
                    {editingPreOrderId === preorder.id ? (
                      <input
                        type="text"
                        value={preorder.phoneNumber}
                        onChange={(e) =>
                          handleInputChange(e, preorder.id, "phoneNumber")
                        }
                      />
                    ) : (
                      preorder.phoneNumber
                    )}
                  </td>
                  {/* Cột Người Nhận */}
                  <td>
                    {editingPreOrderId === preorder.id ? (
                      <input
                        type="text"
                        value={preorder.name}
                        onChange={(e) =>
                          handleInputChange(e, preorder.id, "name")
                        }
                      />
                    ) : (
                      preorder.name
                    )}
                  </td>
                  {/* Cột Ghi Chú */}
                  <td>
                    {editingPreOrderId === preorder.id ? (
                      <textarea
                        value={preorder.note || ""}
                        onChange={(e) =>
                          handleInputChange(e, preorder.id, "note")
                        }
                      />
                    ) : (
                      preorder.note || "Không có"
                    )}
                  </td>

                  {/* Cột Điều Kiện */}
                  <td>
                    {editingPreOrderId === preorder.id ? (
                      <select
                        value={preorder.precondition}
                        onChange={(e) =>
                          handleInputChange(e, preorder.id, "precondition")
                        }
                      >
                        {orderPreconditions.map((precondition) => (
                          <option key={precondition} value={precondition}>
                            {translateCondition(precondition)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      translateCondition(preorder.precondition)
                    )}
                  </td>
                  {/* Cột Trạng Thái */}
                  <td>
                    {editingPreOrderId === preorder.id ? (
                      <select
                        value={preorder.status}
                        onChange={(e) =>
                          handleInputChange(e, preorder.id, "status")
                        }
                      >
                        <option value="ENABLE">ENABLE</option>
                        <option value="DISABLE">DISABLE</option>
                      </select>
                    ) : (
                      preorder.status
                    )}
                  </td>
                  <td>{preorder.vnp_TransactionNo}</td>
                  {/* Cột Hành Động */}
                  <td>
                    {editingPreOrderId === preorder.id ? (
                      <>
                        <button onClick={() => handleSave(preorder.id)}>
                          Lưu
                        </button>
                        <button onClick={() => handleCancelEdit(preorder.id)}>
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleUpdateClick(preorder.id)}>
                          Sửa
                        </button>
                        <button
                          className="order-button"
                          onClick={() => handleCancelableById(preorder.id)}
                          disabled={[
                            "Refund",
                            "Refunding",
                            "Cancel",
                            "Success",
                          ].includes(preorder.precondition)}
                        >
                          {preorder.precondition === "Waiting"
                            ? "Đặt hàng"
                            : "Hoàn tác"}
                        </button>
                        <button
                          className="order-button"
                          disabled={[
                            "Refund",
                            "Refunding",
                            "Cancel",
                            "Success",
                            "Waiting",
                          ].includes(preorder.precondition)}
                          onClick={() => handleCompletePreorder(preorder.id)}
                        >
                          Hoàn thành
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

export default AdminPreorder;
