import React, { useState } from 'react';
import './header.css';
import Logo from '../assets/logo.png';
import SearchIcon from '../assets/Search.svg';
import LoginIcon from '../assets/Login.svg';
import CartIcon from '../assets/Cart.svg';
import { Link } from 'react-router-dom';  

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
          <a href="#about" className="header-link">Sản phẩm</a>
          <a href="#home" className="header-link">Tin tức</a>
          <a href="#contact" className="header-link">Liên hệ</a>        
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
          </div>
          <img src={SearchIcon} alt="Search" className="icon search-icon" />
          <Link to="/login">
            <img src={LoginIcon} alt="Login" className="icon login-icon" />
          </Link>
          <Link to="/prebuy">
            <img src={CartIcon} alt="Cart" className="icon cart-icon" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
