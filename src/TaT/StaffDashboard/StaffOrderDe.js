import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import returnIcon from "./ImageDashboard/return-button.png"; 
import "./StaffOrderDe.css";
import { Link } from "react-router-dom";

const StaffOrderDe = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [haveDeliOrders, setHaveDeliOrders] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const [cancelReqOrders, setCancelReqOrders] = useState([]);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const translateCondition = (condition) => {
    const translations = {
      ONGOING: "Đang tiến hành",
      REFUND: "Hoàn tiền",
      CANCEL_REQUEST_IS_WAITING: "Chờ xác nhận hủy",
      REFUND_IS_WAITING: "Đang xử lý hoàn tiền",
      null: "Chờ xác nhận",
    };
    return translations[condition] || condition;
  };

  // Hàm chuyển đổi tần suất giao hàng sang tiếng Việt
  const translateDeliverper = (deliverper) => {
    const translations = {
      every_day: "Mỗi ngày",
      two_day: "2 ngày một lần",
      three_day: "3 ngày một lần",
    };
    return translations[deliverper] || deliverper;
  };

  // Format datetime từ mảng [year, month, day, hour, minute, second]
  const formatDateTime = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "Không có dữ liệu";
    
    // Format theo chuẩn DD/MM/YYYY HH:MM
    return `${dateArray[2].toString().padStart(2, '0')}/${dateArray[1].toString().padStart(2, '0')}/${dateArray[0]} ${dateArray[3].toString().padStart(2, '0')}:${dateArray[4].toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/staff/orde",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách đơn hàng theo lịch.");
        }

        const data = await response.json();
        setAllOrders(data.AllOrDe || []);
        setHaveDeliOrders(data.HaveDeli || []);
        setNewOrders(data.NewOrDe || []);
        setCancelReqOrders(data.CancelReq || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  // Chức năng đồng ý đơn hàng mới (done)
  const handleAcceptNewOrder = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/orde/${id}/acceptNew`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xác nhận đơn hàng.");
      }

      const updatedNewOrders = newOrders.filter(order => order.id !== id);
      setNewOrders(updatedNewOrders);

      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng từ chối đơn hàng mới (done)
  const handleDeclineNewOrder = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/orde/${id}/declineNew`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể từ chối đơn hàng.");
      }

      const updatedNewOrders = newOrders.filter(order => order.id !== id);
      setNewOrders(updatedNewOrders);

      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng đồng ý yêu cầu hủy
  const handleAcceptCancelRequest = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/orde/${id}/acceptCancelRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xác nhận yêu cầu hủy đơn hàng.");
      }

      // Cập nhật lại danh sách đơn hàng
      const updatedCancelReqOrders = cancelReqOrders.filter(order => order.id !== id);
      setCancelReqOrders(updatedCancelReqOrders);

      // Tải lại tất cả danh sách
      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng từ chối yêu cầu hủy
  const handleDeclineCancelRequest = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/orde/${id}/declineCancelRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể từ chối yêu cầu hủy đơn hàng.");
      }

      // Cập nhật lại danh sách đơn hàng
      const updatedCancelReqOrders = cancelReqOrders.filter(order => order.id !== id);
      setCancelReqOrders(updatedCancelReqOrders);

      // Tải lại tất cả danh sách
      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng giao hàng ngay
  const handleDeliverNow = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/orde/${id}/deli`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể giao hàng ngay bây giờ.");
      }

      // Tải lại tất cả danh sách
      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Làm mới danh sách đơn hàng
  const refreshOrderLists = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/staff/orde",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể làm mới danh sách đơn hàng.");
      }

      const data = await response.json();
      setAllOrders(data.AllOrDe || []);
      setHaveDeliOrders(data.HaveDeli || []);
      setNewOrders(data.NewOrDe || []);
      setCancelReqOrders(data.CancelReq || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Xuất Excel
  const handleExportExcel = () => {
    const formattedData = allOrders.map((order, index) => ({
      STT: index + 1,
      ID: order.id,
      "Tên người nhận": order.name || "Không có",
      "Địa chỉ": order.address || "Không có",
      "Số điện thoại": order.phoneNumber || "Không có",
      "Trạng thái": translateCondition(order.condition),
      "Tổng tiền": order.total || 0,
      "Loại giao hàng": order.orderDeliveryType?.type || "Không có",
      "Khoảng cách giao": translateDeliverper(order.deliverper) || "Không có",
      "Ngày bắt đầu": order.start ? formatDateTime(order.start) : "Không có",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OrderDeList");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, "OrderDeliveryList.xlsx");
  };

  // Quay lại dashboard
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
        <h2>Quản Lý Đơn Đặt Hàng Theo Lịch - Nhân viên</h2>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleExportExcel} className="export-btn">
        Xuất Excel
      </button>

      {/* Danh sách đơn hàng mới chờ xác nhận */}
      <div className="order-section">
        <h3>Đơn Hàng Mới Chờ Xác Nhận</h3>
        {newOrders.length === 0 ? (
          <p>Không có đơn hàng mới nào.</p>
        ) : (
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên người nhận</th>
                <th>Số điện thoại</th>
                <th>Loại giao</th>
                <th>Khoảng cách</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {newOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      to={`/StaffOrderDe/${order.id}`}
                      className="order-link"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td>{order.name || "Không có"}</td>
                  <td>{order.phoneNumber || "Không có"}</td>
                  <td>{order.orderDeliveryType?.type || "Không có"}</td>
                  <td>{translateDeliverper(order.deliverper) || "Không có"}</td>
                  <td>{order.total ? order.total.toLocaleString() + " VND" : "0 VND"}</td>
                  <td>{translateCondition(order.condition)}</td>
                  <td>
                    <button
                      className="accept-button"
                      onClick={() => handleAcceptNewOrder(order.id)}
                    >
                      Đồng ý
                    </button>
                    <button
                      className="decline-button"
                      onClick={() => handleDeclineNewOrder(order.id)}
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Danh sách đơn hàng cần giao hôm nay */}
      <div className="order-section">
        <h3>Đơn Hàng Cần Giao Hôm Nay</h3>
        {haveDeliOrders.length === 0 ? (
          <p>Không có đơn hàng nào cần giao hôm nay.</p>
        ) : (
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên người nhận</th>
                <th>Số điện thoại</th>
                <th>Loại giao</th>
                <th>Khoảng cách</th>
                <th>Ngày bắt đầu</th>
                <th>Tổng tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {haveDeliOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      to={`/StaffOrderDe/${order.id}`}
                      className="order-link"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td>{order.name || "Không có"}</td>
                  <td>{order.phoneNumber || "Không có"}</td>
                  <td>{order.orderDeliveryType?.type || "Không có"}</td>
                  <td>{translateDeliverper(order.deliverper) || "Không có"}</td>
                  <td>{order.start ? formatDateTime(order.start) : "Không có"}</td>
                  <td>{order.total ? order.total.toLocaleString() + " VND" : "0 VND"}</td>
                  <td>
                    <button
                      className="deliver-button"
                      onClick={() => handleDeliverNow(order.id)}
                    >
                      Giao ngay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Danh sách yêu cầu hủy đơn */}
      <div className="order-section">
        <h3>Yêu Cầu Hủy Đơn</h3>
        {cancelReqOrders.length === 0 ? (
          <p>Không có yêu cầu hủy đơn nào.</p>
        ) : (
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên người nhận</th>
                <th>Số điện thoại</th>
                <th>Loại giao</th>
                <th>Khoảng cách</th>
                <th>Ngày bắt đầu</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {cancelReqOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      to={`/StaffOrderDe/${order.id}`}
                      className="order-link"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td>{order.name || "Không có"}</td>
                  <td>{order.phoneNumber || "Không có"}</td>
                  <td>{order.orderDeliveryType?.type || "Không có"}</td>
                  <td>{translateDeliverper(order.deliverper) || "Không có"}</td>
                  <td>{order.start ? formatDateTime(order.start) : "Không có"}</td>
                  <td>{order.total ? order.total.toLocaleString() + " VND" : "0 VND"}</td>
                  <td>{translateCondition(order.condition)}</td>
                  <td>
                    <button
                      className="accept-button"
                      onClick={() => handleAcceptCancelRequest(order.id)}
                    >
                      Đồng ý hủy
                    </button>
                    <button
                      className="decline-button"
                      onClick={() => handleDeclineCancelRequest(order.id)}
                    >
                      Từ chối hủy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default StaffOrderDe;