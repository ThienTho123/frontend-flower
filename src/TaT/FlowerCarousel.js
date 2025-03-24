import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "./FlowerCarousel.css";
import { Link } from "react-router-dom";

const BlogFlowerCarousel = ({ blogFlowers }) => {
  const itemCount = blogFlowers.length;
  const settings = {
    dots: true,
    infinite: itemCount > 3, // Chỉ lặp lại nếu có nhiều hơn 3 items
    speed: 500,
    slidesToShow: itemCount === 1 ? 1 : itemCount === 2 ? 2 : 3,
    slidesToScroll: 1,
    autoplay: itemCount > 1, // Nếu chỉ có 1 item thì không autoplay
    autoplaySpeed: 4000,
    centerMode: itemCount === 2, // Căn giữa nếu có 2 items
    centerPadding: itemCount === 2 ? "25%" : "0px", // Điều chỉnh khoảng cách cho 2 items
  };

  return (
    <div className="blog-flower-carousel">
      <Slider {...settings}>
        {blogFlowers.map((flower) => (
          <Link to={`/detail/${flower.productID}`} key={flower.productID} className="flower-item">
            <img src={flower.avatar} alt={flower.title} className="flower-image" />
            <p className="flower-name">{flower.title}</p>
            <p className="flower-sold">Đã bán: {flower.sold}</p>
            <p className="flower-price">
            {flower.priceEvent !== null ? (
              <>
                <div
                  style={{
                    textDecoration: "line-through",
                    color: "gray",
                  }}
                >
                  {flower.price.toLocaleString("vi-VN")} VNĐ
                </div>
                <div style={{ color: "red", fontWeight: "bold" }}>
                  Giá: {flower.priceEvent.toLocaleString("vi-VN")} VNĐ
                </div>
              </>
            ) : (
              <span>Giá: {flower.price.toLocaleString("vi-VN")} VNĐ</span>
            )}
          </p>


          </Link>
        ))}
      </Slider>
    </div>
  );
};

export default BlogFlowerCarousel;
