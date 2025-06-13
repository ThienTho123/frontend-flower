import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";

const StaffCustomOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // 'confirm' or 'result'
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionType, setActionType] = useState(""); // 'decline', 'cancel', 'success'
  
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");

  // Fetch danh sách đơn hàng
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/v1/staff/custom", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOrders(response.data.customize || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      showResultModal("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Format ngày giờ
  const formatDateTime = (dateTime) => {
    if (!dateTime || !Array.isArray(dateTime)) {
      return "Không xác định";
    }
    const [year, month, day, hour = 0, minute = 0] = dateTime;
    return `${day}/${month}/${year} - ${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Hiển thị modal kết quả
  const showResultModal = (message) => {
    setModalMessage(message);
    setModalType("result");
    setIsModalOpen(true);
  };

  // Hiển thị modal xác nhận
  const showConfirmModal = (message, orderId, action) => {
    setModalMessage(message);
    setSelectedOrderId(orderId);
    setActionType(action);
    setModalType("confirm");
    setIsModalOpen(true);
  };

  // Xử lý xác nhận action
  const handleConfirmAction = async () => {
    try {
      let endpoint = `http://localhost:8080/api/v1/staff/custom/${selectedOrderId}/${actionType}`;
      
      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Cập nhật trạng thái đơn hàng trong state
      let newCondition;
      switch (actionType) {
        case 'decline':
        case 'cancel':
          newCondition = 'CANCEL';
          break;
        case 'success':
          newCondition = 'SUCCESS';
          break;
        default:
          newCondition = orders.find(o => o.customID === selectedOrderId)?.condition;
      }

      setOrders(orders.map(order => 
        order.customID === selectedOrderId 
          ? { ...order, condition: newCondition }
          : order
      ));

      setIsModalOpen(false);
      
      let successMessage;
      switch (actionType) {
        case 'decline':
          successMessage = "Đơn hàng đã được từ chối thành công!";
          break;
        case 'cancel':
          successMessage = "Đơn hàng đã được hủy thành công!";
          break;
        case 'success':
          successMessage = "Đơn hàng đã được đánh dấu thành công và tạo đơn hàng chính thức!";
          break;
        default:
          successMessage = "Thao tác thực hiện thành công!";
      }
      
      showResultModal(successMessage);
      
    } catch (error) {
      console.error(`Lỗi khi ${actionType}:`, error);
      setIsModalOpen(false);
      showResultModal(error.response?.data || "Có lỗi xảy ra!");
    }
  };

  // Xử lý decline
  const handleDecline = (orderId) => {
    showConfirmModal("Bạn có chắc chắn muốn từ chối đơn hàng này?", orderId, "decline");
  };

  // Xử lý cancel
  const handleCancel = (orderId) => {
    showConfirmModal("Bạn có chắc chắn muốn hủy đơn hàng này?", orderId, "cancel");
  };

  // Xử lý success
  const handleSuccess = (orderId) => {
    showConfirmModal("Bạn có chắc chắn muốn đánh dấu đơn hàng này là thành công? Điều này sẽ tạo đơn hàng chính thức.", orderId, "success");
  };

  // Chuyển đến trang chi tiết
  const handleViewDetail = (orderId) => {
  navigate(`/StaffCustomOrders/edit/${orderId}`); // Sửa từ /detail/ thành /edit/
  };

  // Chuyển đến trang edit
  const handleEdit = (orderId) => {
  navigate(`/StaffCustomOrders/edit/${orderId}`); // Giữ nguyên
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
    setModalType("");
    setSelectedOrderId(null);
    setActionType("");
  };

  // Render action buttons dựa trên trạng thái
  const renderActionButtons = (order) => {
    const { customID, condition } = order;
    
    return (
      <div className="flex flex-wrap gap-1">
        {/* Nút Chi tiết - luôn hiển thị để xem thông tin */}
        <button
          onClick={() => handleViewDetail(customID)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
          title="Xem chi tiết đơn hàng"
        >
          Chi tiết
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="Staff-ql-container">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

 return (
    <div className="admin-ql-container">
      <div className="title-container flex items-center space-x-4 mb-6">
        <img
          src={returnIcon}
          alt="Quay Lại"
          className="return-button w-8 h-8 cursor-pointer hover:opacity-70"
          onClick={() => navigate("/staff")}
        />
        <h2 className="text-2xl font-bold">Quản Lý Đơn Hàng Custom</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Không có đơn hàng custom nào.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">ID</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Khách Hàng</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Số Điện Thoại</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Ngày Đặt</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Trạng Thái</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Tổng Tiền</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Địa Chỉ</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.customID} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="border border-gray-300 px-4 py-3 font-medium">#{order.customID}</td>
                  <td className="border border-gray-300 px-4 py-3" title={order.name}>
                    <div className="max-w-32 truncate">
                      {order.name || "N/A"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {order.phoneNumber || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    {formatDateTime(order.date)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.condition === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.condition === 'ACCEPT' ? 'bg-blue-100 text-blue-800' :
                      order.condition === 'PAID' ? 'bg-green-100 text-green-800' :
                      order.condition === 'SUCCESS' ? 'bg-green-200 text-green-900' :
                      order.condition === 'CANCEL' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.condition}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    {order.totalAmount ? (
                      <span className="font-medium text-green-600">
                        {order.totalAmount.toLocaleString()} VND
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa xác định</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 max-w-40 truncate" title={order.deliveryAddress}>
                    {order.deliveryAddress || "Không có"}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {renderActionButtons(order)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-start space-x-3">
              {modalType === "confirm" ? (
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-yellow-600 text-sm">⚠</span>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm">ℹ</span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed">{modalMessage}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              {modalType === "confirm" ? (
                <>
                  <button
                    onClick={closeModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
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

export default StaffCustomOrders;