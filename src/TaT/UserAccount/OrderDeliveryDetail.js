import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrderDetail.css"; // Import CSS file cho style

const OrderDeliveryDetail = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderDetail, setOrderDetail] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  useEffect(() => {
    getHistoryOrder();
  }, []);
  const { id } = useParams();
  const translateCondition = (condition) => {
    const translations = {
      "CANCEL REQUEST IS WAITING": "Đang chờ xác nhận hủy đơn",
      CANCEL: "Đã hủy",
      "REFUND IS WAITING": "Đang chờ hoàn tiền",
      REFUND: "Hoàn tiền",
      ONGOING: "Đang tiến hành",
      SUCCESS: "Đã hoàn thành",
    };
    return translations[condition] || condition;
  };
  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/userorde/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const rawOrderHistory = response.data?.orderDeliveryDTO || {};
      console.log("rawOrderHistory: ", rawOrderHistory);

      if (Object.keys(rawOrderHistory).length === 0) {
        console.error("Order history data is not valid:", rawOrderHistory);
        setOrderHistory([]);
        setOrderDetail([]);
        return;
      }

      const updatedOrderHistory = {
        id: rawOrderHistory.id,
        name: rawOrderHistory.name,
        total: rawOrderHistory.total || 0,
        paid: rawOrderHistory.paid || 0,
        date: rawOrderHistory.date
          ? dayjs(rawOrderHistory.date).format("YYYY-MM-DD HH:mm:ss")
          : "",
        condition: rawOrderHistory.orDeCondition?.replaceAll("_", " ") || "",
        phone: rawOrderHistory.phoneNumber,
        address: rawOrderHistory.address,
        note: rawOrderHistory.note || "",
        deliverper: rawOrderHistory.deliverper || "",
        orderType: rawOrderHistory.orDeType,
        days: rawOrderHistory.days,
        costperday: rawOrderHistory.costperday,
        numberDelivered: rawOrderHistory.numberDelivered || 0,
        shipStart: Array.isArray(rawOrderHistory.start)
          ? dayjs(new Date(...rawOrderHistory.start)).format(
              "YYYY-MM-DD HH:mm:ss"
            )
          : "Chưa xác định",
        shipEnd: Array.isArray(rawOrderHistory.end)
          ? dayjs(new Date(...rawOrderHistory.end)).format(
              "YYYY-MM-DD HH:mm:ss"
            )
          : "Chưa xác định",
      };

      setOrderHistory([updatedOrderHistory]);

      const updatedOrderDetails = (rawOrderHistory.orDeDetailDTOS || []).map(
        (item) => ({
          id: item.id,
          flowerName: item.flowername,
          count: item.count,
          size: item.flowersize,
          length: item.length,
          height: item.height,
          width: item.width,
          weight: item.weight,
          price: item.price,
          orderId: item.orDeID,
        })
      );

      console.log("updatedOrder", updatedOrderDetails);
      console.log("updatedOrderHistory", updatedOrderHistory);
      setOrderDetail(updatedOrderDetails);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

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
              <strong>Trạng Thái:</strong>{" "}
              {translateCondition(orderHistory[0].condition)}
            </p>

            <p>
              <strong>Số Điện Thoại:</strong> {orderHistory[0].phone}
            </p>
            
            <p>
              <strong>Tổng đơn giá:</strong> {orderHistory[0].costperday}
            </p>
            <p>
              <strong>Số ngày giao:</strong> {orderHistory[0].days}
            </p>
            <p>
              <strong>Tổng tiền đã thanh toán:</strong> {orderHistory[0].total}{" "}
              đ
            </p>
          </div>
          <div className="order-history-right">
          <p>
              <strong>Địa Chỉ:</strong> {orderHistory[0].address}
            </p>
            <p>
              <strong>Kiểu giao hàng:</strong>{" "}
              {orderHistory[0].orderType}
            </p>
            <p>
              <strong>Khoảng cách giao hàng:</strong> {orderHistory[0].deliverper}
            </p>
            <p>
              <strong>Ghi Chú:</strong> {orderHistory[0].note}
            </p>
            <p>
              <strong>Ngày Bắt Đầu Giao:</strong> {orderHistory[0].shipStart}
            </p>
            <p>
              <strong>Ngày Kết Thúc Giao:</strong> {orderHistory[0].shipEnd}
            </p>
            <p>
              <strong>Số đơn đã giao thành công:</strong> {orderHistory[0].numberDelivered}
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
            </tr>
          </thead>
          <tbody>
            {orderDetail.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td>{item.flowerName}</td>
                <td>{item.size}</td>
                <td>
                  {item.length} x {item.width} x {item.high}
                </td>
                <td>{item.weight}</td>
                <td>{item.count}</td>
                <td>{item.price}</td>
                <td>{item.price * item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDeliveryDetail;
