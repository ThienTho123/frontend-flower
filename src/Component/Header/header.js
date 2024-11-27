import React, { useState, useEffect } from "react";
import './header.css';
import Logo from '../assets/logo.png';
import SearchIcon from '../assets/Search.svg';
import LoginIcon from '../assets/Login.svg';
import CartIcon from '../assets/Cart.svg';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Đồng bộ tên state là searchTerm
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const accountId = localStorage.getItem("accountID");
  const [cartCount, setCartCount] = useState(0); 
  const accesstoken = localStorage.getItem("access_token");

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
            const { cart } = response.data;
            setCartCount(cart.length);
          }

          if (response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
          }
        } catch (error) {
          console.log("Có lỗi xảy ra khi lấy giỏ hàng:", error);
        }
      }
    };

    fetchCartData();
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

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img src={Logo} alt="Logo" className="logo" />
          </Link>
        </div>
        <div className="links-container">
          <Link to="/product" className="header-link">Sản phẩm</Link>
          <Link to="/news" className="header-link">Tin tức</Link>
          <button onClick={scrollToFooter} className="header-link">
            Liên hệ
          </button>
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
          {error && <div className="error-message">{error}</div>} {/* Hiển thị lỗi nếu có */}
        </div>
          {/* Đăng nhập */}
          <button className="login-button" onClick={handleLoginClick}>
            <img src={LoginIcon} alt="Login" className="icon login-icon" />
          </button>

          {/* Giỏ hàng */}
          <button className="cart-button" onClick={handlePrebuy}>
            <img src={CartIcon} alt="Cart" className="icon cart-icon" />
            <span className="cart-count">{cartCount}</span> {/* Hiển thị số lượng giỏ hàng */}
          </button>

        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </header>
  );
};

export default Header;
