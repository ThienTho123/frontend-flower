import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrderDetail.css"; // Import CSS file cho style

const AccountCustomDetail = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderDetail, setOrderDetail] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const { id } = useParams();
  const translateCondition = (condition) => {
    const translations = {
      PROCESSING: "Đang xử lý",
      ACCEPT: "Đã chấp nhận",
      PAID: "Đã thanh toán",
      SUCCESS: "Đã hoàn thành",
      CANCEL: "Đã hủy",
    };
    return translations[condition] || condition;
  };
  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/acccus/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const rawCustomize = response.data?.customize || {};
      const rawCustomDetail = response.data?.customDetails || [];
      console.log("rawOrderHistory: ", rawCustomize);

      if (Object.keys(rawCustomize).length === 0) {
        console.error("Order history data is not valid:", rawCustomize);
        setOrderHistory([]);
        return;
      }

      const updatedOrderHistory = {
        id: rawCustomize.customID,
        name: rawCustomize.name,
        total: rawCustomize.totalAmount,
        date: dayjs(
          new Date(
            rawCustomize.date[0],
            rawCustomize.date[1] - 1,
            rawCustomize.date[2],
            rawCustomize.date[3],
            rawCustomize.date[4],
            rawCustomize.date[5]
          )
        ).format("YYYY-MM-DD HH:mm:ss"),
        condition: rawCustomize.condition.replaceAll("_", " "),
        phone: rawCustomize.phoneNumber,
        address: rawCustomize.deliveryAddress,
        note: rawCustomize.note || "",
        description: rawCustomize.description,
        sentence: rawCustomize.sentence,
        purpose: rawCustomize.purpose,
        number: rawCustomize.number,
        image: rawCustomize.image,
      };

      setOrderHistory([updatedOrderHistory]);
      setTotalAmount(rawCustomize.totalAmount);
      const updatedOrderDetail = rawCustomDetail.map((item, index) => ({
        stt: index + 1,
        flower: item.flower?.name,
        other: item.other?.name,
        number: item.number,
        price: item.flower?.price || item.other?.price,
      }));

      setOrderDetail(updatedOrderDetail);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };
  const handleBuyVNPay = () => {
    if (!orderHistory.length || !orderHistory[0].id) {
      alert("Không tìm thấy đơn hàng để thanh toán.");
      return;
    }

    const finalUrl = `http://localhost:8080/setCustomize/${orderHistory[0].id}?price=${totalAmount}`;
    console.log("URL thanh toán:", finalUrl);

    fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.error("API Error:", text);
            throw new Error(`Không thể cập nhật đơn hàng: ${text}`);
          });
        }
        return response.text();
      })
      .then(() => {
        return fetch(`http://localhost:8080/pay?totalPayment=${totalAmount}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
      })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.error("Payment API Error:", text);
            throw new Error(`Không thể khởi tạo thanh toán: ${text}`);
          });
        }
        return response.text();
      })
      .then((vnpayUrl) => {
        console.log("Redirecting to VNPay URL:", vnpayUrl);
        window.location.href = vnpayUrl;
      })
      .catch((error) => {
        console.error("Lỗi trong quá trình thanh toán:", error);
        alert("Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.");
      });
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
              <strong>ID Đơn đặt hoa theo yêu cầu:</strong> {orderHistory[0].id}
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
              <strong>Ghi chú:</strong> {orderHistory[0].note}
            </p>
          </div>
          <div className="order-history-right">
            <p>
              <strong>Mô tả:</strong> {orderHistory[0].description}
            </p>
            <p>
              <strong>Lời nhắn:</strong> {orderHistory[0].sentence}
            </p>
            <p>
              <strong>Mục đích:</strong> {orderHistory[0].purpose}
            </p>
            <p>
              <strong>Số lượng:</strong> {orderHistory[0].number}
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
              <th>Tên phụ kiện</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {orderDetail.map((item) => (
              <tr key={item.stt}>
                <td>{item.stt}</td>
                <td>{item.flower}</td>
                <td>{item.other}</td>
                <td>{item.price}</td>
                <td>{item.number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orderHistory.length > 0 && orderHistory[0].image && (
        <div className="order-image-preview">
          <h3 className="image-title">Ảnh mẫu hoa</h3>
          <img
            src={orderHistory[0].image}
            alt="Ảnh mẫu đơn hàng"
            className="order-image"
          />
        </div>
      )}

      {orderHistory.length > 0 && orderHistory[0].condition === "ACCEPT" && (
        <div className="pay-button-wrapper">
          <button className="pay-button" onClick={handleBuyVNPay}>
            Thanh toán
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountCustomDetail;
