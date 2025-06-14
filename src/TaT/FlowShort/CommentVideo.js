import React, { useState, useEffect } from "react";
import { Card, Modal } from "react-bootstrap";
import { FaThumbsUp, FaComment, FaThumbtack, FaReply } from "react-icons/fa";
import { Link } from "react-router-dom";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { style } from "react-toastify";

const CommentVideo = ({ comment, onAction }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const accesstoken = localStorage.getItem("access_token");
  const [selectedCommentImage, setSelectedCommentImage] = useState(null);
  const [currentCommentImageIndex, setCurrentCommentImageIndex] = useState(0);
  const [currentCommentImages, setCurrentCommentImages] = useState([]);
  const [isLiked, setIsLiked] = useState();
  const [countLiked, setCountLiked] = useState();
  const [visibleReplies, setVisibleReplies] = useState(0);
  const [isCommentable, setIsCommentable] = useState(true);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!accesstoken) return;

      try {
        const response = await fetch(
          `https://deploybackend-1ta9.onrender.com/flowshort`,
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
          if (Array.isArray(data.videoDTO) && data.videoDTO.length > 0) {
            let foundLikeStatus = false;
            let foundCountLike = 0;

            data.videoDTO.forEach((video) => {
              if (!video.videoCommentDTOS) return;

              video.videoCommentDTOS.forEach((cmt) => {
                if (cmt.videoComment.id === comment.videoComment.id) {
                  foundLikeStatus = cmt.likeComment ?? false;
                  foundCountLike = cmt.videoComment.like ?? 0;
                }
                if (cmt.childComment && cmt.childComment.length > 0) {
                  cmt.childComment.forEach((child) => {
                    if (child.videoComment.id === comment.videoComment.id) {
                      foundLikeStatus = child.likeComment ?? false;
                      foundCountLike = child.videoComment.like ?? 0;
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
  }, [comment.videoComment.id, accesstoken]);

  const handleLikeCommentClick = async () => {
    if (!accesstoken) {
      setOpenDialog(true);
      return;
    }

    // Xác định giá trị mới của like
    const newIsLiked = !(isLiked ?? false);

    const newCountLiked = newIsLiked
      ? (countLiked ?? comment.videoComment.like ?? 0) + 1
      : Math.max(0, (countLiked ?? comment.videoComment.like ?? 0) - 1);

    // Cập nhật UI ngay lập tức
    setIsLiked(newIsLiked);
    setCountLiked(newCountLiked);

    const requestBody = {
      comment: "",
    };

    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/user/flowshort/comment/${comment.videoComment.id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
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
          src={comment.videoComment.accountID.avatar}
          alt="User Avatar"
          className="avatar"
        />
        <Link
          to={`/comment/${comment.videoComment.id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "600",
          }}
        >
          <span>{comment.videoComment.accountID.name}</span>
        </Link>
        <span className="comment-time">
          {formatTimeAgo(comment.videoComment.dateTime)}
        </span>
      </div>
      <p>{comment.videoComment.comment}</p>

      {/* Hiển thị ảnh trong bình luận */}
      {comment.videoImages && comment.videoImages.length > 0 && (
        <div className="comment-images">
          {comment.videoImages.map((img, index) => (
            <img
              key={index}
              src={img.url}
              alt="Comment"
              className="comment-img"
              onClick={() => openCommentImageModal(comment.videoImages, index)}
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
            {countLiked ?? comment.videoComment.like})
          </span>
        </button>
        <button
          onClick={() =>
            onAction(
              comment.videoComment.id,
              comment.videoComment.accountID.name
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
            <CommentVideo
              key={child.videoComment.id}
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

export default CommentVideo;
