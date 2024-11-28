import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "./SendCommentDetail.css"; // Import file CSS

const SendCommentDetail = () => {
  const access_token = localStorage.getItem("access_token");
  const { id } = useParams();
  const [comment, setComment] = useState(null);
  const [repComments, setRepComments] = useState([]);
  const [image, setImage] = useState(null);
  const [repCommentText, setRepCommentText] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmitRepComment = async () => {
    if (!repCommentText.trim()) {
      alert("Bạn chưa nhập bình luận!");
      return;
    }
    setLoading(true);
    let imageUrl = null;

    if (image) {
      imageUrl = await uploadImage(image);
    }

    const repCommentDTO = {
      repcommenttext: repCommentText,
      image: imageUrl,
    };

    try {
      const response = await axios.post(
        `http://localhost:8080/comment/${id}`,
        repCommentDTO,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (response.status === 200) {
        getCommentDetail();
        setRepCommentText("");
        setImage(null);
      } else {
        alert("Có lỗi xảy ra khi gửi bình luận!");
      }
    } catch (error) {
      console.error("Error posting reply comment:", error);
      alert("Không thể gửi bình luận trả lời.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/upload",
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

  const getCommentDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/comment/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const rawCommentDetail = response.data?.commentDTO;

      if (!rawCommentDetail) {
        console.error("Không có dữ liệu bình luận");
        return;
      }

      const {
        commentType,
        commentID,
        commentTitle,
        commentText,
        commentDate,
        commentStatus,
        commentStative,
        image,
        repComments,
      } = rawCommentDetail;

      setComment({
        commentType,
        commentID,
        commentTitle,
        commentText,
        commentDate: dayjs(commentDate).format("YYYY-MM-DD HH:mm:ss"),
        commentStatus,
        commentStative,
        image,
      });

      setRepComments(
        repComments.map((repComment) => ({
          ...repComment,
          avatarRep: repComment.avatarRep,
          repcommentDate: dayjs(repComment.repcommentDate).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
        }))
      );
    } catch (error) {
      console.error("Error fetching comment details:", error);
    }
  };

  useEffect(() => {
    getCommentDetail();
  }, [id]);

  return (
    <div className="comment-container">
      <div className="comment-details">
        <h2>{comment?.commentTitle}</h2>
        <p>{comment?.commentText}</p>
        <p>
          <strong>Ngày tạo:</strong> {comment?.commentDate}
        </p>
        <p>
          <strong>Loại:</strong> {comment?.commentType}
        </p>
        <p>
          <strong>Trạng thái:</strong> {comment?.commentStative}
        </p>

        {comment?.image && (
          <img src={comment.image} alt="Comment" className="comment-image" />
        )}
      </div>

      <div className="repcomments">
        <h3>Các bình luận trả lời:</h3>
        <ul>
          {repComments.map((repComment) => (
            <li key={repComment.repcommentID} className="repcomment-item">
              <div className="repcomment-header">
                <img
                  src={repComment.avatarRep || "https://via.placeholder.com/40"}
                  alt="Avatar"
                  className="repcomment-avatar"
                />
                <div>
                  <p className="repcomment-name">
                    <strong>{repComment.accountName}</strong>
                  </p>
                  <p className="repcomment-time">{repComment.repcommentDate}</p>
                </div>
              </div>
              <p>{repComment.repcommentText}</p>
              {repComment.image && (
                <img
                  src={repComment.image}
                  alt="RepComment"
                  className="repcomment-image"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
      {comment?.commentStative === "Processing" && (
        <div className="rep-comment-form">
          <textarea
            placeholder="Nhập bình luận trả lời..."
            value={repCommentText}
            onChange={(e) => setRepCommentText(e.target.value)}
          />
          <input type="file" onChange={handleImageChange} />
          <button onClick={handleSubmitRepComment} disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi bình luận trả lời"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SendCommentDetail;
