import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import returnIcon from "./ImageDashboard/return-button.png";
import "./AdminOrderDe.css"; // Đảm bảo tạo file CSS tương ứng
import { Link } from "react-router-dom";

const AdminOrderDe = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [haveDeliOrders, setHaveDeliOrders] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const [cancelReqOrders, setCancelReqOrders] = useState([]);
  const [conditionNames, setConditionNames] = useState([]);
  const [dayPer, setDayPer] = useState([]);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalOrderId, setModalOrderId] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  // Tab state để chuyển đổi giữa các danh sách
  const [activeTab, setActiveTab] = useState("all"); // "all", "new", "deliver", "cancel"

  // Edit states
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    note: "",
    start: "",
    deliverper: "",
    condition: "",
  });

  const translateCondition = (condition) => {
    const translations = {
      ONGOING: "Đang tiến hành",
      REFUND: "Hoàn tiền",
      CANCEL_REQUEST_IS_WAITING: "Chờ xác nhận hủy",
      REFUND_IS_WAITING: "Đang xử lý hoàn tiền",
      null: "Chờ xác nhận",
      CANCEL: "Hủy",
      SUCCESS: "Thành Công",
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

  // Translate condition names for dropdown
  const translateConditionName = (conditionName) => {
    const translations = {
      ONGOING: "Đang tiến hành",
      REFUND: "Hoàn tiền",
      CANCEL_REQUEST_IS_WAITING: "Chờ xác nhận hủy",
      REFUND_IS_WAITING: "Đang xử lý hoàn tiền",
      CANCEL: "Hủy",
      SUCCESS: "Thành Công",
    };
    return translations[conditionName] || conditionName;
  };

  // Translate deliverper for dropdown
  const translateDeliverperName = (deliverperName) => {
    const translations = {
      every_day: "Mỗi ngày",
      two_day: "2 ngày một lần",
      three_day: "3 ngày một lần",
    };
    return translations[deliverperName] || deliverperName;
  };

  // Format riêng phần ngày từ mảng [year, month, day, hour, minute, second]
  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "Không có dữ liệu";

    // Format theo chuẩn DD/MM/YYYY
    return `${dateArray[2].toString().padStart(2, "0")}/${dateArray[1]
      .toString()
      .padStart(2, "0")}/${dateArray[0]}`;
  };

  // Format riêng phần giờ từ mảng [year, month, day, hour, minute, second]
  const formatTime = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "Không có dữ liệu";

    // Format theo chuẩn HH:MM
    return `${dateArray[3].toString().padStart(2, "0")}:${dateArray[4]
      .toString()
      .padStart(2, "0")}`;
  };

  // Format datetime đầy đủ từ mảng [year, month, day, hour, minute, second]
  const formatDateTime = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "Không có dữ liệu";

    // Format theo chuẩn DD/MM/YYYY HH:MM
    return `${dateArray[2].toString().padStart(2, "0")}/${dateArray[1]
      .toString()
      .padStart(2, "0")}/${dateArray[0]} ${dateArray[3]
      .toString()
      .padStart(2, "0")}:${dateArray[4].toString().padStart(2, "0")}`;
  };

  // Convert date array to ISO string for input
  const formatDateForInput = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "";

    const year = dateArray[0];
    const month = dateArray[1].toString().padStart(2, "0");
    const day = dateArray[2].toString().padStart(2, "0");
    const hour = dateArray[3].toString().padStart(2, "0");
    const minute = dateArray[4].toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "https://deploybackend-j61h.onrender.com/api/v1/admin/orde",
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
        setConditionNames(data.conditionNames || []);
        setDayPer(data.dayPer || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  // Start editing an order
  const handleEditOrder = (order) => {
    setEditingOrder(order.id);
    setEditForm({
      name: order.name || "",
      phoneNumber: order.phoneNumber || "",
      address: order.address || "",
      note: order.note || "",
      start: formatDateForInput(order.start),
      deliverper: order.deliverper || "",
      condition: order.condition || "",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditForm({
      name: "",
      phoneNumber: "",
      address: "",
      note: "",
      start: "",
      deliverper: "",
      condition: "",
    });
  };

  // Save edited order
  const handleSaveEdit = async (orderId) => {
    try {
      // Convert datetime-local input back to array format for backend
      const startDateTime = new Date(editForm.start);
      const startArray = [
        startDateTime.getFullYear(),
        startDateTime.getMonth() + 1,
        startDateTime.getDate(),
        startDateTime.getHours(),
        startDateTime.getMinutes(),
        startDateTime.getSeconds(),
      ];

      const updateData = {
        name: editForm.name,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        note: editForm.note,
        start: startArray,
        deliverper: editForm.deliverper,
        condition: editForm.condition,
      };

      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/orde/${orderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật đơn hàng.");
      }

      // Refresh order lists
      refreshOrderLists();
      handleCancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Chức năng đồng ý đơn hàng mới
  const handleAcceptNewOrder = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/orde/${id}/acceptNew`,
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

      // Tải lại danh sách đơn hàng
      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng từ chối đơn hàng mới
  const handleDeclineNewOrder = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/orde/${id}/declineNew`,
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

      // Tải lại danh sách đơn hàng
      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng đồng ý yêu cầu hủy
  const handleAcceptCancelRequest = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/orde/${id}/acceptCancelRequest`,
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

      // Tải lại danh sách đơn hàng
      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng từ chối yêu cầu hủy
  const handleDeclineCancelRequest = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/orde/${id}/declineCancelRequest`,
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

      // Tải lại danh sách đơn hàng
      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng giao hàng ngay
  const handleDeliverNow = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/orde/${id}/deli`,
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

      // Tải lại danh sách đơn hàng
      refreshOrderLists();
    } catch (err) {
      setError(err.message);
    }
  };

  // Làm mới danh sách đơn hàng
  const refreshOrderLists = async () => {
    try {
      const response = await fetch(
        "https://deploybackend-j61h.onrender.com/api/v1/admin/orde",
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
      setConditionNames(data.conditionNames || []);
      setDayPer(data.dayPer || []);
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
      "Ghi chú": order.note || "Không có",
      "Trạng thái": translateCondition(order.condition),
      "Tổng tiền": order.total || 0,
      "Loại giao hàng": order.orderDeliveryType?.type || "Không có",
      "Khoảng cách giao": translateDeliverper(order.deliverper) || "Không có",
      "Ngày bắt đầu": order.start ? formatDate(order.start) : "Không có",
      "Thời gian giao": order.start ? formatTime(order.start) : "Không có",
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
    navigate("/dashboard");
  };

  // Hiển thị modal xác nhận
  const showConfirmationModal = (action, orderId) => {
    let title = "";
    let message = "";

    switch (action) {
      case "acceptNew":
        title = "Xác nhận đồng ý đơn hàng";
        message = `Bạn có chắc chắn muốn đồng ý đơn hàng #${orderId} không?`;
        break;
      case "declineNew":
        title = "Xác nhận từ chối đơn hàng";
        message = `Bạn có chắc chắn muốn từ chối đơn hàng #${orderId} không?`;
        break;
      case "acceptCancel":
        title = "Xác nhận đồng ý hủy đơn hàng";
        message = `Bạn có chắc chắn muốn đồng ý hủy đơn hàng #${orderId} không?`;
        break;
      case "declineCancel":
        title = "Xác nhận từ chối hủy đơn hàng";
        message = `Bạn có chắc chắn muốn từ chối yêu cầu hủy đơn hàng #${orderId} không?`;
        break;
      case "deliver":
        title = "Xác nhận giao hàng";
        message = `Bạn có chắc chắn muốn giao đơn hàng #${orderId} ngay bây giờ không?`;
        break;
      default:
        break;
    }
    setModalAction(action);
    setModalOrderId(orderId);
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  // Thực hiện hành động từ modal
  const executeAction = () => {
    switch (modalAction) {
      case "acceptNew":
        handleAcceptNewOrder(modalOrderId);
        break;
      case "declineNew":
        handleDeclineNewOrder(modalOrderId);
        break;
      case "acceptCancel":
        handleAcceptCancelRequest(modalOrderId);
        break;
      case "declineCancel":
        handleDeclineCancelRequest(modalOrderId);
        break;
      case "deliver":
        handleDeliverNow(modalOrderId);
        break;
      default:
        break;
    }
  };

  // Render table row (normal or edit mode)
  const renderTableRow = (order) => {
    const isEditing = editingOrder === order.id;

    if (isEditing) {
      return (
        <tr key={order.id} className="editing-row">
          <td>
            <Link to={`/AdminOrderDe/${order.id}`} className="order-link">
              {order.id}
            </Link>
          </td>
          <td>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="edit-input"
            />
          </td>
          <td>
            <input
              type="text"
              value={editForm.phoneNumber}
              onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
              className="edit-input"
            />
          </td>
          <td>
            <textarea
              value={editForm.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
              className="edit-textarea"
              rows="2"
            />
          </td>
          <td>
            <textarea
              value={editForm.note}
              onChange={(e) => handleFormChange("note", e.target.value)}
              className="edit-textarea"
              rows="2"
            />
          </td>
          <td>{order.orderDeliveryType?.type || "Không có"}</td>
          <td>
            <select
              value={editForm.deliverper}
              onChange={(e) => handleFormChange("deliverper", e.target.value)}
              className="edit-select"
            >
              {dayPer.map((dp) => (
                <option key={dp} value={dp}>
                  {translateDeliverperName(dp)}
                </option>
              ))}
            </select>
          </td>
          <td>
            <input
              type="datetime-local"
              value={editForm.start}
              onChange={(e) => handleFormChange("start", e.target.value)}
              className="edit-input"
            />
          </td>
          <td>
            {order.total ? order.total.toLocaleString() + " VND" : "0 VND"}
          </td>
          <td>
            <select
              value={editForm.condition}
              onChange={(e) => handleFormChange("condition", e.target.value)}
              className="edit-select"
            >
              <option value="">Chờ xác nhận</option>
              {conditionNames.map((condition) => (
                <option key={condition} value={condition}>
                  {translateConditionName(condition)}
                </option>
              ))}
            </select>
          </td>
          <td>
            <div className="edit-actions">
              <button
                onClick={() => handleSaveEdit(order.id)}
                className="save-button"
              >
                Lưu
              </button>
              <button onClick={handleCancelEdit} className="cancel-button">
                Hủy
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr key={order.id}>
        <td>
          <Link to={`/AdminOrderDe/${order.id}`} className="order-link">
            {order.id}
          </Link>
        </td>
        <td>{order.name || "Không có"}</td>
        <td>{order.phoneNumber || "Không có"}</td>
        <td>{order.address || "Không có"}</td>
        <td>{order.note || "Không có"}</td>
        <td>{order.orderDeliveryType?.type || "Không có"}</td>
        <td>{translateDeliverper(order.deliverper) || "Không có"}</td>
        <td>{order.start ? formatDate(order.start) : "Không có"}</td>
        <td>{order.total ? order.total.toLocaleString() + " VND" : "0 VND"}</td>
        <td>{translateCondition(order.condition)}</td>
        <td>
          <div className="action-buttons">
            <button
              onClick={() => handleEditOrder(order)}
              className="edit-button"
            >
              Sửa
            </button>
            {renderActionButtons(order)}
          </div>
        </td>
      </tr>
    );
  };

  // Hiển thị các nút tương ứng với trạng thái đơn hàng
  const renderActionButtons = (order) => {
    if (order.condition === null) {
      return (
        <>
          <button
            className="accept-button"
            onClick={() => showConfirmationModal("acceptNew", order.id)}
          >
            Đồng ý
          </button>
          <button
            className="decline-button"
            onClick={() => showConfirmationModal("declineNew", order.id)}
          >
            Từ chối
          </button>
        </>
      );
    } else if (order.condition === "CANCEL_REQUEST_IS_WAITING") {
      return (
        <>
          <button
            className="accept-button"
            onClick={() => showConfirmationModal("acceptCancel", order.id)}
          >
            Đồng ý hủy
          </button>
          <button
            className="decline-button"
            onClick={() => showConfirmationModal("declineCancel", order.id)}
          >
            Từ chối hủy
          </button>
        </>
      );
    } else if (order.condition === "ONGOING") {
      // Kiểm tra xem đơn hàng có trong danh sách giao hôm nay không
      const canDeliver = haveDeliOrders.some((deli) => deli.id === order.id);

      if (canDeliver) {
        return (
          <button
            className="deliver-button"
            onClick={() => showConfirmationModal("deliver", order.id)}
          >
            Giao ngay
          </button>
        );
      }
    }

    return null;
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
        <h2>Quản Lý Đơn Đặt Hàng Theo Lịch - Admin</h2>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="actions-container">
        <button onClick={handleExportExcel} className="export-btn">
          Xuất Excel
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Tất cả đơn hàng ({allOrders.length})
        </button>
        <button
          className={`tab-button ${activeTab === "new" ? "active" : ""}`}
          onClick={() => setActiveTab("new")}
        >
          Đơn hàng mới ({newOrders.length})
        </button>
        <button
          className={`tab-button ${activeTab === "deliver" ? "active" : ""}`}
          onClick={() => setActiveTab("deliver")}
        >
          Cần giao hôm nay ({haveDeliOrders.length})
        </button>
        <button
          className={`tab-button ${activeTab === "cancel" ? "active" : ""}`}
          onClick={() => setActiveTab("cancel")}
        >
          Yêu cầu hủy ({cancelReqOrders.length})
        </button>
      </div>

      {/* Danh sách đơn hàng hiển thị theo tab */}
      <div className="">
        {/* Tất cả đơn hàng */}
        {activeTab === "all" && (
          <div className="order-section">
            <h3>Tất Cả Đơn Hàng</h3>
            {allOrders.length === 0 ? (
              <p>Không có đơn hàng nào.</p>
            ) : (
              <div className="">
                <table border="1" cellPadding="10" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên người nhận</th>
                      <th>Số điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Ghi chú</th>
                      <th>Loại giao</th>
                      <th>Khoảng cách</th>
                      <th>Ngày bắt đầu</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((order) => renderTableRow(order))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Đơn hàng mới chờ xác nhận */}
        {activeTab === "new" && (
          <div className="order-section">
            <h3>Đơn Hàng Mới Chờ Xác Nhận</h3>
            {newOrders.length === 0 ? (
              <p>Không có đơn hàng mới nào.</p>
            ) : (
              <div className="table-container">
                <table border="1" cellPadding="10" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên người nhận</th>
                      <th>Số điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Ghi chú</th>
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
                            to={`/AdminOrderDe/${order.id}`}
                            className="order-link"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td>{order.name || "Không có"}</td>
                        <td>{order.phoneNumber || "Không có"}</td>
                        <td>{order.address || "Không có"}</td>
                        <td>{order.note || "Không có"}</td>
                        <td>{order.orderDeliveryType?.type || "Không có"}</td>
                        <td>
                          {translateDeliverper(order.deliverper) || "Không có"}
                        </td>
                        <td>
                          {order.total
                            ? order.total.toLocaleString() + " VND"
                            : "0 VND"}
                        </td>
                        <td>{translateCondition(order.condition)}</td>
                        <td>
                          <button
                            className="accept-button"
                            onClick={() =>
                              showConfirmationModal("acceptNew", order.id)
                            }
                          >
                            Đồng ý
                          </button>
                          <button
                            className="decline-button"
                            onClick={() =>
                              showConfirmationModal("declineNew", order.id)
                            }
                          >
                            Từ chối
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Đơn hàng cần giao hôm nay */}
        {activeTab === "deliver" && (
          <div className="order-section">
            <h3>Đơn Hàng Cần Giao Hôm Nay</h3>
            {haveDeliOrders.length === 0 ? (
              <p>Không có đơn hàng nào cần giao hôm nay.</p>
            ) : (
              <div className="table-container">
                <table border="1" cellPadding="10" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên người nhận</th>
                      <th>Số điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Ghi chú</th>
                      <th>Loại giao</th>
                      <th>Khoảng cách</th>
                      <th>Ngày bắt đầu</th>
                      <th>Thời gian giao</th>
                      <th>Tổng tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {haveDeliOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link
                            to={`/AdminOrderDe/${order.id}`}
                            className="order-link"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td>{order.name || "Không có"}</td>
                        <td>{order.phoneNumber || "Không có"}</td>
                        <td>{order.address || "Không có"}</td>
                        <td>{order.note || "Không có"}</td>
                        <td>{order.orderDeliveryType?.type || "Không có"}</td>
                        <td>
                          {translateDeliverper(order.deliverper) || "Không có"}
                        </td>
                        <td>
                          {order.start ? formatDate(order.start) : "Không có"}
                        </td>
                        <td>
                          {order.start ? formatTime(order.start) : "Không có"}
                        </td>
                        <td>
                          {order.total
                            ? order.total.toLocaleString() + " VND"
                            : "0 VND"}
                        </td>
                        <td>
                          <button
                            className="deliver-button"
                            onClick={() =>
                              showConfirmationModal("deliver", order.id)
                            }
                          >
                            Giao ngay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Yêu cầu hủy đơn */}
        {activeTab === "cancel" && (
          <div className="order-section">
            <h3>Yêu Cầu Hủy Đơn</h3>
            {cancelReqOrders.length === 0 ? (
              <p>Không có yêu cầu hủy đơn nào.</p>
            ) : (
              <div className="table-container">
                <table border="1" cellPadding="10" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên người nhận</th>
                      <th>Số điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Ghi chú</th>
                      <th>Loại giao</th>
                      <th>Khoảng cách</th>
                      <th>Ngày bắt đầu</th>
                      <th>Thời gian giao</th>
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
                            to={`/AdminOrderDe/${order.id}`}
                            className="order-link"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td>{order.name || "Không có"}</td>
                        <td>{order.phoneNumber || "Không có"}</td>
                        <td>{order.address || "Không có"}</td>
                        <td>{order.note || "Không có"}</td>
                        <td>{order.orderDeliveryType?.type || "Không có"}</td>
                        <td>
                          {translateDeliverper(order.deliverper) || "Không có"}
                        </td>
                        <td>
                          {order.start ? formatDate(order.start) : "Không có"}
                        </td>
                        <td>
                          {order.start ? formatTime(order.start) : "Không có"}
                        </td>
                        <td>
                          {order.total
                            ? order.total.toLocaleString() + " VND"
                            : "0 VND"}
                        </td>
                        <td>{translateCondition(order.condition)}</td>
                        <td>
                          <button
                            className="accept-button"
                            onClick={() =>
                              showConfirmationModal("acceptCancel", order.id)
                            }
                          >
                            Đồng ý hủy
                          </button>
                          <button
                            className="decline-button"
                            onClick={() =>
                              showConfirmationModal("declineCancel", order.id)
                            }
                          >
                            Từ chối hủy
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal xác nhận */}
      {showModal && (
        <div className="stafforde-modal-overlay">
          <div className="stafforde-modal-container">
            <div className="stafforde-modal-header">{modalTitle}</div>
            <div className="stafforde-modal-body">{modalMessage}</div>
            <div className="stafforde-modal-footer">
              <button
                className="stafforde-modal-confirm"
                onClick={() => {
                  setShowModal(false);
                  executeAction();
                }}
              >
                Xác nhận
              </button>
              <button
                className="stafforde-modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDe;
