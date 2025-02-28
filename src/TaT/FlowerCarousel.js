import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "./FlowerCarousel.css"
import { Link } from "react-router-dom";

const BlogFlowerCarousel = ({ blogFlowers }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(blogFlowers.length, 3), 
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,

  };

  return (
    <div className="blog-flower-carousel">
      <Slider {...settings}>
        {blogFlowers.map((flower, index) => (
            <Link to={`/detail/${flower.productID}`} key={flower.ProductID} className="flower-item">
            <img src={flower.avatar} alt={flower.title} className="flower-image" />
            <p className="flower-name">{flower.title}</p>
            <p className="flower-sold">Đã bán:{flower.sold}</p>
            <p className="flower-price">Giá: {flower.price} VNĐ</p>
          </Link>
        ))}
      </Slider>
    </div>
  );
};

export default BlogFlowerCarousel;
