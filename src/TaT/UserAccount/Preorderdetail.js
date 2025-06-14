import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrderDetail.css"; // Import CSS file cho style

const PreorderDetail = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState(null);
  const [orderDetail, setOrderDetail] = useState([]);
  const { id } = useParams();

  const translateCondition = (condition) => {
    const translations = {
      Waiting: "Đang chờ",
      Cancel: "Đã hủy",
      Ordering: "Đang đặt hàng",
      Refund: "Hoàn tiền",
      Refunding: "Đang hoàn tiền",
      Success: "Thành công",
    };
    return translations[condition] || condition;
  };

  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        `https://deploybackend-1ta9.onrender.com/account/preorder/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawPreorder = response.data?.preorders || null;
      const rawPreorderDetail = response.data?.preorderdetails || [];
      if (!rawPreorder) {
        console.error("Order history data is not valid:", rawPreorder);
        setOrderHistory(null);
        return;
      }

      // Chuyển đổi dữ liệu đơn hàng
      const {
        id: orderId,
        totalAmount,
        date,
        precondition,
        name,
        phoneNumber,
        deliveryAddress,
      } = rawPreorder;
      const [year, month, day, hour, minute, second] = date;
      const formattedDate = dayjs(
        new Date(year, month - 1, day, hour, minute, second)
      ).format("YYYY-MM-DD HH:mm:ss");

      setOrderHistory({
        id: orderId,
        total: totalAmount,
        date: formattedDate,
        condition: precondition,
        name,
        phone: phoneNumber,
        address: deliveryAddress,
      });

      // Chuyển đổi dữ liệu chi tiết đơn hàng
      const updatedOrderDetail = rawPreorderDetail.map((item, index) => ({
        stt: index + 1,
        productName: item.flowerSize.flower.name,
        quantity: item.quantity,
        price: item.price / item.quantity,
        paid: item.paid,
        total: item.price,
        length: item.flowerSize.length,
        high: item.flowerSize.high,
        width: item.flowerSize.width,
        weight: item.flowerSize.weight,
        sizeName: item.flowerSize.sizeName,
      }));

      setOrderDetail(updatedOrderDetail);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };
  const calculateTotalPaid = () => {
    return orderDetail.reduce((total, detail) => total + (detail.paid || 0), 0);
  };
  useEffect(() => {
    getHistoryOrder();
  }, [id]);

  return (
    <div className="order-history-container">
      {/* Phần Order History */}
      {orderHistory && (
        <div className="order-history">
          <div className="order-history-left">
            <p>
              <strong>ID Hóa Đơn:</strong> {orderHistory.id}
            </p>
            <p>
              <strong>Họ Tên Khách Hàng:</strong> {orderHistory.name}
            </p>
            <p>
              <strong>Tổng:</strong> {orderHistory.total} đ
            </p>
            <p>
              <strong>Trạng Thái:</strong>{" "}
              {translateCondition(orderHistory.condition)}
            </p>
          </div>
          <div className="order-history-right">
            <p>
              <strong>Ngày Đặt:</strong> {orderHistory.date}
            </p>
            <p>
              <strong>Số Điện Thoại:</strong> {orderHistory.phone}
            </p>
            <p>
              <strong>Địa Chỉ:</strong> {orderHistory.address}
            </p>
            <p>
              <strong>Tổng tiền đã thanh toán:</strong> {calculateTotalPaid()} đ
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
    </div>
  );
};

export default PreorderDetail;
