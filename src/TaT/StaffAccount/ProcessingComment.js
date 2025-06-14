import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./SendComment.css";

const ProcessingComment = () => {
  const [comments, setComments] = useState([]);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [commentType, setCommentType] = useState(""); // ID loại góp ý
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
        "https://deploybackend-1ta9.onrender.com/staffaccount/commentprocess",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawComment = response.data?.comment || [];

      const updatedComment = rawComment.map((item, index) => ({
        stt: index + 1,
        id: item.commentID,
        commentType: item.commentType,
        date: dayjs(item.date).format("YYYY-MM-DD HH:mm:ss"),
        stative: item.stative,
        title: item.title,
        text: item.text,
        numberRep: item.numberRep,
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
      <h2 className="comment-title">Các ý kiến đang giải quyết</h2>
      <div className="comments-list">
        {comments.length > 0 ? (
          <table className="comments-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th>Số lượt trả lời</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td>{comment.stt}</td>
                  <td>
                    <Link
                      to={`/staffaccount/comment/${comment.id}`}
                      className="comment-link"
                    >
                      {comment.id}
                    </Link>
                  </td>
                  <td>
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
                  <td>{comment.numberRep}</td>
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
export default ProcessingComment;
