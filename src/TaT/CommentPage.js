import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CommentItem from "./CommentBlog";
import returnIcon from "../TaT/StaffDashboard/ImageDashboard/return-button.png";
import { Link } from "react-router-dom";

const CommentPage = () => {
  const { id } = useParams(); // Lấy id từ URL
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const accesstoken = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `https://deploybackend-1ta9.onrender.com/blog/comment/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );

        console.log("Dữ liệu từ API:", response.data); // Xem API trả về gì

        // Kiểm tra response.data.blogCommentDTO có phải là một mảng không
        if (Array.isArray(response.data.blogCommentDTO)) {
          setComments(response.data.blogCommentDTO);
        } else {
          console.error(
            "Lỗi: blogCommentDTO không phải là một mảng!",
            response.data.blogCommentDTO
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải bình luận:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  return (
    <div className="comment-page">
      {comments.length > 0 && comments[0].blogComment?.blog?.blogid && (
        <Link to={`/blog/${comments[0].blogComment.blog.blogid}`}>
          <img
            src={returnIcon}
            alt="Quay Lại"
            className="return-button"
            style={{ cursor: "pointer" }} // Hiển thị con trỏ khi hover
          />
        </Link>
      )}
      <h2>
        Bình luận cho bài viết #
        {comments.length > 0 ? comments[0].blogComment.blog.blogid : "..."}
      </h2>
      {comments.length > 0 ? (
        comments.map((comment) => {
          console.log("Render comment:", comment);
          return (
            <CommentItem
              key={comment.blogComment?.blogcommentid}
              comment={comment}
              onAction={() => console.log("Action")}
            />
          );
        })
      ) : (
        <p>Không có bình luận nào.</p>
      )}
    </div>
  );
};

export default CommentPage;
