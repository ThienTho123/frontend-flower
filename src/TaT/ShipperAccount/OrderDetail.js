import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrderDetail.css";

const OrderDetail = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const [note, setNote] = useState(""); // Thêm state để quản lý note
  const { id } = useParams();
  const navigate = useNavigate(); // Hook để điều hướng
  const translateCondition = (condition) => {
    const translations = {
      Cancel_is_Processing: "Hủy đang xử lý",
      Cancelled: "Đã hủy",
      In_Transit: "Đang vận chuyển",
      Shipper_Delivering: "Shipper đang giao hàng",
      First_Attempt_Failed: "Lần giao hàng đầu tiên thất bại",
      Second_Attempt_Failed: "Lần giao hàng thứ hai thất bại",
      Third_Attempt_Failed: "Lần giao hàng thứ ba thất bại",
      Delivered_Successfully: "Giao hàng thành công",
      Return_to_shop: "Trả về cửa hàng",
      Pending: "Đang chờ xử lý",
      Processing: "Đang xử lý",
      Prepare: "Chuẩn bị",
    };
    return translations[condition] || condition;
  };
  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        `https://deploybackend-1ta9.onrender.com/shipper/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawOrderHistory = response.data?.orderList || {};
      if (Object.keys(rawOrderHistory).length === 0) {
        setOrderHistory([]);
        return;
      }

      const updatedOrderHistory = {
        id: rawOrderHistory.orderID,
        name: rawOrderHistory.name,
        total: rawOrderHistory.total,
        date: dayjs(rawOrderHistory.date).format("YYYY-MM-DD HH:mm:ss"),
        condition: rawOrderHistory.condition,
        phone: rawOrderHistory.phone,
        hadPaid: rawOrderHistory.hadPaid,
        address: rawOrderHistory.address,
        isPaid: rawOrderHistory.isPaid,
        note: rawOrderHistory.note || "",
        sizeName: rawOrderHistory.sizeName || [],
        price: rawOrderHistory.price || [],
        flowerNames: rawOrderHistory.flowerName || [],
        quantities: rawOrderHistory.quantity || [],
        lengths: rawOrderHistory.length || [],
        heights: rawOrderHistory.height || [],
        widths: rawOrderHistory.width || [],
        weights: rawOrderHistory.weight || [],
        paid: rawOrderHistory.paid || [],
        stt: Array.from(
          { length: rawOrderHistory.FlowerName?.length || 0 },
          (_, index) => index + 1
        ),
      };

      setOrderHistory([updatedOrderHistory]);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };
  const handleReceiveOrder = async () => {
    try {
      // Gửi yêu cầu POST với dữ liệu chuỗi thuần túy cho "note"
      const response = await axios.post(
        `https://deploybackend-1ta9.onrender.com/shipper/${id}/receive`, // Đảm bảo URL không có mã hóa
        { note: note }, // Truyền chuỗi 'note' bình thường trong body JSON
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Điều hướng về trang "allorder" nếu thành công
      if (response.status === 200) {
        navigate("/shipperaccount/needship");
      }
    } catch (error) {
      console.error("Error receiving order:", error);
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
              <strong>Tổng:</strong> {orderHistory[0].total} đ
            </p>
            <p>
              <strong>Trạng Thái:</strong>{" "}
              {translateCondition(orderHistory[0].condition)}
            </p>
            <p>
              <strong>Tình trạng thanh toán:</strong>{" "}
              {orderHistory[0].isPaid === "Yes"
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </p>
            <p>
              <strong>Tổng tiền đã thanh toán:</strong>{" "}
              {orderHistory[0].hadPaid} đ
            </p>
            <p>
              <strong>Số tiền cần trả:</strong>{" "}
              {orderHistory[0].total - orderHistory[0].hadPaid} đ
            </p>
          </div>
          <div className="order-history-right">
            <p>
              <strong>Họ Tên Khách Hàng:</strong> {orderHistory[0].name}
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
              <strong>Ghi Chú:</strong> {orderHistory[0].note}
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
              <th>Kích thước (DxRxC)</th>
              <th>Khối lượng</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Tổng</th>
              <th>Đã thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {orderHistory[0]?.flowerNames?.map((flowerName, index) => (
              <tr key={index}>
                <td>{index + 1}</td> {/* STT */}
                <td>{flowerName}</td>
                <td>
                  {orderHistory[0]?.lengths[index]} x{" "}
                  {orderHistory[0]?.widths[index]} x{" "}
                  {orderHistory[0]?.heights[index]}
                </td>
                <td>{orderHistory[0]?.weights[index]}</td>
                <td>{orderHistory[0]?.quantities[index]}</td>
                <td>
                  {orderHistory[0]?.price[index] /
                    orderHistory[0]?.quantities[index]}
                </td>
                <td>{orderHistory[0]?.price[index]}</td>
                <td>{orderHistory[0]?.paid[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phần nhập ghi chú */}
      <div className="order-note">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)} // Cập nhật note khi người dùng nhập
          placeholder="Nhập ghi chú cho đơn hàng"
          rows="4"
          cols="50"
        />
      </div>

      {/* Button Nhận đơn */}
      <button onClick={handleReceiveOrder} className="receive-button">
        Nhận Đơn
      </button>
    </div>
  );
};

export default OrderDetail;
