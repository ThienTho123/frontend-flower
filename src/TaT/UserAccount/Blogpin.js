import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./HistoryOrder.css";
import { useNavigate } from "react-router-dom";

const BlogPin = () => {
  const access_token = localStorage.getItem("access_token");
  const [blogPin, setBlogPin] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const formatTimeAgo = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 6)
      return "Ngày không hợp lệ";

    const postDate = new Date(
      dateArray[0],
      dateArray[1] - 1,
      dateArray[2],
      dateArray[3],
      dateArray[4],
      dateArray[5]
    );

    if (isNaN(postDate.getTime())) return "Ngày không hợp lệ";

    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "1 phút trước";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;

    return postDate.toLocaleDateString("vi-VN");
  };

  const getHistoryOrder = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-1ta9.onrender.com/account/blogpin",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawOrder = response.data?.blogs || [];
      console.log(rawOrder);
      if (!Array.isArray(rawOrder)) {
        console.error("Order data is not an array:", rawOrder);
        setBlogPin([]);
        return;
      }

      const updatedOrder = rawOrder.map((item, index) => ({
        stt: index + 1,
        blogid: item.blogid,
        content: item.content,
        title: item.title,
        date: formatTimeAgo(item.date),
      }));

      setBlogPin(updatedOrder);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  const confirmCancelOrder = (order) => {
    setSelectedOrderId(order);
    setShowConfirm(true);
  };

  const handleCancelOrder = async (order) => {
    setShowConfirm(false);

    const requestBody = {
      blogid: order.blogid,
      commentid: null,
      comment: "",
      imageurl: [],
    };

    try {
      const response = await fetch(
        "https://deploybackend-1ta9.onrender.com/blog/pin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        console.log("Hủy ghim thành công");

        // Gọi lại API để cập nhật danh sách
        getHistoryOrder();
      } else {
        console.error("Lỗi khi gửi yêu cầu hủy ghim:", response.statusText);
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
    }
  };

  useEffect(() => {
    getHistoryOrder();
  }, []);

  return (
    <div className="table-container">
      <h2 className="history-title">Danh sách bài viết đã ghim</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Số thứ tự</th>
            <th>ID</th>
            <th>Tiêu đề</th>
            <th>Nội dung</th>
            <th>Ngày đăng</th>
            <th>Hủy ghim</th>
          </tr>
        </thead>
        <tbody>
          {blogPin.length > 0 ? (
            blogPin.map((order) => (
              <tr key={order.blogid}>
                <td>{order.stt}</td>
                <td>
                  <a href={`/blog/${order.blogid}`} className="history-link">
                    {order.blogid}
                  </a>
                </td>
                <td title={order.title}>
                  {order.title.length > 30
                    ? order.title.slice(0, 30) + "..."
                    : order.title}
                </td>{" "}
                <td title={order.content}>
                  {order.content.length > 30
                    ? order.content.slice(0, 30) + "..."
                    : order.content}
                </td>
                <td>{order.date}</td>
                <td>
                  <button
                    className="cancel-btn"
                    onClick={() => confirmCancelOrder(order)}
                  >
                    Hủy
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Không có bài viết nào được ghim.</td>
            </tr>
          )}
        </tbody>
      </table>

      {showConfirm && (
        <div className="modal">
          <div className="modal-content">
            <p>Bạn có chắc chắn muốn gỡ ghim bài viết này?</p>
            <button
              className="confirm-btn"
              onClick={() => handleCancelOrder(selectedOrderId)}
            >
              Xác nhận
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowConfirm(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Đã gỡ ghim!</p>
            <button
              className="confirm-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPin;
