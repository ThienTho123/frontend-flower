// src/HomePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "./Home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageHome from '../assets/RectangleHome.png'; 

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [news, setNews] = useState([]);
  const [SPProducts, setHotProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/homepage");
        console.log(response.data);
        setBanners(response.data.bannerList);
        setHotProducts(response.data.productList);
        setNews(response.data.newsList);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}
      
      <Slider {...settings} className="banner-slider">
        {banners.map((banner) => (
          <div key={banner.bannerID} className="banner">
            <a
              href={
                banner.productID?.productID
                  ? `/detail/${banner.productID.productID}`
                  : banner.productTypeID?.productTypeID
                  ? `/product?productType=${banner.productTypeID.productTypeID}`
                  : `/product?category=${banner.categoryID?.categoryID}`
              }
            >
              <img
                src={banner.bannerImage}
                alt={banner.title}
                className="banner-image"
              />
            </a>
          </div>
        ))}
      </Slider>
      
      <div className="legit-container">
        <div className="policies-box">
          <div className="policy-item">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3706/3706340.png"
              alt="Miễn phí vận chuyển"
              className="legit-image"
            />
            <span>Miễn phí vận chuyển</span>
          </div>
          <div className="policy-item">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4098/4098381.png"
              alt="Hoa tươi mọi ngày"
              className="legit-image"
            />
            <span>Hoa tươi mọi ngày</span>
          </div>
          <div className="policy-item">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2769/2769339.png"
              alt="Giao quà tận nơi"
              className="legit-image"
            />
            <span>Giao quà tận nơi</span>
          </div>
        </div>
      </div>

      <h2 className="featured-title">Sản phẩm nổi bật</h2>
      <div className="product-container">
        {SPProducts.map((product) => (
          <div key={product.productID} className="product">
            <a href={`/detail/${product.productID}`}>
              <img src={product.avatar} alt={product.title} />
              <h3>{product.title}</h3>
              <p style={{ color: "red" }}>{product.price} đ</p>
              <p className="sold-quantity" style={{ fontSize: "0.8rem" }}>
                Đã bán: {product.sold}
              </p>
            </a>
          </div>
        ))}
      </div>

      {/* Load more button for products */}
      <div className="boxXemThem">
        <a href="/product" className="xem-them">
          Xem thêm
        </a>
      </div>

      {/* News Section */}
      <div className="news">
        <div className="row">
          <h1 className="newsTitle">Tin tức mới nhất</h1>
        </div>
        <div className="row">
          <div className="col-7">
            {news.map((item) => (
              <div key={item.newsID} className="news-item">
                <a
                  href={`/news/${item.newsID}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="image-container">
                    <img
                      src={item.newsImage}
                      alt={item.newsTitle}
                      className="news-image"
                    />
                  </div>
                  <div className="news-details">
                    <h3 className="news-title">{item.newsTitle}</h3>
                    <h4 className="news-date">{formatDate(item.date)}</h4>
                    <h5 className="news-content">
                      {item.content.substring(0, 200)}...
                    </h5>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="boxXemThem">
        <a href="/news" className="xem-them">
          Xem thêm
        </a>
      </div>
      {/* Banner Section */}
      <div className="image-banner-container">
        <img src={ImageHome} alt="Beautiful Gifts" className="image-banner" />
        <div className="image-banner-content">
          <h2>CHÚNG TÔI CUNG CẤP <br /> MỘT BỘ QUÀ TẶNG TUYỆT VỜI <br /> CHO NHỮNG NGƯỜI THÂN YÊU CỦA BẠN.</h2>
          <a href="/product" className="shop-now-button">Shop now</a>
        </div>
      </div>
      <div className="subscribe-section">
        <h2>Subscribe</h2>
        <p>
          <strong>Đăng ký</strong> ngay để cập nhật những thông tin mới nhất về khuyến mãi, sản phẩm mới và nhiều điều thú vị khác...
        </p>
        <form
          className="subscribe-form"
          onSubmit={(e) => {
            e.preventDefault();
            const emailInput = e.target.email.value;
            if (emailInput) {
              window.location.href = `/signup?email=${emailInput}`;
            }
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="email-input"
          />
          <button type="submit" className="subscribe-button">Sign up</button>
        </form>
      </div>

    </div>
  );
};

export default HomePage;
