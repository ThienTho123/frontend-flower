import React, { useState } from 'react';
import './header.css';
import Logo from '../assets/logo.png';
import SearchIcon from '../assets/Search.svg';
import LoginIcon from '../assets/Login.svg';
import CartIcon from '../assets/Cart.svg';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
        <div className="links-container">
          <a href="#home" className="header-link">Home</a>
          <a href="#about" className="header-link">About</a>
          <a href="#contact" className="header-link">Contact</a>
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
          <img src={LoginIcon} alt="Login" className="icon login-icon" />
          <img src={CartIcon} alt="Cart" className="icon cart-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
