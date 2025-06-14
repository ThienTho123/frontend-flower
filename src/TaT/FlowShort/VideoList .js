import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  Eye,
  User,
  Clock,
  Video,
  Plus,
  ArrowLeft,
  Loader,
} from "lucide-react";
import "./VideoList.css";

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [showUserVideos, setShowUserVideos] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy thông tin xác thực từ localStorage (giống với AccountLayout)
  const access_token = localStorage.getItem("access_token");
  const accountID = localStorage.getItem("accountID");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all videos
        const videosResponse = await axios.get(
          "https://deploybackend-1ta9.onrender.com/flowshort"
        );
        setVideos(videosResponse.data.videos || []);

        // Kiểm tra xác thực (giống AccountLayout)
        if (accountID && access_token) {
          try {
            // Lấy thông tin người dùng từ API
            const userInfoResponse = await axios.get(
              "https://deploybackend-1ta9.onrender.com/account/getInfo",
              {
                params: { accountID },
                headers: { Authorization: `Bearer ${access_token}` },
              }
            );

            setUserInfo(userInfoResponse.data);

            // Lấy video của người dùng
            const userVideosResponse = await axios.get(
              "https://deploybackend-1ta9.onrender.com/user/flowshort/getall",
              {
                headers: { Authorization: `Bearer ${access_token}` },
              }
            );
            setUserVideos(userVideosResponse.data.videos || []);
          } catch (error) {
            console.error("Lỗi xác thực:", error);
            // Nếu token hết hạn hoặc không hợp lệ, chuyển hướng về trang đăng nhập
            navigate("/login");
          }
        } else {
          // Không có token hoặc accountID, hiển thị các video công khai
          console.log("Chưa đăng nhập, chỉ hiển thị video công khai");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountID, access_token, navigate]);

  const handleCreateVideo = () => {
    navigate("/flowshortupload");
  };

  const formatTimeAgo = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 6)
      return "Không xác định";

    const postDate = new Date(
      dateArray[0],
      dateArray[1] - 1,
      dateArray[2],
      dateArray[3],
      dateArray[4],
      dateArray[5]
    );

    if (isNaN(postDate.getTime())) return "Không xác định";

    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;

    return postDate.toLocaleDateString("vi-VN");
  };

  return (
    <div className="fs-flowshort-container">
      {/* Header */}
      <header className="fs-flowshort-header">
        <div className="fs-header-content">
          <div className="fs-header-logo">
            <Video className="fs-logo-icon" />
            <h1>Video</h1>
          </div>

          <div className="fs-header-actions">
            {userInfo && (
              <button
                onClick={() => setShowUserVideos(!showUserVideos)}
                className={`fs-toggle-btn ${showUserVideos ? "active" : ""}`}
              >
                {showUserVideos ? (
                  <>
                    <ArrowLeft size={18} />
                    <span>Tất cả Video</span>
                  </>
                ) : (
                  <>
                    <User size={18} />
                    <span>Video của tôi</span>
                  </>
                )}
              </button>
            )}

            {userInfo ? (
              <>
                <button onClick={handleCreateVideo} className="fs-create-btn">
                  <Plus size={18} />
                  <span>Tạo Video</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="fs-login-btn">
                Đăng nhập để tạo video
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* User Profile Banner (only when viewing user videos) */}
      {showUserVideos && userInfo && (
        <div className="fs-user-profile-banner">
          <div className="fs-banner-content">
            <div className="fs-profile-avatar">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} alt="Avatar" />
              ) : (
                <User size={32} />
              )}
            </div>
            <div className="fs-profile-info">
              <h2>{userInfo.name}</h2>
              <p className="fs-profile-email">#{userInfo.email}</p>
              <p className="fs-profile-stats">
                <span className="fs-stats-number">{userVideos.length}</span>{" "}
                video
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="fs-flowshort-content">
        {loading ? (
          <div className="fs-loading-container">
            <Loader className="fs-loading-spinner" />
            <p>Đang tải video...</p>
          </div>
        ) : (
          <>
            <h2 className="fs-section-title">
              {showUserVideos ? "Video của tôi" : "Khám phá Video"}
            </h2>

            {showUserVideos && userVideos.length === 0 && (
              <div className="fs-empty-state">
                <Video size={48} />
                <h3>Chưa có video nào</h3>
                <p>Bạn chưa tạo Video nào.</p>
                <button
                  onClick={handleCreateVideo}
                  className="fs-create-first-btn"
                >
                  Tạo Video Đầu Tiên
                </button>
              </div>
            )}

            <div className="fs-video-grid">
              {(showUserVideos ? userVideos : videos).map((video) => (
                <Link
                  to={
                    showUserVideos
                      ? `/myvideo/${video.id}`
                      : `/flowshort/${video.id}`
                  }
                  key={video.id}
                  className="fs-video-card"
                >
                  <div className="fs-thumbnail-container">
                    <img
                      src={
                        video.thumb_url || "https://via.placeholder.com/300x400"
                      }
                      alt={video.title || "Video thumbnail"}
                      loading="lazy"
                    />
                    <div className="fs-overlay">
                      <div className="fs-play-icon">
                        <Video />
                      </div>
                    </div>
                  </div>

                  <div className="fs-video-info">
                    <h3 className="fs-video-title">
                      {video.title || "Không có tiêu đề"}
                    </h3>

                    {video.description && (
                      <p className="fs-video-description">
                        {video.description}
                      </p>
                    )}

                    <div className="fs-video-stats">
                      <div className="fs-stat-item fs-likes">
                        <Heart size={16} />
                        <span>{video.likes || 0}</span>
                      </div>
                      <div className="fs-stat-item fs-views">
                        <Eye size={16} />
                        <span>{video.views || 0}</span>
                      </div>
                      <div className="fs-stat-item fs-date">
                        <Clock size={16} />
                        <span>{formatTimeAgo(video.date)}</span>
                      </div>
                    </div>

                    {video.accountID && (
                      <div className="fs-video-author">
                        <div className="fs-author-avatar">
                          {video.accountID.avatar ? (
                            <img src={video.accountID.avatar} alt="Avatar" />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <span>{video.accountID.name || "Không xác định"}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default VideoList;
