import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./EventCarousel.css";
import { Link } from "react-router-dom";

const EventCarousel = ({ eventFlower = [] }) => {
  if (eventFlower.length === 0) {
    return (
      <div className="no-event">
        <span role="img" aria-label="sad flower">🥀</span> Hiện không có sự kiện đặc biệt nào.
      </div>
    );
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime || !Array.isArray(dateTime)) {
      return "Không xác định";
    }
  
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateTime;
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    
    return `${day}/${month}/${year} - ${formattedHour}:${formattedMinute}`;
  };
  
  const formatPrice = (price) => {
    return price
      ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"
      : "0 đ";
  };

  // Calculate discount percentage if not provided
  const calculateDiscount = (original, discounted) => {
    if (!original || !discounted) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  // Custom arrow components
  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block" }}
        onClick={onClick}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5L16 12L9 19" stroke="#e83e8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  };
  
  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block" }}
        onClick={onClick}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L8 12L15 19" stroke="#e83e8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  };

  return (
    <div className="event-carousel-container">
      {eventFlower.map((eventItem, index) => {
        const event = eventItem.event || {};
        const flowers = eventItem.flower || [];
        const itemCount = flowers.length;

        // Responsive settings
        const settings = {
           dots: true,
           infinite: itemCount > 4 ,
           speed: 600,
           slidesToShow: itemCount === 1 ? 1 : itemCount === 2 ? 2 : 4,
           slidesToScroll: 1,
           autoplay: itemCount > 1,
           autoplaySpeed: 4000,
           centerMode: itemCount === 2,
           centerPadding: itemCount === 2 ? "25%" : "0px",
         };
        // Generate a gradient based on the event color
        const eventColor = event?.color || "#ffe4e1";
        const gradientStyle = {
          background: `linear-gradient(135deg, ${eventColor}, #fff8f8)`
        };

        return (
          <div
            key={index}
            className="event-flower-carousel"
            style={gradientStyle}
          >
            <div className="event-info">
              <h2 className="event-name">
                {event?.name || "Sự kiện đặc biệt"}
              </h2>
              <p className="event-description">
                {event?.description || "Khám phá bộ sưu tập hoa đặc biệt trong sự kiện này"}
              </p>
              <div className="event-date">
                <p><span role="img" aria-label="start time">🕒</span> Bắt đầu: {formatDateTime(event?.start)}</p>
                <p><span role="img" aria-label="end time">⏳</span> Kết thúc: {formatDateTime(event?.end)}</p>
              </div>
            </div>

            <Slider {...settings}>
              {flowers.map((flower) => {
                const discountRate = flower.saleOff || calculateDiscount(flower.price, flower.priceEvent);
                
                return (
                  <Link
                    to={`/detail/${flower.productID}`}
                    key={flower.productID}
                    className="event-flower-item"
                  >
                    <div>
                      <img
                        src={flower.avatar}
                        alt={flower.title}
                        className="event-flower-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/180x180?text=Hoa+Đẹp";
                        }}
                      />
                      <p className="event-flower-name">{flower.title}</p>
                      <p className="event-flower-sold">
                        <span role="img" aria-label="sold">🚀</span> Đã bán: {flower.sold}
                      </p>
                    </div>
                    
                    <div>
                      {flower.priceEvent ? (
                        <>
                          <p className="event-original-price">
                            {formatPrice(flower.price)}
                          </p>
                          <p className="event-discounted-price">
                            {formatPrice(flower.priceEvent)}
                          </p>
                          <p className="event-discount-rate">
                            <span role="img" aria-label="sale">🔥</span> Giảm {discountRate}%
                          </p>
                        </>
                      ) : (
                        <p className="event-discounted-price">
                          {formatPrice(flower.price)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </Slider>
          </div>
        );
      })}
    </div>
  );
};

export default EventCarousel;