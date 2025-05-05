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

  const translateCondition = (condition) => {
    const translations = {
      ONGOING: "Đang tiến hành",
      REFUND: "Hoàn tiền",
      CANCEL_REQUEST_IS_WAITING: "Chờ xác nhận hủy",
      REFUND_IS_WAITING: "Đang xử lý hoàn tiền",
      null: "Chờ xác nhận",
      CANCEL: "Hủy",
      SUCCESS: "Thành Công"
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

  // Format riêng phần ngày từ mảng [year, month, day, hour, minute, second]
  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "Không có dữ liệu";
    
    // Format theo chuẩn DD/MM/YYYY
    return `${dateArray[2].toString().padStart(2, '0')}/${dateArray[1].toString().padStart(2, '0')}/${dateArray[0]}`;
  };

  // Format riêng phần giờ từ mảng [year, month, day, hour, minute, second]
  const formatTime = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "Không có dữ liệu";
    
    // Format theo chuẩn HH:MM
    return `${dateArray[3].toString().padStart(2, '0')}:${dateArray[4].toString().padStart(2, '0')}`;
  };

  // Format datetime đầy đủ từ mảng [year, month, day, hour, minute, second]
  const formatDateTime = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "Không có dữ liệu";
    
    // Format theo chuẩn DD/MM/YYYY HH:MM
    return `${dateArray[2].toString().padStart(2, '0')}/${dateArray[1].toString().padStart(2, '0')}/${dateArray[0]} ${dateArray[3].toString().padStart(2, '0')}:${dateArray[4].toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/orde",
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

  // Chức năng đồng ý đơn hàng mới
  const handleAcceptNewOrder = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/orde/${id}/acceptNew`,
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
        `http://localhost:8080/api/v1/admin/orde/${id}/declineNew`,
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
        `http://localhost:8080/api/v1/admin/orde/${id}/acceptCancelRequest`,
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
        `http://localhost:8080/api/v1/admin/orde/${id}/declineCancelRequest`,
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
        `http://localhost:8080/api/v1/admin/orde/${id}/deli`,
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
        "http://localhost:8080/api/v1/admin/orde",
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
    navigate("/admin");
  };

  // Hiển thị modal xác nhận
  const showConfirmationModal = (action, orderId) => {
    let title = '';
    let message = '';
    
    switch (action) {
      case 'acceptNew':
        title = "Xác nhận đồng ý đơn hàng";
        message = `Bạn có chắc chắn muốn đồng ý đơn hàng #${orderId} không?`;
        break;
      case 'declineNew':
        title = "Xác nhận từ chối đơn hàng";
        message = `Bạn có chắc chắn muốn từ chối đơn hàng #${orderId} không?`;
        break;
      case 'acceptCancel':
        title = "Xác nhận đồng ý hủy đơn hàng";
        message = `Bạn có chắc chắn muốn đồng ý hủy đơn hàng #${orderId} không?`;
        break;
      case 'declineCancel':
        title = "Xác nhận từ chối hủy đơn hàng";
        message = `Bạn có chắc chắn muốn từ chối yêu cầu hủy đơn hàng #${orderId} không?`;
        break;
      case 'deliver':
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
      case 'acceptNew':
        handleAcceptNewOrder(modalOrderId);
        break;
      case 'declineNew':
        handleDeclineNewOrder(modalOrderId);
        break;
      case 'acceptCancel':
        handleAcceptCancelRequest(modalOrderId);
        break;
      case 'declineCancel':
        handleDeclineCancelRequest(modalOrderId);
        break;
      case 'deliver':
        handleDeliverNow(modalOrderId);
        break;
      default:
        break;
    }
  };

  // Hiển thị các nút tương ứng với trạng thái đơn hàng
  const renderActionButtons = (order) => {
    if (order.condition === null) {
      return (
        <>
          <button
            className="accept-button"
            onClick={() => showConfirmationModal('acceptNew', order.id)}
          >
            Đồng ý
          </button>
          <button
            className="decline-button"
            onClick={() => showConfirmationModal('declineNew', order.id)}
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
            onClick={() => showConfirmationModal('acceptCancel', order.id)}
          >
            Đồng ý hủy
          </button>
          <button
            className="decline-button"
            onClick={() => showConfirmationModal('declineCancel', order.id)}
          >
            Từ chối hủy
          </button>
        </>
      );
    } else if (order.condition === "ONGOING") {
      // Kiểm tra xem đơn hàng có trong danh sách giao hôm nay không
      const canDeliver = haveDeliOrders.some(deli => deli.id === order.id);
      
      if (canDeliver) {
        return (
          <button
            className="deliver-button"
            onClick={() => showConfirmationModal('deliver', order.id)}
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
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả đơn hàng ({allOrders.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          Đơn hàng mới ({newOrders.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'deliver' ? 'active' : ''}`}
          onClick={() => setActiveTab('deliver')}
        >
          Cần giao hôm nay ({haveDeliOrders.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'cancel' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancel')}
        >
          Yêu cầu hủy ({cancelReqOrders.length})
        </button>
      </div>

      {/* Danh sách đơn hàng hiển thị theo tab */}
      <div className="order-list-container">
        {/* Tất cả đơn hàng */}
        {activeTab === 'all' && (
          <div className="order-section">
            <h3>Tất Cả Đơn Hàng</h3>
            {allOrders.length === 0 ? (
              <p>Không có đơn hàng nào.</p>
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
                  {allOrders.map((order) => (
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
                      <td>{order.orderDeliveryType?.type || "Không có"}</td>
                      <td>{translateDeliverper(order.deliverper) || "Không có"}</td>
                      <td>{order.start ? formatDate(order.start) : "Không có"}</td>
                      <td>{order.total ? order.total.toLocaleString() + " VND" : "0 VND"}</td>
                      <td>{translateCondition(order.condition)}</td>
                      <td>
                        {renderActionButtons(order)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Đơn hàng mới chờ xác nhận */}
        {activeTab === 'new' && (
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
                          to={`/AdminOrderDe/${order.id}`}
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
                          onClick={() => showConfirmationModal('acceptNew', order.id)}
                        >
                          Đồng ý
                        </button>
                        <button
                          className="decline-button"
                          onClick={() => showConfirmationModal('declineNew', order.id)}
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
        )}

        {/* Đơn hàng cần giao hôm nay */}
        {activeTab === 'deliver' && (
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
                      <td>{order.orderDeliveryType?.type || "Không có"}</td>
                      <td>{translateDeliverper(order.deliverper) || "Không có"}</td>
                      <td>{order.start ? formatDate(order.start) : "Không có"}</td>
                      <td>{order.start ? formatTime(order.start) : "Không có"}</td>
                      <td>{order.total ? order.total.toLocaleString() + " VND" : "0 VND"}</td>
                      <td>
                        <button
                          className="deliver-button"
                          onClick={() => showConfirmationModal('deliver', order.id)}
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
        )}

        {/* Yêu cầu hủy đơn */}
        {activeTab === 'cancel' && (
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
                      <td>{order.orderDeliveryType?.type || "Không có"}</td>
                      <td>{translateDeliverper(order.deliverper) || "Không có"}</td>
                      <td>{order.start ? formatDate(order.start) : "Không có"}</td>
                      <td>{order.start ? formatTime(order.start) : "Không có"}</td>
                      <td>{order.total ? order.total.toLocaleString() + " VND" : "0 VND"}</td>
                      <td>{translateCondition(order.condition)}</td>
                      <td>
                        <button
                          className="accept-button"
                          onClick={() => showConfirmationModal('acceptCancel', order.id)}
                        >
                          Đồng ý hủy
                        </button>
                        <button
                          className="decline-button"
                          onClick={() => showConfirmationModal('declineCancel', order.id)}
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
        )}
      </div>

      {/* Modal xác nhận */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">{modalTitle}</div>
            <div className="modal-body">{modalMessage}</div>
            <div className="modal-footer">
              <button 
                className="modal-confirm" 
                onClick={() => {
                  setShowModal(false);
                  executeAction();
                }}
              >
                Xác nhận
              </button>
              <button 
                className="modal-cancel" 
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