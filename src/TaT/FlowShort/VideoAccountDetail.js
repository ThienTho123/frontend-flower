import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Volume2,
  VolumeX,
  Share2,
  MoreVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import "./VideoCard.css";
import { Modal } from "antd";
import { Link } from "react-router-dom";
import returnIcon from "../StaffDashboard/ImageDashboard/return-button.png";

const VideoAccountDetail = () => {
  const { id } = useParams();
  const [videoDTO, setVideoDTO] = useState(null);
  const [account, setAccount] = useState(null);
  const videoRef = useRef();
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState("next"); // Thêm state cho hướng
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentID, setCommentID] = useState(null);
  const [replyTo, setReplyTo] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const mediaUrl = videoDTO?.video.vid_url || "";
  const [isDeleteModalVideoVisible, setIsDeleteModalVideoVisible] =
    useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Thêm state

  const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);
  const isImage = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(mediaUrl);
  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `https://deploybackend-1ta9.onrender.com/flowshort/${id}`,
          { headers }
        );
        setAccount(response.data.account || {});
        setVideoDTO(response.data.videoDTO);
        console.log(response.data);
        setIsDataLoaded(true); // Đánh dấu dữ liệu đã load xong
      } catch (error) {
        console.error("Error fetching video detail:", error);
      }
    };

    fetchVideoDetail();
  }, [id, reload]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && videoDTO) {
      videoElement.muted = isMuted;
      videoElement.playsInline = true;
      videoElement
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Autoplay blocked:", err));

      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      videoElement.addEventListener("ended", handleVideoEnded);

      return () => {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        videoElement.removeEventListener("ended", handleVideoEnded);
      };
    }
  }, [videoDTO, isMuted]);

  useEffect(() => {
    const handleScroll = async (e) => {
      // Chỉ cho phép cuộn nếu modal không mở
      if (!isDataLoaded || !videoDTO || !videoDTO.video) return; // Đợi fetch xong

      try {
        const isNext = e.deltaY > 0;
        setDirection(isNext ? "next" : "prev");
        const accountid = videoDTO.video.accountID.accountID;
        console.log("accountID: ", accountid);
        const directionPath = isNext ? "next" : "prev";
        const response = await axios.get(
          `https://deploybackend-1ta9.onrender.com/flowshort/account/${accountid}/video/${id}/${directionPath}`
        );
        const nextVideoDTO = response.data;
        if (nextVideoDTO && nextVideoDTO.video.id) {
          navigate(`/flowshortaccount/${nextVideoDTO.video.id}`);
        }
      } catch (error) {
        console.error(
          `No ${e.deltaY > 0 ? "next" : "previous"} video available:`,
          error
        );
      }
    };

    window.addEventListener("wheel", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, [id, navigate, isCommentModalVisible, videoDTO, isDataLoaded]);

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

  const handleVideoEnded = async () => {
    try {
      await axios.get(
        `https://deploybackend-1ta9.onrender.com/flowshort/${id}/plusview`
      );
      console.log("View count increased");
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.play();
      }
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  const handleTimeUpdate = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement
          .play()
          .catch((err) => console.warn("Autoplay blocked:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };
  if (!videoDTO) return <div>Loading...</div>;

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const videoElement = videoRef.current;
    const newTime =
      (e.nativeEvent.offsetX / e.target.offsetWidth) * videoElement.duration;
    videoElement.currentTime = newTime;
  };

  const handleLike = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      Modal.warning({
        title: "Thông báo",
        content: "Bạn cần đăng nhập để thích video này!",
        footer: (
          <div style={{ textAlign: "center" }}>
            <button
              key="back"
              onClick={() => Modal.destroyAll()}
              style={{
                backgroundColor: "#f0f0f0",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                marginRight: "12px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Quay lại
            </button>
            <button
              key="login"
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#1677ff",
                color: "#fff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Đăng nhập
            </button>
          </div>
        ),
        closable: false,
      });
      return;
    }

    try {
      await axios.post(
        `https://deploybackend-1ta9.onrender.com/user/flowshort/video/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Cập nhật state reload để gọi lại useEffect
      setReload(!reload);
    } catch (error) {
      console.error("Lỗi khi gửi like:", error);
    }
  };
  const handleOpenComments = () => {
    setIsCommentModalVisible(true);
  };

  const handleCloseComments = () => {
    setIsCommentModalVisible(false);
  };
  const handleCommentLike = async (commentId) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      Modal.warning({
        title: "Thông báo",
        content: "Bạn cần đăng nhập để thích bình luận này!",
        onOk: () => navigate("/login"),
      });
      return;
    }

    try {
      await axios.post(
        `https://deploybackend-1ta9.onrender.com/user/flowshort/comment/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setReload(!reload); // Tải lại dữ liệu để cập nhật số lượt like
    } catch (error) {
      console.error("Lỗi khi gửi like:", error);
    }
  };

  const handleSendComment = async () => {
    if (commentText.trim() === "") return;
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      Modal.warning({
        title: "Thông báo",
        content: "Bạn cần đăng nhập để bình luận video này!",
        footer: (
          <div style={{ textAlign: "center" }}>
            <button
              key="back"
              onClick={() => Modal.destroyAll()}
              style={{
                backgroundColor: "#f0f0f0",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                marginRight: "12px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Quay lại
            </button>
            <button
              key="login"
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#1677ff",
                color: "#fff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Đăng nhập
            </button>
          </div>
        ),
        closable: false,
      });
      return;
    }

    try {
      const url = commentID
        ? `https://deploybackend-1ta9.onrender.com/user/flowshort/comment/${commentID}/comment`
        : `https://deploybackend-1ta9.onrender.com/user/flowshort/video/${videoDTO.video.id}/comment`;

      await axios.post(url, commentText, {
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Gửi comment thành công:", commentText);
    } catch (error) {
      console.error("Lỗi khi gửi comment:", error);
    }
    setReload(!reload);

    // Reset sau khi gửi
    setCommentText("");
    setCommentID(null);
    setReplyTo("");
  };

  const handleReplyClick = (comment) => {
    const authorName = comment.videoComment.accountID?.name || "Unknown";
    setCommentID(comment.videoComment.id);
    setReplyTo(authorName);
    setCommentText(`@${authorName} `); // Tự động điền @tên
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const { video } = videoDTO;

  // Cấu hình animation tùy theo hướng
  const animationVariants = {
    next: { opacity: 0, y: 50 },
    prev: { opacity: 0, y: -50 },
  };

  const exitVariants = {
    next: { opacity: 0, y: -50 },
    prev: { opacity: 0, y: 50 },
  };
  const openDeleteConfirmModal = (commentID) => {
    setCommentToDelete(commentID);
    setIsDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setCommentToDelete(null);
    setIsDeleteModalVisible(false);
  };

  const handleConfirmDelete = async () => {
    if (commentToDelete) {
      console.log("comID:", commentToDelete);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          handleCloseDeleteModal();
          return;
        }
        const response = await axios.delete(
          `https://deploybackend-1ta9.onrender.com/user/flowshort/comment/${commentToDelete}/delete`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setCommentToDelete(null);
          setIsDeleteModalVisible(false);
          setReload(!reload);
        } else {
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  const handleEditComment = (commentId) => {
    navigate(`/flowshort/edit/${commentId}`);
    setShowOptions(false);
  };

  const handleDisableComments = async (videoId) => {
    const accessToken = localStorage.getItem("access_token");
    try {
      await axios.put(
        `https://deploybackend-1ta9.onrender.com/user/flowshort/video/${videoId}/mute`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setShowOptions(false);
      setReload(!reload);
      console.log("Bình luận đã được tắt thành công.");
    } catch (error) {
      console.error("Lỗi khi tắt bình luận:", error);
    }
  };

  const openDeleteModalVideo = (commentId) => {
    setVideoToDelete(commentId);
    setIsDeleteModalVideoVisible(true);
    setShowOptions(false);
  };

  const handleCloseDeleteModalVideo = () => {
    setIsDeleteModalVideoVisible(false);
    setVideoToDelete(null);
  };

  const handleConfirmDeleteVideo = async () => {
    const accessToken = localStorage.getItem("access_token");
    try {
      await axios.delete(
        `https://deploybackend-1ta9.onrender.com/user/flowshort/${videoToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Đóng modal sau khi xóa thành công
      handleCloseDeleteModalVideo(); // <-- sửa ở đây
      navigate(`/flowshort`);
      console.log("Bài viết đã được xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
    }
  };
  function showCopyToast() {
    const toast = document.createElement("div");
    toast.className = "toast-copy";
    toast.innerText = "✅ Đã sao chép đường dẫn!";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  const handleBackToDashboard = () => {
    navigate(`/soflowshort/${video.accountID.accountID}`);
  };
  return (
    <div className="video-page-container">
      {/* Return Button */}
      <img
        src={returnIcon}
        alt="Quay Lại"
        className="video-return-button"
        onClick={handleBackToDashboard}
      />
      <motion.div
        key={id}
        className={`video-detail-container ${
          isCommentModalVisible ? "video-disabled" : ""
        }`}
        onClick={!isCommentModalVisible ? togglePlayPause : null}
        initial={animationVariants[direction]}
        animate={{ opacity: 1, y: 0 }}
        exit={exitVariants[direction]}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={video.vid_url}
            className="video-player"
            autoPlay
            playsInline
            muted={isMuted}
            onDoubleClick={handleLike}
          />
        ) : isImage ? (
          <img
            src={mediaUrl}
            alt="Media"
            className="image-player"
            onDoubleClick={handleLike}
          />
        ) : (
          <p>Unsupported media format</p>
        )}
        <div
          className="video-overlay-right"
          onClick={(e) => e.stopPropagation()}
        >
          {(account.accountID === videoDTO.video.accountID.accountID ||
            account.role === "admin" ||
            account.role === "staff") && (
            <div className="comment-options">
              <button
                className="action-btn"
                title="Options"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions((prev) => !prev);
                }}
              >
                <MoreVertical size={24} />
              </button>

              {showOptions && (
                <div className="comment-options-menu">
                  <button onClick={() => handleEditComment(videoDTO.video.id)}>
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDisableComments(videoDTO.video.id)}
                  >
                    {videoDTO.video.commentable === "NO"
                      ? "Mở bình luận"
                      : "Tắt bình luận"}
                  </button>
                  <button
                    onClick={() => openDeleteModalVideo(videoDTO.video.id)}
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          )}

          {isVideo && (
            <button
              className="action-btn"
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
            </button>
          )}

          <button
            className={`action-btn ${videoDTO?.liked ? "liked" : ""}`}
            title="Like"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <Heart size={32} color={videoDTO?.liked ? "hotpink" : "white"} />
            <span>{video.likes}</span>
          </button>

          <button
            className="action-btn"
            title="Comments"
            onClick={handleOpenComments}
          >
            <MessageCircle size={32} /> <span>{video.comments}</span>
          </button>
          <button
            className="action-btn"
            title="Share"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showCopyToast();
            }}
          >
            <Share2 size={32} />
          </button>
        </div>
        <Modal
          title="Bình luận"
          open={isCommentModalVisible}
          onCancel={handleCloseComments}
          footer={null}
          width={400}
          className="comment-modal"
        >
          <div className="comment-container">
            {/* Phần danh sách comment */}
            <div className="comment-list">
              {videoDTO?.videoCommentDTOS?.map((comment) => {
                const hasReplies =
                  comment.childComment && comment.childComment.length > 0;
                const showAll = expandedComments[comment.videoComment.id];
                const repliesToShow = showAll
                  ? comment.childComment
                  : comment.childComment?.slice(0, 1);
                const canDelete =
                  account.accountID ===
                    comment.videoComment.accountID.accountID ||
                  account.role === "admin" ||
                  account.role === "staff";

                return (
                  <div key={comment.videoComment.id} className="comment-item">
                    <div className="comment-author">
                      <img
                        src={
                          comment.videoComment.accountID?.avatar ||
                          "https://via.placeholder.com/40"
                        }
                        alt={
                          comment.videoComment.accountID?.name || "User avatar"
                        }
                        className="user-avatar"
                      />
                      <div className="author-info">
                        <span className="author-name">
                          {comment.videoComment.accountID?.name || "Unknown"}
                        </span>
                        <div className="comment-date">
                          {formatTimeAgo(comment.videoComment.dateTime)}
                        </div>
                      </div>
                    </div>
                    <p className="comment-text">
                      {comment.videoComment.comment}
                    </p>
                    <div className="comment-actions">
                      <button
                        className={`action-btn ${
                          comment.likeComment ? "liked" : ""
                        }`}
                        title="Like"
                        onClick={() =>
                          handleCommentLike(comment.videoComment.id)
                        }
                      >
                        <Heart
                          size={20}
                          color={comment.likeComment ? "hotpink" : "gray"}
                        />
                      </button>
                      <span className="like-count">
                        {comment.videoComment.like ?? 0}
                      </span>
                      <button
                        className="reply-btn"
                        onClick={() => handleReplyClick(comment)}
                      >
                        Phản hồi
                      </button>
                      {canDelete && (
                        <button
                          className="delete-btn"
                          onClick={() =>
                            openDeleteConfirmModal(comment.videoComment.id)
                          }
                        >
                          Xóa
                        </button>
                      )}
                      {hasReplies && (
                        <span
                          className="reply-count"
                          onClick={() => toggleReplies(comment.videoComment.id)}
                          style={{ cursor: "pointer", color: "#555" }}
                        >
                          {showAll
                            ? "Ẩn phản hồi"
                            : `${comment.childComment.length} phản hồi`}
                        </span>
                      )}
                    </div>

                    {repliesToShow && repliesToShow.length > 0 && (
                      <div className="comment-replies">
                        {repliesToShow.map((reply) => {
                          const canDeleteReply =
                            account.accountID ===
                              reply.videoComment.accountID.accountID ||
                            account.role === "admin" ||
                            account.role === "staff";

                          return (
                            <div
                              key={reply.videoComment.id}
                              className="reply-item"
                            >
                              <div className="reply-author">
                                <img
                                  src={
                                    reply.videoComment.accountID?.avatar ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt={
                                    reply.videoComment.accountID?.name ||
                                    "User avatar"
                                  }
                                  className="user-avatar"
                                />
                                <div className="reply-author-info">
                                  <span className="reply-author-name">
                                    {reply.videoComment.accountID?.name ||
                                      "Unknown"}
                                  </span>
                                  <div className="reply-date">
                                    {formatTimeAgo(
                                      comment.videoComment.dateTime
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="reply-text">
                                {reply.videoComment.comment}
                              </p>
                              <div className="reply-actions">
                                {/* Nút like cho comment con */}
                                <button
                                  className={`action-btn ${
                                    reply.likeComment ? "liked" : ""
                                  }`}
                                  title="Like"
                                  onClick={() =>
                                    handleCommentLike(reply.videoComment.id)
                                  }
                                >
                                  <Heart
                                    size={20}
                                    color={
                                      reply.likeComment ? "hotpink" : "gray"
                                    }
                                  />
                                </button>
                                <span className="reply-like-count">
                                  {reply.videoComment.like ?? 0}
                                </span>

                                {/* Nút phản hồi cho comment con */}
                                <button
                                  className="reply-btn"
                                  onClick={() => handleReplyClick(reply)}
                                >
                                  Phản hồi
                                </button>

                                {/* Nút xóa cho comment con */}
                                {canDeleteReply && (
                                  <button
                                    className="delete-btn"
                                    onClick={() =>
                                      openDeleteConfirmModal(
                                        reply.videoComment.id
                                      )
                                    }
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vùng nhập comment cố định */}
            {videoDTO?.video?.commentable === "YES" && (
              <div className="comment-input-container">
                {replyTo && (
                  <span
                    className="reply-to"
                    onClick={() => {
                      setCommentID(null);
                      setReplyTo("");
                      setCommentText(""); // Xóa nội dung khi hủy
                    }}
                  >
                    Đang trả lời <strong>{replyTo}</strong> (Nhấn để hủy)
                  </span>
                )}
                <textarea
                  value={commentText}
                  className="video-textarea"
                  onChange={(e) => {
                    const text = e.target.value;
                    setCommentText(text);

                    // Tự động hủy reply nếu xóa tên
                    if (replyTo && !text.startsWith(`@${replyTo} `)) {
                      setCommentID(null);
                      setReplyTo("");
                    }
                  }}
                  placeholder="Nhập bình luận..."
                />
                <button className="send-btn" onClick={handleSendComment}>
                  Gửi
                </button>
              </div>
            )}

            {/* Modal xác nhận xóa bình luận */}
            <Modal
              title="Xác nhận xóa"
              open={isDeleteModalVisible}
              onCancel={handleCloseDeleteModal}
              onOk={handleConfirmDelete}
              className="modal-confirm-delete"
              okText="Xóa"
              cancelText="Hủy"
            >
              Bạn có chắc chắn muốn xóa bình luận này không?
            </Modal>
          </div>
        </Modal>
        <Modal
          title="Xác nhận xóa"
          open={isDeleteModalVideoVisible}
          onCancel={handleCloseDeleteModalVideo}
          onOk={handleConfirmDeleteVideo}
          className="modal-confirm-delete"
          okText="Xóa"
          cancelText="Hủy"
        >
          Bạn có chắc chắn muốn xóa bài này không?
        </Modal>
        {isCommentModalVisible && <div className="comment-overlay"></div>}

        <div className="video-progress-container" onClick={handleSeek}>
          <div
            className="video-progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="video-caption" onClick={(e) => e.stopPropagation()}>
          <div className="user-info">
            <img
              src={video.accountID.avatar || "https://via.placeholder.com/40"}
              alt={video.accountID.name || "User avatar"}
              className="user-avatar"
            />
            <div className="user-info-name">
              <Link
                to={`/soflowshort/${video.accountID.accountID}`}
                className="user-name"
              >
                {video.accountID.name || "unknown"}
              </Link>
              <div className="reply-date">{formatTimeAgo(video.date)}</div>
            </div>
          </div>
          <p className="caption-text">{video.description}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoAccountDetail;
