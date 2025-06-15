import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  Eye,
  User,
  Clock,
  Video,
  ArrowLeft,
  Loader,
  Plus,
} from "lucide-react";
import "./VideoList.css"; // Reusing the same CSS

const UserVideoList = () => {
  const { accountId } = useParams();
  const [videos, setVideos] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState(""); // Lưu URL API để kiểm tra
  const navigate = useNavigate();

  // Lấy thông tin xác thực từ localStorage
  const access_token = localStorage.getItem("access_token");
  const loggedInAccountID = localStorage.getItem("accountID");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Tạo URL API
      const url = `https://deploybackend-j61h.onrender.com/flowshort/account/${accountId}`;
      setApiUrl(url); // Lưu URL để hiển thị

      try {
        // Fetch user's videos và thông tin user từ cùng một API
        const response = await axios.get(url);
        console.log("API Response:", response.data); // In response để kiểm tra

        // Lấy thông tin user từ response
        setUserInfo(response.data.account || {});

        // Lấy danh sách video từ response
        setVideos(response.data.videos || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  const handleBackToVideos = () => {
    navigate("/flowshort");
  };

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

  // Kiểm tra xem người dùng đang xem có phải là chính họ không
  const isOwnProfile = loggedInAccountID === accountId;

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
            <button onClick={handleBackToVideos} className="fs-toggle-btn">
              <ArrowLeft size={18} />
              <span>Tất cả Video</span>
            </button>

            {isOwnProfile && (
              <button onClick={handleCreateVideo} className="fs-create-btn">
                <Plus size={18} />
                <span>Tạo Video</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* User Profile Banner */}
      {userInfo && (
        <div className="fs-user-profile-banner">
          <div className="fs-banner-content">
            <div className="fs-profile-avatar">
              {videos[0].accountID.avatar ? (
                <img src={videos[0].accountID.avatar} alt="Avatar" />
              ) : (
                <User size={32} />
              )}
            </div>
            <div className="fs-profile-info">
              <h2>
                {videos[0].accountID.name || videos[0].accountID.username}
              </h2>
              <p className="fs-profile-email">#{videos[0].accountID.email}</p>
              <p className="fs-profile-stats">
                <span className="fs-stats-number">{videos.length}</span> video
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
              Video của {userInfo?.name || "người dùng"}
            </h2>

            {videos.length === 0 && (
              <div className="fs-empty-state">
                <Video size={48} />
                <h3>Chưa có video nào</h3>
                <p>Người dùng này chưa đăng video nào.</p>
                <button
                  onClick={handleBackToVideos}
                  className="fs-create-first-btn"
                >
                  Quay lại trang Video
                </button>
              </div>
            )}

            <div className="fs-video-grid">
              {videos.map((video) => (
                <Link
                  to={`/flowshortaccount/${video.id}`}
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

export default UserVideoList;
