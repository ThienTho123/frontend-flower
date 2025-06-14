import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "./OrderDetail.css"; // Import CSS file cho style

const OrderShippedDetail = () => {
  const access_token = localStorage.getItem("access_token");
  const [orderHistory, setOrderHistory] = useState([]);
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [noteText, setNoteText] = useState("");
  const navigate = useNavigate();
  const translateCondition = (condition) => {
    const translations = {
      "Cancel is Processing": "Hủy đang xử lý",
      Cancelled: "Đã hủy",
      "In Transit": "Đang vận chuyển",
      "Shipper Delivering": "Shipper đang giao hàng",
      "First Attempt Failed": "Lần giao hàng đầu tiên thất bại",
      "Second Attempt Failed": "Lần giao hàng thứ hai thất bại",
      "Third Attempt_Failed": "Lần giao hàng thứ ba thất bại",
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
        `https://deploybackend-1ta9.onrender.com/shipperaccount/ordership/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const rawOrderHistory = response.data?.orderShippingDTO || {};
      console.log("rawOrderHistory: ", rawOrderHistory);

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
        hadPaid: rawOrderHistory.hadPaid,
        isPaid: rawOrderHistory.isPaid,
        note: rawOrderHistory.note || "",
        shipStart: rawOrderHistory.shipStart
          ? dayjs(rawOrderHistory.shipStart).format("YYYY-MM-DD HH:mm:ss")
          : null,
        shipEnd: rawOrderHistory.shipEnd
          ? dayjs(rawOrderHistory.shipEnd).format("YYYY-MM-DD HH:mm:ss")
          : null,
        shipperName: rawOrderHistory.shipperName,
        shippingID: rawOrderHistory.shippingID,
        shipperID: rawOrderHistory.shipperID,
        shipperNote: rawOrderHistory.shipperNote,
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

  // Gửi request để bắt đầu giao
  const handleStartDelivery = async () => {
    try {
      const response = await axios.request({
        method: "GET",
        url: `https://deploybackend-1ta9.onrender.com/shipperaccount/haveship/${orderHistory[0]?.id}/start`,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      getHistoryOrder();
    } catch (error) {
      console.error("Error starting delivery:", error);
      alert("Có lỗi xảy ra khi bắt đầu giao hàng.");
    }
  };

  const handleDeliveryAction = async (status) => {
    try {
      let imageUrl = await uploadImage(selectedFile);
      const requestBody = {
        image: imageUrl || null,
        text: noteText || null,
      };

      await axios.post(
        `https://deploybackend-1ta9.onrender.com/shipperaccount/haveship/${orderHistory[0]?.id}/${status}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      getHistoryOrder();
      navigate("/shipperaccount/needship");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái giao hàng:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };
  useEffect(() => {
    getHistoryOrder();
  }, [id]);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTextChange = (event) => {
    setNoteText(event.target.value);
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "https://deploybackend-1ta9.onrender.com/api/v1/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.DT; // Link ảnh từ Firebase
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      alert("Không thể tải ảnh lên, vui lòng thử lại.");
      return null;
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
              <strong>Ship ID:</strong> {orderHistory[0].shippingID}
            </p>
            <p>
              <strong>Shipper ID:</strong> {orderHistory[0].shipperID}
            </p>
            <p>
              <strong>Họ Tên Shipper:</strong> {orderHistory[0].shipperName}
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

            {/* Nút Bắt đầu giao chỉ xuất hiện khi condition là In_Transit */}
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
      {orderHistory.length > 0 && (
        <div>
          <div className="order-action-container">
            {orderHistory[0].condition === "In Transit" && (
              <button
                className="start-delivery-button"
                onClick={handleStartDelivery}
              >
                Bắt đầu giao
              </button>
            )}
            {(orderHistory[0].condition === "Shipper Delivering" ||
              orderHistory[0].condition === "First Attempt Failed" ||
              orderHistory[0].condition === "Second Attempt Failed" ||
              orderHistory[0].condition === "Third Attempt Failed") && (
              <>
                <input type="file" onChange={handleFileChange} />
                <textarea
                  placeholder="Nhập ghi chú (tuỳ chọn)"
                  value={noteText}
                  onChange={handleTextChange}
                ></textarea>
                <div className="order-button-group">
                  <button
                    className="fail-delivery-button"
                    onClick={() => handleDeliveryAction("fail")}
                  >
                    Thất bại
                  </button>
                  <button
                    className="success-delivery-button"
                    onClick={() => handleDeliveryAction("success")}
                  >
                    Thành công
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderShippedDetail;
