import React, { useState } from 'react';
import './header.css';
import Logo from '../assets/logo.png';
import SearchIcon from '../assets/Search.svg';
import LoginIcon from '../assets/Login.svg';
import CartIcon from '../assets/Cart.svg';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

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

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const response = await axios.get("http://localhost:8080/search", {
          params: { searchTerm: searchQuery },
        });
        navigate("/find", { state: { results: response.data } });
        setError(null);
      } catch (error) {
        setError("Không tìm thấy sản phẩm nào!");
      }
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
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="search-input"
            />
            <button onClick={handleSearch}>
              <img src={SearchIcon} alt="Search" className="icon search-icon" />
            </button>
          </div>
          <Link to="/login">
            <img src={LoginIcon} alt="Login" className="icon login-icon" />
          </Link>
          <Link to="/prebuy">
            <img src={CartIcon} alt="Cart" className="icon cart-icon" />
          </Link>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </header>
  );
};

export default Header;
