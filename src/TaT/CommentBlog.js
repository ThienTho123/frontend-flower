import React, { useState, useEffect } from "react";
import LazyLoad from "react-lazy-load";
import { Card, Modal } from "react-bootstrap";
import "./Blog.css";
import { FaThumbsUp, FaComment, FaThumbtack, FaReply } from "react-icons/fa";
import useBootstrap from "./useBootstrap";
import { Link } from "react-router-dom";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { style } from "react-toastify";

const CommentItem = ({ comment, onAction }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const accesstoken = localStorage.getItem("access_token");
  const [selectedCommentImage, setSelectedCommentImage] = useState(null);
  const [currentCommentImageIndex, setCurrentCommentImageIndex] = useState(0);
  const [currentCommentImages, setCurrentCommentImages] = useState([]);
  const [isLiked, setIsLiked] = useState();
  const [countLiked, setCountLiked] = useState();
  const [visibleReplies, setVisibleReplies] = useState(0);
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!accesstoken) return;

      try {
        const response = await fetch(
          `https://deploybackend-1ta9.onrender.com/blog`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.BlogInfo) && data.BlogInfo.length > 0) {
            let foundLikeStatus = false;
            let foundCountLike = 0;

            data.BlogInfo.forEach((blog) => {
              if (!blog.blogCommentDTOS) return;

              blog.blogCommentDTOS.forEach((cmt) => {
                if (
                  cmt.blogComment.blogcommentid ===
                  comment.blogComment.blogcommentid
                ) {
                  foundLikeStatus = cmt.likeComment ?? false;
                  foundCountLike = cmt.blogComment.like ?? 0;
                }
                if (cmt.childComment && cmt.childComment.length > 0) {
                  cmt.childComment.forEach((child) => {
                    if (
                      child.blogComment.blogcommentid ===
                      comment.blogComment.blogcommentid
                    ) {
                      foundLikeStatus = child.likeComment ?? false;
                      foundCountLike = child.blogComment.like ?? 0;
                    }
                  });
                }
              });
            });

            setIsLiked(foundLikeStatus);
            setCountLiked(foundCountLike);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái like:", error);
      }
    };

    fetchLikeStatus();
  }, [comment.blogComment.blogcommentid, accesstoken]);

  const handleLikeCommentClick = async () => {
    if (!accesstoken) {
      setOpenDialog(true);
      return;
    }

    // Xác định giá trị mới của like
    const newIsLiked = !(isLiked ?? false);

    const newCountLiked = newIsLiked
      ? (countLiked ?? comment.blogComment.like ?? 0) + 1
      : Math.max(0, (countLiked ?? comment.blogComment.like ?? 0) - 1);

    // Cập nhật UI ngay lập tức
    setIsLiked(newIsLiked);
    setCountLiked(newCountLiked);

    const requestBody = {
      blogid: null,
      commentid: comment.blogComment.blogcommentid,
      comment: "",
      imageurl: [],
    };

    try {
      const response = await fetch(
        "https://deploybackend-1ta9.onrender.com/blog/like",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi phản hồi từ server");
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);

      // Nếu request lỗi, rollback trạng thái cũ
      setIsLiked((prev) => !prev);
      setCountLiked((prev) => (newIsLiked ? prev - 1 : prev + 1));
    }
  };

  const openCommentImageModal = (images, index) => {
    setCurrentCommentImages(images);
    setCurrentCommentImageIndex(index);
    setSelectedCommentImage(images[index].image);
  };

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

  const closeCommentImageModal = () => {
    setSelectedCommentImage(null);
  };

  const nextCommentImage = () => {
    const newIndex =
      (currentCommentImageIndex + 1) % currentCommentImages.length;
    setCurrentCommentImageIndex(newIndex);
    setSelectedCommentImage(currentCommentImages[newIndex].image);
  };

  const prevCommentImage = () => {
    const newIndex =
      (currentCommentImageIndex - 1 + currentCommentImages.length) %
      currentCommentImages.length;
    setCurrentCommentImageIndex(newIndex);
    setSelectedCommentImage(currentCommentImages[newIndex].image);
  };

  const handleShowMoreReplies = () => {
    setVisibleReplies((prev) => prev + 2);
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <img
          src={comment.blogComment.account.avatar}
          alt="User Avatar"
          className="avatar"
        />
        <Link
          to={`/comment/${comment.blogComment.blogcommentid}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "600",
          }}
        >
          <span>{comment.blogComment.account.name}</span>
        </Link>
        <span className="comment-time">
          {formatTimeAgo(comment.blogComment.date)}
        </span>
      </div>
      <p>{comment.blogComment.comment}</p>

      {/* Hiển thị ảnh trong bình luận */}
      {comment.blogImages && comment.blogImages.length > 0 && (
        <div className="comment-images">
          {comment.blogImages.map((img, index) => (
            <img
              key={index}
              src={img.image}
              alt="Comment"
              className="comment-img"
              onClick={() => openCommentImageModal(comment.blogImages, index)}
            />
          ))}
        </div>
      )}
      <div className="buttongroup">
        <button
          className={isLiked ? "liked" : ""}
          onClick={handleLikeCommentClick}
        >
          <FaThumbsUp />{" "}
          <span>
            {isLiked ? "Đã thích" : "Thích"} (
            {countLiked ?? comment.blogComment.like})
          </span>
        </button>
        <button
          onClick={() =>
            onAction(
              comment.blogComment.blogcommentid,
              comment.blogComment.account.name
            )
          }
        >
          <span>Phản hồi</span>
        </button>
      </div>

      {/* Hiển thị danh sách phản hồi nếu có */}
      {comment.childComment?.length > 0 && (
        <div className="child-comments">
          {comment.childComment.slice(0, visibleReplies).map((child) => (
            <CommentItem
              key={child.blogComment.blogcommentid}
              comment={child}
              onAction={onAction}
            />
          ))}

          {/* Nút hiển thị thêm phản hồi */}
          {visibleReplies < comment.childComment.length && (
            <button onClick={handleShowMoreReplies} className="show-more-btn">
              {visibleReplies === 0
                ? `${comment.childComment.length} phản hồi`
                : "Hiển thị thêm phản hồi"}
            </button>
          )}
        </div>
      )}

      {/* Modal xem ảnh */}
      <Modal
        show={selectedCommentImage !== null}
        onHide={closeCommentImageModal}
        centered
      >
        <Modal.Body className="text-center">
          <button className="modal-close-btn" onClick={closeCommentImageModal}>
            ✖
          </button>
          <button className="modal-prev-btn" onClick={prevCommentImage}>
            ◀
          </button>
          <img
            src={selectedCommentImage}
            alt="Phóng to"
            className="img-fluid modal-image"
          />
          <button className="modal-next-btn" onClick={nextCommentImage}>
            ▶
          </button>
        </Modal.Body>
      </Modal>

      {/* Dialog thông báo đăng nhập */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Thông báo</DialogTitle>
        <DialogContent>
          Bạn cần đăng nhập để tương tác với bài viết.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Đóng
          </Button>
          <Button
            onClick={() => (window.location.href = "/login")}
            color="primary"
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CommentItem;
