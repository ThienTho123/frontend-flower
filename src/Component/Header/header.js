import React, { useState, useEffect } from "react";
import "./header.css";
import Logo from "../assets/logo.png";
import SearchIcon from "../assets/Search.svg";
import LoginIcon from "../assets/Login.svg";
import CartIcon from "../assets/Cart.svg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import NotificationIcon from "../assets/notification.png";
const Header = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Đồng bộ tên state là searchTerm
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const accountId = localStorage.getItem("accountID");
  const [cartCount, setCartCount] = useState(0);
  const accesstoken = localStorage.getItem("access_token");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const scrollToFooter = () => {
    const footer = document.getElementById("footer");
    if (footer) {
      const footerPosition =
        footer.getBoundingClientRect().top + window.scrollY;
      const startPosition = window.scrollY;
      const distance = footerPosition - startPosition;
      const duration = 1000;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = (t) => t * (2 - t);
        window.scrollTo(0, startPosition + distance * ease(progress));
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  const handleLoginClick = async () => {
    try {
      const response = await axios.get("http://localhost:8080/info", {
        headers: {
          "Account-ID": accountId,
        },
        withCredentials: true,
      });

      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      }
    } catch (error) {
      console.log("Đăng nhập thất bại:", error);
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      if (accesstoken) {
        try {
          const response = await axios.get("http://localhost:8080/prebuy", {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
              "Account-ID": accountId,
            },
            withCredentials: true,
          });

          if (response.status === 200) {
            const { cartorder, cartpreorder } = response.data;

            if (cartorder && cartpreorder) {
              // Tính tổng số lượng sản phẩm từ cả hai giỏ hàng
              const totalCartOrder = cartorder.reduce(
                (sum, item) => sum + item.number,
                0
              );
              const totalCartPreorder = cartpreorder.reduce(
                (sum, item) => sum + item.number,
                0
              );

              setCartCount(totalCartOrder + totalCartPreorder);
            } else {
              setCartCount(0); // Trường hợp dữ liệu không hợp lệ
            }
          } else {
            setCartCount(0); // Trường hợp API trả về status khác 200
          }
        } catch (error) {
          console.log("❌ Có lỗi xảy ra khi lấy giỏ hàng:", error);
          setCartCount(0); // Đặt giỏ hàng về 0 khi có lỗi
        }
      } else {
        setCartCount(0); // Nếu không có accessToken, giỏ hàng phải là 0
      }
    };

    fetchCartData();

    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket", // ✅ Đúng giao thức WebSocket
      reconnectDelay: 5000, // ✅ Tự động kết nối lại
    });

    stompClient.onConnect = () => {
      console.log("🟢 WebSocket Connected!");

      stompClient.subscribe("/topic/cart-update", (message) => {
        try {
          const data = JSON.parse(message.body);

          // Kiểm tra accountId hợp lệ trước khi cập nhật giỏ hàng
          if (accountId && data.accountId.toString() === accountId.toString()) {
            setCartCount(data.cartCount);
          } else {
            setCartCount(0); // Nếu không khớp accountId, giỏ hàng cũng về 0
          }
        } catch (error) {
          console.error("❌ Lỗi khi xử lý tin nhắn WebSocket:", error);
          setCartCount(0); // Nếu có lỗi khi xử lý dữ liệu từ WebSocket
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("❌ WebSocket STOMP Error:", frame);
      setCartCount(0); // Khi WebSocket gặp lỗi, đặt giỏ hàng về 0
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      console.log("🔴 WebSocket Disconnected");
    };
  }, [accesstoken, accountId]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await axios.get("http://localhost:8080/search", {
          params: { searchTerm }, // Truyền searchTerm đến backend
          headers: { "Account-ID": accountId },
        });

        navigate("/find", { state: { results: response.data } }); // Chuyển hướng với kết quả
        setError(null); // Xóa lỗi nếu có
      } catch (error) {
        setError("Không tìm thấy sản phẩm nào!");
        // Tự động xóa lỗi sau 3 giây
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  };

  const handlePrebuy = async () => {
    try {
      const response = await axios.get("http://localhost:8080/cart", {
        headers: {
          "Account-ID": accountId,
        },
        withCredentials: true,
      });

      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      }
    } catch (error) {
      console.log("Đăng nhập thất bại:", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (accesstoken) {
        try {
          const response = await axios.get(
            "http://localhost:8080/notification",
            {
              headers: { Authorization: `Bearer ${accesstoken}` },
              withCredentials: true,
            }
          );

          if (response.status === 200) {
            const notificationList = response.data.notificationList || [];
            setNotifications(notificationList);
            setUnreadCount(
              notificationList.filter((n) => n.notice === "NO").length
            );
          }
        } catch (error) {
          console.error("❌ Lỗi khi lấy thông báo:", error);
        }
      }
    };

    fetchNotifications();

    // Kết nối WebSocket để cập nhật thông báo real-time
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      console.log("🟢 WebSocket Thông báo Connected!");

      stompClient.subscribe("/topic/notifi-update", (message) => {
        try {
          const data = JSON.parse(message.body);
          if (accountId && data.accountId.toString() === accountId.toString()) {
            fetchNotifications(); // Lấy thông báo mới khi có cập nhật
          }
        } catch (error) {
          console.error("❌ Lỗi khi xử lý tin nhắn WebSocket:", error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("❌ WebSocket Thông báo STOMP Error:", frame);
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      console.log("🔴 WebSocket Thông báo Disconnected");
    };
  }, [accesstoken, accountId]);

  const openNotifications = async () => {
    try {
      await axios.post(
        "http://localhost:8080/notification/open",
        {},
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
          withCredentials: true,
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, notice: "YES" })));
      setUnreadCount(0);
    } catch (error) {
      console.error("❌ Lỗi khi mở thông báo:", error);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/notification/link/${id}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
          withCredentials: true,
        }
      );

      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      }
    } catch (error) {
      console.error("❌ Lỗi khi xử lý thông báo:", error);
    }
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
  return (
    <header className="header">
      <div className="header-top">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img src={Logo} alt="Logo" className="logo" />
          </Link>
        </div>
        <div className="links-container">
          <Link to="/product" className="header-link">
            Sản phẩm
          </Link>
          <Link to="/news" className="header-link">
            Tin tức
          </Link>
          <button onClick={scrollToFooter} className="header-link">
            Liên hệ
          </button>
          <Link to="/blog" className="header-link">
            Blog
          </Link>
        </div>
        <div className="icons-container">
          {/* Tìm kiếm */}
          <div className="search-container">
            <input
              type="text"
              value={searchTerm} // Sử dụng searchTerm ở đây
              onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật state
              placeholder="Tìm kiếm..."
              className="search-input"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Nhấn Enter để tìm kiếm
            />
            <button onClick={handleSearch} className="search-button">
              <img src={SearchIcon} alt="Search" className="icon search-icon" />
            </button>
            {error && <div className="error-message">{error}</div>}{" "}
            {/* Hiển thị lỗi nếu có */}
          </div>
          {/* Đăng nhập */}
          <button className="login-button" onClick={handleLoginClick}>
            <img src={LoginIcon} alt="Login" className="icon login-icon" />
          </button>

          {/* Giỏ hàng */}
          <button className="cart-button" onClick={handlePrebuy}>
            <img src={CartIcon} alt="Cart" className="icon cart-icon" />
            <span className="cart-count">{cartCount}</span>{" "}
            {/* Hiển thị số lượng giỏ hàng */}
          </button>

          <div className="notification-container">
            <button
              className={`notification-button ${
                showNotifications ? "active" : ""
              }`}
              onClick={() => {
                setShowNotifications(!showNotifications);
                openNotifications();
              }}
            >
              <img
                src={NotificationIcon}
                alt="Thông báo"
                className="icon notification-icon"
              />
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </button>

            {/* Danh sách thông báo */}
            {showNotifications && (
              <div className="notification-dropdown">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item 
    ${notif.notice === "NO" ? "important" : ""} 
    ${notif.seen === "NO" ? "unread" : ""}`}
                      onClick={() => handleNotificationClick(notif.id)}
                    >
                      <img
                        src={
                          notif.blogComment?.blog.account?.avatar ??
                          notif.blog?.account?.avatar ??
                          notif.comment?.accountID?.avatar ??
                          notif.preorder?.account?.avatar ??
                          notif.flower?.image ??
                          notif.order?.accountID?.avatar ??
                          "default-avatar.png" // Ảnh mặc định nếu tất cả đều null
                        }
                        alt="Thông báo"
                        className="notification-avatar"
                      />
                      <div className="notification-content">
                        <p>{notif.text}</p>
                        <span>{formatTimeAgo(notif.time)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">Không có thông báo</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </header>
  );
};

export default Header;
