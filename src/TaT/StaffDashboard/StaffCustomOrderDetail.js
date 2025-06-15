import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";
import "../StaffDashboard/CreateBlogForm.css";
import "./StaffCustomOrderDetail.css"; // Đảm bảo tạo file CSS tương ứng

const StaffCustomOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");

  // State cho dữ liệu cơ bản
  const [orderDetail, setOrderDetail] = useState(null);
  const [flowerCustoms, setFlowerCustoms] = useState([]);
  const [otherCustoms, setOtherCustoms] = useState([]);
  const [existingDetails, setExistingDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho accept form
  const [newDetails, setNewDetails] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [uploading, setUploading] = useState(false);

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // 'confirm' or 'result'

  // Fetch dữ liệu chi tiết
  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  // Tính tổng giá khi details thay đổi
  useEffect(() => {
    calculateTotalPrice();
  }, [newDetails, flowerCustoms, otherCustoms]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://deploybackend-j61h.onrender.com/api/v1/staff/custom/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const { customize, customDetails, flowerCustoms, otherCustoms } =
        response.data;

      setOrderDetail(customize);
      setExistingDetails(customDetails || []);
      setFlowerCustoms(flowerCustoms || []);
      setOtherCustoms(otherCustoms || []);

      // Nếu đơn đã có hình ảnh, hiển thị
      if (customize.image) {
        setImageUrl(customize.image);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết:", error);
      showResultModal("Lỗi tải dữ liệu chi tiết!");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    let total = 0;
    newDetails.forEach((detail) => {
      if (detail.type === "flower" && detail.id) {
        const flower = flowerCustoms.find((f) => f.flowerID === detail.id);
        if (flower) total += flower.price * detail.quantity;
      } else if (detail.type === "other" && detail.id) {
        const other = otherCustoms.find((o) => o.otherID === detail.id);
        if (other) total += other.price * detail.quantity;
      }
    });
    setTotalPrice(total);
  };

  // Format ngày giờ
  const formatDateTime = (dateTime) => {
    if (!dateTime || !Array.isArray(dateTime)) {
      return "Không xác định";
    }
    const [year, month, day, hour = 0, minute = 0] = dateTime;
    return `${day}/${month}/${year} - ${hour
      .toString()
      .padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://deploybackend-j61h.onrender.com/api/v1/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadedImageUrl = response.data.DT;
      setImageUrl(uploadedImageUrl);
      showResultModal("Upload ảnh thành công!");
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      showResultModal("Lỗi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  const addNewDetail = () => {
    setNewDetails([...newDetails, { type: "flower", id: null, quantity: 1 }]);
  };

  const removeNewDetail = (index) => {
    setNewDetails(newDetails.filter((_, i) => i !== index));
  };

  // Cập nhật detail
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...newDetails];
    if (field === "type") {
      updatedDetails[index].type = value;
      updatedDetails[index].id = null; // Reset id khi đổi type
    } else if (field === "id") {
      updatedDetails[index].id = parseInt(value) || null;
    } else if (field === "quantity") {
      updatedDetails[index].quantity = parseInt(value) || 1;
    }
    setNewDetails(updatedDetails);
  };

  // Hiển thị modal
  const showResultModal = (message) => {
    setModalMessage(message);
    setModalType("result");
    setIsModalOpen(true);
  };

  const showConfirmModal = (message) => {
    setModalMessage(message);
    setModalType("confirm");
    setIsModalOpen(true);
  };

  // Xử lý accept
  const handleAccept = () => {
    // Validation
    if (!imageUrl.trim()) {
      showResultModal("Vui lòng tải ảnh lên!");
      return;
    }

    if (newDetails.length === 0) {
      showResultModal("Vui lòng thêm ít nhất một detail!");
      return;
    }

    const invalidDetails = newDetails.filter((detail) => !detail.id);
    if (invalidDetails.length > 0) {
      showResultModal("Vui lòng chọn sản phẩm cho tất cả các detail!");
      return;
    }

    showConfirmModal(
      `Bạn có chắc chắn muốn CHẤP NHẬN đơn hàng này với tổng giá ${totalPrice.toLocaleString()} VND?`
    );
  };

  // Xử lý decline
  const handleDecline = () => {
    showConfirmModal("Bạn có chắc chắn muốn TỪ CHỐI đơn hàng này?");
  };

  // Xử lý cancel
  const handleCancel = () => {
    showConfirmModal("Bạn có chắc chắn muốn HỦY đơn hàng này?");
  };

  // Xử lý success
  const handleSuccess = () => {
    showConfirmModal(
      "Bạn có chắc chắn muốn đánh dấu đơn hàng này là HOÀN THÀNH? Điều này sẽ tạo đơn hàng chính thức."
    );
  };

  // Xử lý các hành động confirm
  const handleConfirmAction = async () => {
    try {
      if (modalMessage.includes("CHẤP NHẬN")) {
        // Xử lý accept
        const acceptDTO = {
          imageurl: imageUrl,
          total: totalPrice,
          customizeDetailDTOList: newDetails.map((detail) => ({
            flowerid: detail.type === "flower" ? detail.id : null,
            otherid: detail.type === "other" ? detail.id : null,
            number: detail.quantity,
          })),
        };

        await axios.put(
          `https://deploybackend-j61h.onrender.com/api/v1/staff/custom/${id}/accept`,
          acceptDTO,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setIsModalOpen(false);
        showResultModal("Đơn hàng đã được chấp nhận thành công!");
      } else if (modalMessage.includes("HOÀN THÀNH")) {
        // Xử lý success
        await axios.put(
          `https://deploybackend-j61h.onrender.com/api/v1/staff/custom/${id}/success`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setIsModalOpen(false);
        showResultModal(
          "Đơn hàng đã được đánh dấu hoàn thành và tạo đơn hàng chính thức!"
        );
      } else if (modalMessage.includes("TỪ CHỐI")) {
        // Xử lý decline
        await axios.put(
          `https://deploybackend-j61h.onrender.com/api/v1/staff/custom/${id}/decline`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setIsModalOpen(false);
        showResultModal("Đơn hàng đã được từ chối!");
      } else if (modalMessage.includes("HỦY")) {
        // Xử lý cancel
        await axios.put(
          `https://deploybackend-j61h.onrender.com/api/v1/staff/custom/${id}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setIsModalOpen(false);
        showResultModal("Đơn hàng đã được hủy!");
      }

      // Tải lại dữ liệu sau khi thực hiện hành động
      setTimeout(() => {
        fetchOrderDetail();
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
      setIsModalOpen(false);
      showResultModal(error.response?.data || "Có lỗi xảy ra!");
    }
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
    setModalType("");
  };

  // Render thông tin sản phẩm trong detail
  const renderDetailInfo = (detail) => {
    if (detail.flower) {
      return `${detail.flower.name} (Hoa) - Số lượng: ${detail.number}`;
    } else if (detail.other) {
      return `${detail.other.name} (Phụ kiện) - Số lượng: ${detail.number}`;
    }
    return "Không xác định";
  };

  // Render trạng thái
  const renderStatus = (condition) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Chờ xử lý",
      },
      PROCESSING: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Đang xử lý",
      },
      ACCEPT: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Đã chấp nhận",
      },
      PAID: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Đã thanh toán",
      },
      SUCCESS: {
        bg: "bg-green-200",
        text: "text-green-900",
        label: "Hoàn thành",
      },
      CANCEL: { bg: "bg-red-100", text: "text-red-800", label: "Đã hủy" },
    };

    const config = statusConfig[condition] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: condition,
    };

    return (
      <span
        className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="Staff-ql-container">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="Staff-ql-container">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg mb-4">Không tìm thấy đơn hàng!</p>
          <button
            onClick={() => navigate("/StaffCustomOrders")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="Staff-custom-order-detail-container">
      <div className="Staff-custom-order-detail-header">
        <img
          src={returnIcon}
          alt="Quay Lại"
          className="Staff-custom-order-detail-return-btn"
          onClick={() => navigate("/StaffCustomOrders")}
        />
        <h2 className="Staff-custom-order-detail-title">
          Chi Tiết Đơn Hàng Custom #{orderDetail.customID}
        </h2>
      </div>

      {/* Thông tin đơn hàng */}
      <div className="Staff-custom-order-detail-card">
        <h3 className="Staff-custom-order-detail-card-title">
          Thông Tin Đơn Hàng
        </h3>
        <div className="Staff-custom-order-detail-info-grid">
          <div className="Staff-custom-order-detail-info-column">
            <p className="Staff-custom-order-detail-info-item">
              <strong className="Staff-custom-order-detail-info-label">
                Khách hàng:
              </strong>
              <span className="Staff-custom-order-detail-info-value">
                {orderDetail.name || "N/A"}
              </span>
            </p>
            <p className="Staff-custom-order-detail-info-item">
              <strong className="Staff-custom-order-detail-info-label">
                Số điện thoại:
              </strong>
              <span className="Staff-custom-order-detail-info-value">
                {orderDetail.phoneNumber || "N/A"}
              </span>
            </p>
            <p className="Staff-custom-order-detail-info-item">
              <strong className="Staff-custom-order-detail-info-label">
                Địa chỉ giao hàng:
              </strong>
              <span className="Staff-custom-order-detail-info-value--secondary">
                {orderDetail.deliveryAddress || "N/A"}
              </span>
            </p>
          </div>
          <div className="Staff-custom-order-detail-info-column">
            <p className="Staff-custom-order-detail-info-item">
              <strong className="Staff-custom-order-detail-info-label">
                Ngày đặt:
              </strong>
              <span className="Staff-custom-order-detail-info-value--secondary">
                {formatDateTime(orderDetail.date)}
              </span>
            </p>
            <p className="Staff-custom-order-detail-info-item">
              <strong className="Staff-custom-order-detail-info-label">
                Trạng thái:
              </strong>
              {renderStatus(orderDetail.condition)}
            </p>
            <p className="Staff-custom-order-detail-info-item">
              <strong className="Staff-custom-order-detail-info-label">
                Tổng tiền hiện tại:
              </strong>
              <span className="Staff-custom-order-detail-info-value--success">
                {orderDetail.totalAmount
                  ? `${orderDetail.totalAmount.toLocaleString()} VND`
                  : "Chưa xác định"}
              </span>
            </p>
          </div>
        </div>
        {orderDetail.note && (
          <div className="Staff-custom-order-detail-note">
            <p>
              <strong className="Staff-custom-order-detail-note-label">
                Ghi chú:
              </strong>
              <span className="Staff-custom-order-detail-note-text">
                {orderDetail.note}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Hình ảnh hiện tại */}
      {orderDetail.image && (
        <div className="Staff-custom-order-detail-card">
          <h3 className="Staff-custom-order-detail-card-title">
            Hình Ảnh Đơn Hàng
          </h3>
          <img
            src={orderDetail.image}
            alt="Đơn hàng"
            className="Staff-custom-order-detail-image"
          />
        </div>
      )}

      {/* Chi tiết đã có */}
      {existingDetails.length > 0 && (
        <div className="Staff-custom-order-detail-card">
          <h3 className="Staff-custom-order-detail-card-title">
            Chi Tiết Đã Được Chấp Nhận
          </h3>
          <div className="Staff-custom-order-detail-existing-details">
            {existingDetails.map((detail, index) => (
              <div
                key={index}
                className="Staff-custom-order-detail-existing-item"
              >
                <div className="Staff-custom-order-detail-existing-dot"></div>
                <span className="Staff-custom-order-detail-existing-text">
                  {renderDetailInfo(detail)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Accept (chỉ hiển thị khi trạng thái PROCESSING) */}
      {orderDetail.condition === "PROCESSING" && (
        <div className="Staff-custom-order-detail-card">
          <h3 className="Staff-custom-order-detail-card-title">
            Chấp Nhận Đơn Hàng
          </h3>

          {/* Upload ảnh */}
          <div className="Staff-custom-order-detail-form-section">
            <label className="Staff-custom-order-detail-form-label">
              Tải ảnh sản phẩm lên:{" "}
              <span className="Staff-custom-order-detail-form-required">*</span>
            </label>
            <div className="Staff-custom-order-detail-upload-container">
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="Staff-custom-order-detail-file-input"
                disabled={uploading}
              />
              {imageUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--danger Staff-custom-order-detail-btn--small"
                >
                  Xóa ảnh
                </button>
              )}
            </div>

            {uploading && (
              <div className="Staff-custom-order-detail-upload-status">
                <div className="Staff-custom-order-detail-upload-spinner"></div>
                <p>Đang tải ảnh...</p>
              </div>
            )}

            {imageUrl && (
              <div className="Staff-custom-order-detail-image-preview">
                <p className="Staff-custom-order-detail-preview-label">
                  Ảnh đã tải:
                </p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="Staff-custom-order-detail-preview-image"
                />
              </div>
            )}
          </div>

          {/* Chi tiết sản phẩm */}
          <div className="Staff-custom-order-detail-form-section">
            <div className="Staff-custom-order-detail-products-header">
              <h4 className="Staff-custom-order-detail-products-title">
                Chi Tiết Sản Phẩm:{" "}
                <span className="Staff-custom-order-detail-form-required">
                  *
                </span>
              </h4>
              <button
                onClick={addNewDetail}
                className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--primary Staff-custom-order-detail-btn--small"
              >
                <span>+</span>
                <span>Thêm Detail</span>
              </button>
            </div>

            {newDetails.length === 0 ? (
              <div className="Staff-custom-order-detail-empty-state">
                <p className="Staff-custom-order-detail-empty-text">
                  Chưa có detail nào. Nhấn "Thêm Detail" để bắt đầu.
                </p>
              </div>
            ) : (
              <div className="Staff-custom-order-detail-products-list">
                {newDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="Staff-custom-order-detail-product-item"
                  >
                    {/* Loại sản phẩm */}
                    <div className="Staff-custom-order-detail-type-select-container">
                      <select
                        value={detail.type}
                        onChange={(e) =>
                          handleDetailChange(index, "type", e.target.value)
                        }
                        className="Staff-custom-order-detail-product-select"
                      >
                        <option value="flower">🌸 Hoa</option>
                        <option value="other">🎁 Phụ kiện</option>
                      </select>
                    </div>

                    {/* Dropdown sản phẩm và tên sản phẩm */}
                    <div className="Staff-custom-order-detail-product-select-container">
                      <select
                        value={detail.id || ""}
                        onChange={(e) =>
                          handleDetailChange(index, "id", e.target.value)
                        }
                        className="Staff-custom-order-detail-product-select Staff-custom-order-detail-product-select--main"
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {detail.type === "flower" &&
                          flowerCustoms.map((flower) => (
                            <option
                              key={flower.flowerID}
                              value={flower.flowerID}
                            >
                              {flower.name} - {flower.price.toLocaleString()}{" "}
                              VND
                            </option>
                          ))}
                        {detail.type === "other" &&
                          otherCustoms.map((other) => (
                            <option key={other.otherID} value={other.otherID}>
                              {other.name} - {other.price.toLocaleString()} VND
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Số lượng */}
                    <input
                      type="number"
                      min="1"
                      value={detail.quantity}
                      onChange={(e) =>
                        handleDetailChange(index, "quantity", e.target.value)
                      }
                      className="Staff-custom-order-detail-quantity-input"
                      placeholder="SL"
                    />

                    {/* Hiển thị giá tiền của detail này */}
                    <div className="Staff-custom-order-detail-product-price">
                      {(() => {
                        if (detail.type === "flower" && detail.id) {
                          const flower = flowerCustoms.find(
                            (f) => f.flowerID === detail.id
                          );
                          return flower
                            ? `${(
                                flower.price * detail.quantity
                              ).toLocaleString()} VND`
                            : "0 VND";
                        } else if (detail.type === "other" && detail.id) {
                          const other = otherCustoms.find(
                            (o) => o.otherID === detail.id
                          );
                          return other
                            ? `${(
                                other.price * detail.quantity
                              ).toLocaleString()} VND`
                            : "0 VND";
                        }
                        return "0 VND";
                      })()}
                    </div>

                    {/* Nút xóa */}
                    <button
                      onClick={() => removeNewDetail(index)}
                      className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--danger Staff-custom-order-detail-btn--small"
                      title="Xóa detail này"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tổng tiền */}
          <div className="Staff-custom-order-detail-total">
            <h4 className="Staff-custom-order-detail-total-text">
              💰 Tổng tiền:{" "}
              <span className="Staff-custom-order-detail-total-amount">
                {totalPrice.toLocaleString()} VND
              </span>
            </h4>
          </div>

          {/* Nút Actions cho PROCESSING */}
          <div className="Staff-custom-order-detail-actions">
            <button
              onClick={handleAccept}
              className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--success"
            >
              <span>✅</span>
              <span>Chấp Nhận Đơn Hàng</span>
            </button>
            <button
              onClick={handleDecline}
              className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--danger"
            >
              <span>❌</span>
              <span>Từ Chối</span>
            </button>
          </div>
        </div>
      )}

      {/* Actions cho các trạng thái khác */}
      {orderDetail.condition !== "PROCESSING" &&
        orderDetail.condition !== "SUCCESS" &&
        orderDetail.condition !== "CANCEL" && (
          <div className="Staff-custom-order-detail-card">
            <h3 className="Staff-custom-order-detail-card-title">Hành Động</h3>
            <div className="Staff-custom-order-detail-actions">
              {/* Nút Success cho đơn PAID */}
              {orderDetail.condition === "PAID" && (
                <button
                  onClick={handleSuccess}
                  className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--primary"
                >
                  <span>🎉</span>
                  <span>Đánh Dấu Hoàn Thành</span>
                </button>
              )}

              {/* Nút Cancel cho đơn ACCEPT hoặc PAID */}
              {(orderDetail.condition === "ACCEPT" ||
                orderDetail.condition === "PAID") && (
                <button
                  onClick={handleCancel}
                  className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--warning"
                >
                  <span>🚫</span>
                  <span>Hủy Đơn</span>
                </button>
              )}
            </div>
          </div>
        )}

      {/* Modal */}
      {isModalOpen && (
        <div className="Staff-custom-order-detail-modal-overlay">
          <div className="Staff-custom-order-detail-modal">
            <div className="Staff-custom-order-detail-modal-content">
              {modalType === "confirm" ? (
                <div className="Staff-custom-order-detail-modal-icon Staff-custom-order-detail-modal-icon--warning">
                  <span>⚠️</span>
                </div>
              ) : (
                <div className="Staff-custom-order-detail-modal-icon Staff-custom-order-detail-modal-icon--info">
                  <span>ℹ️</span>
                </div>
              )}
              <div className="Staff-custom-order-detail-modal-text">
                <p>{modalMessage}</p>
              </div>
            </div>

            <div className="Staff-custom-order-detail-modal-actions">
              {modalType === "confirm" ? (
                <>
                  <button
                    onClick={closeModal}
                    className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--gray"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--primary"
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="Staff-custom-order-detail-btn Staff-custom-order-detail-btn--primary"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCustomOrderDetail;
