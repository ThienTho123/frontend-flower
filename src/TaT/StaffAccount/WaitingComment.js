import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./SendComment.css";

const WaitingComment = () => {
  const [comments, setComments] = useState([]);
  const access_token = localStorage.getItem("access_token");
  const translateCondition = (stative) => {
    const translations = {
      Waiting: "Đang chờ xử lý",
      Processing: "Đang xử lý",
      Complete: "Đã hoàn thành",
    };
    return translations[stative] || stative;
  };
  const getCommentInfo = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-1ta9.onrender.com/staff",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawComment = response.data?.comment || [];
      console.log("RawComment " + rawComment.data);
      const updatedComment = rawComment.map((item, index) => ({
        stt: index + 1,
        id: item.commentID,
        commentType: item.commentType,
        date: dayjs(item.date).format("YYYY-MM-DD HH:mm:ss"),
        stative: item.stative,
        title: item.title,
        text: item.text,
        accountID: item.accountID,
      }));

      setComments(updatedComment);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    getCommentInfo();
  }, []);

  // Tạo một bình luận mới

  return (
    <div className="send-comment-container">
      <h2 className="comment-title">Các ý kiến đang chờ</h2>

      {/* Hiển thị danh sách bình luận */}
      <div className="comments-list">
        {comments.length > 0 ? (
          <table className="comments-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>ID góp ý</th>
                <th>ID Tài khoản</th>
                <th>Tên tài khoản</th>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td>{comment.stt}</td>
                  <td>
                    {/* Link tới trang chi tiết với id comment */}
                    <Link
                      to={`/staffaccount/comment/${comment.id}`}
                      className="comment-link"
                    >
                      {comment.id}
                    </Link>
                  </td>
                  <td>{comment.accountID.accountID}</td>
                  <td>{comment.accountID.name}</td>
                  <td>
                    {/* Link tới trang chi tiết với title */}
                    <Link
                      to={`/staffaccount/comment/${comment.id}`}
                      className="comment-link"
                    >
                      {comment.title.length > 20
                        ? `${comment.title.substring(0, 20)}...`
                        : comment.title}
                    </Link>
                  </td>
                  <td>
                    {comment.text.length > 50
                      ? `${comment.text.substring(0, 30)}...`
                      : comment.text}
                  </td>
                  <td>{translateCondition(comment.stative)}</td>
                  <td>{comment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không có bình luận nào.</p>
        )}
      </div>
    </div>
  );
};

export default WaitingComment;
