import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./SendComment.css";

const NeedShip = () => {
  const [comments, setComments] = useState([]);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [commentType, setCommentType] = useState(""); // ID loại góp ý
  const access_token = localStorage.getItem("access_token");
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
  const getCommentInfo = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-j61h.onrender.com/shipperaccount/haveship",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Kiểm tra nếu orderList không tồn tại
      const rawComment = response.data?.orderList || [];
      console.log("rawComment", rawComment);
      const updatedComment = rawComment.map((item, index) => ({
        stt: index + 1,
        id: item.orderID,
        paid: item.paid,
        date: dayjs(item.date).format("YYYY-MM-DD HH:mm:ss"),
        condition: item.condition,
        name: item.name,
        note: item.note,
        phoneNumber: item.phoneNumber,
        deliveryAddress: item.deliveryAddress,
        totalAmount: item.totalAmount,
        orderDetails: item.orderDetails,
        status: item.status,
      }));

      setComments(updatedComment);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    getCommentInfo();
  }, []);

  return (
    <div className="send-comment-container">
      <h2 className="comment-title">Các đơn hàng đang cần được giao</h2>

      {/* Hiển thị danh sách bình luận */}
      <div className="comments-list">
        {comments.length > 0 ? (
          <table className="comments-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>ID</th>
                <th>Tên</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td>{comment.stt}</td>
                  <td>
                    <Link
                      to={`/shipperaccount/ordershipped/${comment.id}`}
                      className="comment-link"
                    >
                      {comment.id}
                    </Link>
                  </td>
                  <td>{comment.name}</td>

                  <td>{comment.phoneNumber}</td>

                  <td>{comment.deliveryAddress}</td>
                  <td>{translateCondition(comment.condition)}</td>
                  <td>
                    <Link
                      to={`/shipperaccount/ordershipped/${comment.id}`}
                      className="comment-link"
                    >
                      Xem
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không có đơn hàng nào.</p>
        )}
      </div>
    </div>
  );
};

export default NeedShip;
