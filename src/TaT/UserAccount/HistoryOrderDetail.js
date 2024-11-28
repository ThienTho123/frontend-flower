import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import './HistoryOrderDetail.css'; // Import CSS file cho style

const HistoryOrderDetail = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderDetail, setOrderDetail] = useState([]);
  const { id } = useParams();

  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/account/orderHistory/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      console.log("rawOrderHistory: "+ response.data);
      const rawOrderHistory = response.data?.orderHistory || {};
      const rawOrderDetail = response.data?.orderDetail || [];


      if (Object.keys(rawOrderHistory).length === 0) {
        console.error("Order history data is not valid:", rawOrderHistory);
        setOrderHistory([]); 
        return;
      }

      // Cập nhật state cho orderHistory
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
          ? dayjs(rawOrderHistory.shipStart).format("YYYY-MM-DD")
          : null,
        shipEnd: rawOrderHistory.shipEnd
          ? dayjs(rawOrderHistory.shipEnd).format("YYYY-MM-DD")
          : null,
        shipperName: rawOrderHistory.shipperName,
        shipperPhone: rawOrderHistory.shipperPhone,
        shipperEmail: rawOrderHistory.shipperEmail,
        shipperNote: rawOrderHistory.shipperNote,

      };

      setOrderHistory([updatedOrderHistory]);

      const updatedOrderDetail = rawOrderDetail.map((item, index) => ({
        stt: index + 1,
        productName: item.flowerSize.flower.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        length: item.flowerSize.length,
        high: item.flowerSize.high,
        width: item.flowerSize.width,
        weight: item.flowerSize.weight,
        sizeName: item.flowerSize.sizeName
      }));

      setOrderDetail(updatedOrderDetail);
    } catch (error) {
      console.error("Error fetching order history:", error);
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
            <p><strong>Order ID:</strong> {orderHistory[0].id}</p>
            <p><strong>Customer Name:</strong> {orderHistory[0].name}</p>
            <p><strong>Total:</strong> ${orderHistory[0].total}</p>
            <p><strong>Condition:</strong> {orderHistory[0].condition}</p>
            <p><strong>Order Date:</strong> {orderHistory[0].date}</p>
            <p><strong>Phone:</strong> {orderHistory[0].phone}</p>
            <p><strong>Address:</strong> {orderHistory[0].address}</p>
            <p><strong>Name:</strong> {orderHistory[0].name}</p>

          </div>
          <div className="order-history-right">
            <p><strong>Shipper Name:</strong> {orderHistory[0].shipperName}</p>
            <p><strong>Shipper Phone:</strong> {orderHistory[0].shipperPhone}</p>
            <p><strong>Shipper Email:</strong> {orderHistory[0].shipperEmail}</p>
            <p><strong>Shipper Note:</strong> {orderHistory[0].shipperNote}</p>
            <p><strong>Ship Start On:</strong> {orderHistory[0].shipStart}</p>
            <p><strong>Ship End On:</strong> {orderHistory[0].setOrderHistory}</p>
            <p><strong>Tình trạng thanh toán:</strong> {orderHistory[0].isPaid === "Yes" ? "Đã thanh toán" : "Chưa thanh toán"}</p>

          </div>
        </div>
      )}

      {/* Phần Order Detail */}
      <div className="order-detail">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Product Name</th>
              <th>Size Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Size (LxWxH)</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {orderDetail.map((item) => (
              <tr key={item.stt}>
                <td>{item.stt}</td>
                <td>{item.productName}</td>
                <td>{item.sizeName}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>{item.total}</td>
                <td>{item.length} x {item.width} x {item.high}</td>
                <td>{item.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryOrderDetail;
