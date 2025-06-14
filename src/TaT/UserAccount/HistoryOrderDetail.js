import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrderDetail.css"; // Import CSS file cho style

const HistoryOrderDetail = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderDetail, setOrderDetail] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { id } = useParams();
  const translateCondition = (condition) => {
    const translations = {
      "Cancel is Processing": "Hủy đang xử lý",
      Cancelled: "Đã hủy",
      "In Transit": "Đang vận chuyển",
      "Shipper Delivering": "Shipper đang giao hàng",
      "First Attempt Failed": "Lần giao hàng đầu tiên thất bại",
      "Second Attempt Failed": "Lần giao hàng thứ hai thất bại",
      "Third Attempt Failed": "Lần giao hàng thứ ba thất bại",
      "Delivered Successfully": "Giao hàng thành công",
      "Return to shop": "Trả về cửa hàng",
      Pending: "Đang chờ xử lý",
      Processing: "Đang xử lý",
      Prepare: "Chuẩn bị",
    };
    return translations[condition] || condition;
  };
  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        `https://deploybackend-1ta9.onrender.com/account/orderHistory/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const rawOrderHistory = response.data?.orderHistory || {};
      const rawOrderDetail = response.data?.orderDetail || [];
      console.log("rawOrderHistory: ", rawOrderHistory);

      if (Object.keys(rawOrderHistory).length === 0) {
        console.error("Order history data is not valid:", rawOrderHistory);
        setOrderHistory([]);
        return;
      }

      const updatedOrderHistory = {
        id: rawOrderHistory.orderID,
        name: rawOrderHistory.name,
        total: rawOrderHistory.total,
        date: dayjs(rawOrderHistory.date).format("YYYY-MM-DD HH:mm:ss"),
        condition: rawOrderHistory.condition.replaceAll("_", " "),
        phone: rawOrderHistory.phone,
        address: rawOrderHistory.address,
        isPaid: rawOrderHistory.isPaid,
        note: rawOrderHistory.note || "",
        shipStart: rawOrderHistory.shipStart
          ? dayjs(rawOrderHistory.shipStart).format("YYYY-MM-DD HH:mm:ss")
          : null,
        shipEnd: rawOrderHistory.shipEnd
          ? dayjs(rawOrderHistory.shipEnd).format("YYYY-MM-DD HH:mm:ss")
          : null,
        shipperName: rawOrderHistory.shipperName,
        shipperPhone: rawOrderHistory.shipperPhone,
        shipperEmail: rawOrderHistory.shipperEmail,
        shipperNote: rawOrderHistory.shipperNote,
        paid: rawOrderHistory.paid,
        confirm: rawOrderHistory.confirm,
      };

      setOrderHistory([updatedOrderHistory]);

      const updatedOrderDetail = rawOrderDetail.map((item, index) => ({
        stt: index + 1,
        productName: item.flowerSize.flower.name,
        quantity: item.quantity,
        price: item.price / item.quantity,
        total: item.price,
        length: item.flowerSize.length,
        high: item.flowerSize.high,
        width: item.flowerSize.width,
        weight: item.flowerSize.weight,
        sizeName: item.flowerSize.sizeName,
        paid: item.paid,
      }));

      setOrderDetail(updatedOrderDetail);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  const handleConfirmClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    try {
      await axios.post(
        "https://deploybackend-1ta9.onrender.com/account/confirm-success",
        { idOrder: selectedOrderId },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      getHistoryOrder();
      // Cập nhật lại trạng thái đơn hàng nếu cần
    } catch (error) {
      console.error("Lỗi xác nhận đơn hàng:", error);
    }
  };

  useEffect(() => {
    getHistoryOrder();
  }, [id]);

  return (
    <div className="order-history-container">
      {/* Phần Order History */}
      {orderHistory.length > 0 && (
        <div className="order-history">
          <div className="order-history-left">
            <p>
              <strong>ID Hóa Đơn:</strong> {orderHistory[0].id}
            </p>
            <p>
              <strong>Họ Tên Khách Hàng:</strong> {orderHistory[0].name}
            </p>
            <p>
              <strong>Tổng:</strong> {orderHistory[0].total} đ
            </p>
            <p>
              <strong>Trạng Thái:</strong>{" "}
              {translateCondition(orderHistory[0].condition)}
            </p>
            <p>
              <strong>Ngày Đặt:</strong> {orderHistory[0].date}
            </p>
            <p>
              <strong>Số Điện Thoại:</strong> {orderHistory[0].phone}
            </p>
            <p>
              <strong>Địa Chỉ:</strong> {orderHistory[0].address}
            </p>
            <p>
              <strong>Tổng tiền đã thanh toán:</strong> {orderHistory[0].paid} đ
            </p>
            <p>
              <strong>Số tiền cần trả:</strong>{" "}
              {orderHistory[0].total - orderHistory[0].paid} đ
            </p>
          </div>
          <div className="order-history-right">
            <p>
              <strong>Họ Tên Shipper:</strong> {orderHistory[0].shipperName}
            </p>
            <p>
              <strong>Số Điện Thoại Shipper:</strong>{" "}
              {orderHistory[0].shipperPhone}
            </p>
            <p>
              <strong>Email của Shipper:</strong> {orderHistory[0].shipperEmail}
            </p>
            <p>
              <strong>Ghi Chú:</strong> {orderHistory[0].note}
            </p>
            <p>
              <strong>Shipper Ghi Chú:</strong> {orderHistory[0].shipperNote}
            </p>
            <p>
              <strong>Ngày Bắt Đầu Giao:</strong> {orderHistory[0].shipStart}
            </p>
            <p>
              <strong>Ngày Kết Thúc Giao:</strong> {orderHistory[0].shipEnd}
            </p>
            <p>
              <strong>Tình trạng thanh toán:</strong>{" "}
              {orderHistory[0].isPaid === "Yes"
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </p>
          </div>
        </div>
      )}

      {/* Phần Order Detail */}
      <div className="order-detail">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên hoa</th>
              <th>Kích thước</th>
              <th>Dài x Rộng x Cao</th>
              <th>Khối lượng</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Tổng</th>
              <th>Đã thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {orderDetail.map((item) => (
              <tr key={item.stt}>
                <td>{item.stt}</td>
                <td>{item.productName}</td>
                <td>{item.sizeName}</td>
                <td>
                  {item.length} x {item.width} x {item.high}
                </td>
                <td>{item.weight}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>{item.total}</td>
                <td>{item.paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        {orderHistory.map((order) => (
          <div key={order.id}>
            {order.condition === "Delivered Successfully" && (
              <div className="button-container">
                {order.confirm === "No" ? (
                  <button
                    className="order-button confirm-button"
                    onClick={() => handleConfirmClick(order.id)}
                  >
                    Xác nhận
                  </button>
                ) : (
                  <Link
                    to="/account/orders"
                    className="order-button review-button"
                  >
                    Đánh giá
                  </Link>
                )}

                <Link
                  to="/account/sendcomment"
                  className="order-button contact-button"
                >
                  Liên hệ
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* Modal xác nhận */}
        {showConfirmModal && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal-container">
              <h3>Bạn có chắc chắn muốn xác nhận đơn hàng giao thành công?</h3>
              <div className="confirm-modal-buttons">
                <button
                  className="confirm-modal-button confirm"
                  onClick={confirmOrder}
                >
                  OK
                </button>
                <button
                  className="confirm-modal-button cancel"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal thông báo xác nhận thành công */}
        {showSuccessModal && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal-container">
              <h3>Xác nhận thành công!</h3>
              <button
                className="confirm-modal-button confirm"
                onClick={() => setShowSuccessModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryOrderDetail;
