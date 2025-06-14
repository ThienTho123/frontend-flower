import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png"; // Điều chỉnh đường dẫn nếu cần

const AdminOrderDeDetail = () => {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const translateCondition = (condition) => {
    const translations = {
      ONGOING: "Đang tiến hành",
      REFUND: "Hoàn tiền",
      CANCEL_REQUEST_IS_WAITING: "Chờ xác nhận hủy",
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

  // Lấy chi tiết đơn hàng theo lịch
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `https://deploybackend-1ta9.onrender.com/api/v1/admin/orde/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy chi tiết đơn hàng theo lịch.");
        }

        const data = await response.json();
        setOrderDetails(data.orderDeliveryDTO);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrderDetails();
  }, [accesstoken, id]);

  // Chức năng đồng ý đơn hàng mới
  const handleAcceptNewOrder = async () => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/orde/${id}/acceptNew`,
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

      // Cập nhật lại thông tin chi tiết
      fetchUpdatedDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng từ chối đơn hàng mới
  const handleDeclineNewOrder = async () => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/orde/${id}/declineNew`,
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

      // Cập nhật lại thông tin chi tiết
      fetchUpdatedDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng đồng ý yêu cầu hủy
  const handleAcceptCancelRequest = async () => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/orde/${id}/acceptCancelRequest`,
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

      // Cập nhật lại thông tin chi tiết
      fetchUpdatedDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng từ chối yêu cầu hủy
  const handleDeclineCancelRequest = async () => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/orde/${id}/declineCancelRequest`,
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

      // Cập nhật lại thông tin chi tiết
      fetchUpdatedDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chức năng giao hàng ngay
  const handleDeliverNow = async () => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/orde/${id}/deli`,
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

      // Cập nhật lại thông tin chi tiết
      fetchUpdatedDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  // Cập nhật thông tin chi tiết đơn hàng
  const fetchUpdatedDetails = async () => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/orde/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy chi tiết đơn hàng sau khi cập nhật.");
      }

      const data = await response.json();
      setOrderDetails(data.orderDeliveryDTO);
    } catch (err) {
      setError(err.message);
    }
  };
  const executeAction = () => {
    switch (modalAction) {
      case "acceptNew":
        handleAcceptNewOrder();
        break;
      case "declineNew":
        handleDeclineNewOrder();
        break;
      case "acceptCancel":
        handleAcceptCancelRequest();
        break;
      case "declineCancel":
        handleDeclineCancelRequest();
        break;
      case "deliver":
        handleDeliverNow();
        break;
      default:
        break;
    }
  };
  const showConfirmationModal = (action) => {
    let title = "";
    let message = "";

    switch (action) {
      case "acceptNew":
        title = "Xác nhận đồng ý đơn hàng";
        message = `Bạn có chắc chắn muốn đồng ý đơn hàng #${id} không?`;
        break;
      case "declineNew":
        title = "Xác nhận từ chối đơn hàng";
        message = `Bạn có chắc chắn muốn từ chối đơn hàng #${id} không?`;
        break;
      case "acceptCancel":
        title = "Xác nhận đồng ý hủy đơn hàng";
        message = `Bạn có chắc chắn muốn đồng ý hủy đơn hàng #${id} không?`;
        break;
      case "declineCancel":
        title = "Xác nhận từ chối hủy đơn hàng";
        message = `Bạn có chắc chắn muốn từ chối yêu cầu hủy đơn hàng #${id} không?`;
        break;
      case "deliver":
        title = "Xác nhận giao hàng";
        message = `Bạn có chắc chắn muốn giao đơn hàng #${id} ngay bây giờ không?`;
        break;
      default:
        break;
    }

    setModalAction(action);
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };
  // Quay lại trang danh sách
  const handleBack = () => {
    navigate("/AdminOrderDe");
  };

  // Format datetime từ mảng [năm, tháng, ngày, giờ, phút]
  const formatDateTime = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "Không có dữ liệu";

    // Format theo chuẩn DD/MM/YYYY HH:MM
    return `${dateArray[2].toString().padStart(2, "0")}/${dateArray[1]
      .toString()
      .padStart(2, "0")}/${dateArray[0]} ${dateArray[3]
      .toString()
      .padStart(2, "0")}:${dateArray[4].toString().padStart(2, "0")}`;
  };

  // Hiển thị các nút tương tác dựa trên trạng thái
  const renderActionButtons = () => {
    if (!orderDetails) return null;

    if (orderDetails.orDeCondition === null) {
      return (
        <div className="action-buttons">
          <button
            className="accept-button"
            onClick={() => showConfirmationModal("acceptNew")}
          >
            Đồng ý
          </button>
          <button
            className="decline-button"
            onClick={() => showConfirmationModal("declineNew")}
          >
            Từ chối
          </button>
        </div>
      );
    } else if (orderDetails.orDeCondition === "CANCEL_REQUEST_IS_WAITING") {
      return (
        <div className="action-buttons">
          <button
            className="accept-button"
            onClick={() => showConfirmationModal("acceptCancel")}
          >
            Đồng ý hủy
          </button>
          <button
            className="decline-button"
            onClick={() => showConfirmationModal("declineCancel")}
          >
            Từ chối hủy
          </button>
        </div>
      );
    } else if (
      orderDetails.orDeCondition === "ONGOING" &&
      orderDetails.deliver
    ) {
      return (
        <div className="action-buttons">
          <button
            className="deliver-button"
            onClick={() => showConfirmationModal("deliver")}
          >
            Giao hàng ngay
          </button>
        </div>
      );
    }

    return null;
  };

  if (error) {
    return (
      <div className="admin-ql-container">
        <div className="title-container">
          <img
            src={returnIcon}
            alt="Quay Lại"
            className="return-button"
            onClick={handleBack}
          />
          <h2>Chi Tiết Đơn Hàng Theo Lịch</h2>
        </div>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="admin-ql-container">
        <div className="title-container">
          <img
            src={returnIcon}
            alt="Quay Lại"
            className="return-button"
            onClick={handleBack}
          />
          <h2>Chi Tiết Đơn Hàng Theo Lịch</h2>
        </div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="admin-ql-container">
      <div className="title-container">
        <img
          src={returnIcon}
          alt="Quay Lại"
          className="return-button"
          onClick={handleBack}
        />
        <h2>Chi Tiết Đơn Hàng Theo Lịch</h2>
      </div>

      <div className="order-detail-section">
        <h3>Thông Tin Đơn Hàng</h3>
        <div className="info-container">
          <div className="info-item">
            <span className="label">ID:</span>
            <span className="value">{orderDetails.id}</span>
          </div>
          <div className="info-item">
            <span className="label">Tên người nhận:</span>
            <span className="value">{orderDetails.name || "Không có"}</span>
          </div>
          <div className="info-item">
            <span className="label">Địa chỉ:</span>
            <span className="value">{orderDetails.address || "Không có"}</span>
          </div>
          <div className="info-item">
            <span className="label">Số điện thoại:</span>
            <span className="value">
              {orderDetails.phoneNumber || "Không có"}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Trạng thái:</span>
            <span className="value">
              {translateCondition(orderDetails.orDeCondition)}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Loại đặt hàng:</span>
            <span className="value">{orderDetails.orDeType || "Không có"}</span>
          </div>
          <div className="info-item">
            <span className="label">Số ngày:</span>
            <span className="value">{orderDetails.days || "Không có"}</span>
          </div>
          <div className="info-item">
            <span className="label">Chi phí mỗi ngày:</span>
            <span className="value">
              {orderDetails.costperday
                ? orderDetails.costperday.toLocaleString() + " VND"
                : "Không có"}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Tần suất giao hàng:</span>
            <span className="value">
              {translateDeliverper(orderDetails.deliverper)}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Ngày bắt đầu:</span>
            <span className="value">{formatDateTime(orderDetails.start)}</span>
          </div>
          <div className="info-item">
            <span className="label">Ngày kết thúc:</span>
            <span className="value">
              {orderDetails.end
                ? formatDateTime(orderDetails.end)
                : "Chưa kết thúc"}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Số lần đã giao:</span>
            <span className="value">{orderDetails.numberDelivered || 0}</span>
          </div>
          <div className="info-item">
            <span className="label">Ghi chú:</span>
            <span className="value">
              {orderDetails.note || "Không có ghi chú"}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Tổng tiền:</span>
            <span className="value">
              {orderDetails.total
                ? orderDetails.total.toLocaleString() + " VND"
                : "0 VND"}
            </span>
          </div>
        </div>
      </div>

      <div className="order-items-section">
        <h3>Chi Tiết Sản Phẩm</h3>
        {orderDetails.orDeDetailDTOS &&
        orderDetails.orDeDetailDTOS.length > 0 ? (
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên hoa</th>
                <th>Kích thước</th>
                <th>Chiều dài</th>
                <th>Chiều rộng</th>
                <th>Chiều cao</th>
                <th>Khối lượng</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.orDeDetailDTOS.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.flowername}</td>
                  <td>{item.flowersize}</td>
                  <td>{item.length} cm</td>
                  <td>{item.width} cm</td>
                  <td>{item.height} cm</td>
                  <td>{item.weight} g</td>
                  <td>{item.price.toLocaleString()} VND</td>
                  <td>{item.count}</td>
                  <td>{(item.price * item.count).toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không có sản phẩm nào.</p>
        )}
      </div>

      {renderActionButtons()}
      {showModal && (
        <div className="adminorde-modal-overlay">
          <div className="adminorde-modal-container">
            <div className="adminorde-modal-header">{modalTitle}</div>
            <div className="adminorde-modal-body">{modalMessage}</div>
            <div className="adminorde-modal-footer">
              <button
                className="adminorde-modal-confirm"
                onClick={() => {
                  setShowModal(false);
                  executeAction();
                }}
              >
                Xác nhận
              </button>
              <button
                className="adminorde-modal-cancel"
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

export default AdminOrderDeDetail;
