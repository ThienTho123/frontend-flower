import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./SendComment.css";

const SendComment = () => {
  const [comments, setComments] = useState([]);
  const [commentTypes, setCommentTypes] = useState([]);
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
  // Lấy thông tin danh sách bình luận và loại bình luận
  const getCommentInfo = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-1ta9.onrender.com/comment",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const rawComment = response.data?.comments || [];
      const rawTypeComment = response.data?.commentTypes || [];

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
      setCommentTypes(rawTypeComment);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    getCommentInfo();
  }, []);

  // Handle thay đổi hình ảnh
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Tạo một bình luận mới
  const handleCreateComment = async (e) => {
    e.preventDefault();

    // Upload hình ảnh nếu có
    let uploadedImage = image ? await uploadImage(image) : "";

    // Gửi dữ liệu bình luận (commentType là ID loại bình luận)
    const commentData = {
      commentType: commentType, // Gửi ID của loại bình luận
      title: title,
      text: text,
      image: uploadedImage,
    };

    try {
      const response = await axios.post(
        "https://deploybackend-1ta9.onrender.com/comment",
        commentData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        getCommentInfo(); // Cập nhật lại danh sách bình luận
        // Reset form sau khi gửi
        setTitle("");
        setText("");
        setCommentType(""); // Reset commentType
        setImage(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Có lỗi khi tạo bình luận");
    }
  };

  // Upload hình ảnh
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://deploybackend-1ta9.onrender.com/api/v1/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.EM === "success") {
        return response.data.DT; // Return the image link
      } else {
        console.log("Image upload failed:", response.data.EM);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="send-comment-container">
      <h2 className="comment-title">Danh sách góp ý</h2>

      {/* Hiển thị danh sách bình luận */}
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
                      to={`/account/sendcomment/${comment.id}`}
                      className="comment-link"
                    >
                      {comment.id}
                    </Link>
                  </td>
                  <td>
                    {/* Link tới trang chi tiết với title */}
                    <Link
                      to={`/account/sendcomment/${comment.id}`}
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

      {/* Form tạo góp ý */}
      <div className="create-comment-form">
        <h3>Tạo góp ý mới</h3>
        <form onSubmit={handleCreateComment}>
          <div className="form-group">
            <label htmlFor="commentType">Loại góp ý</label>
            <select
              id="commentType"
              value={commentType}
              onChange={(e) => setCommentType(e.target.value)}
              required
            >
              <option value="">Chọn loại góp ý</option>
              {commentTypes.map((type) => (
                <option key={type.commenttypeID} value={type.commenttypeID}>
                  {type.commenttypename}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Tiêu đề</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="text">Nội dung</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Chọn hình ảnh (tùy chọn)</label>
            <input type="file" id="image" onChange={handleImageChange} />
          </div>

          <button type="submit" className="submit-btn">
            Gửi góp ý
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendComment;
