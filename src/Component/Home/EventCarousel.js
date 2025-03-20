import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./EventCarousel.css";
import { Link } from "react-router-dom";

const EventCarousel = ({ eventFlower = [] }) => {
  if (eventFlower.length === 0) {
    return <p className="no-event">Hiện không có sự kiện nào.</p>;
  }
  const formatDateTime = (dateTime) => {
    if (!dateTime || !Array.isArray(dateTime) || dateTime.length < 5) {
      return "Không xác định";
    }
  
    const [year, month, day, hour, minute, second] = dateTime;
    return `${day}/${month}/${year} - ${hour}:${minute}:${second}`;
  };
  
  const formatPrice = (price) => {
    return price
      ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"
      : "0 đ";
  };

  return (
    <div className="event-carousel-container">
      {eventFlower.map((eventItem, index) => {
        const event = eventItem.event || {};
        const flowers = eventItem.flower || [];
        const itemCount = flowers.length;

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

        return (
          <div
            key={index}
            className="event-flower-carousel"
            style={{
              background: `linear-gradient(to bottom, ${
                event?.color || "#ffe4e1"
              }, #fffaf0)`,
            }}
          >
            <div className="event-info">
              <h2 className="event-name">
                {event?.name || "Sự kiện đặc biệt"}
              </h2>
              <p className="event-description">
                {event?.description || "Không có mô tả"}
              </p>
              <div className="event-date">
              <p>🕒 Bắt đầu: {formatDateTime(event?.start)}</p>
              <p>⏳ Kết thúc: {formatDateTime(event?.end)}</p>
              </div>
            </div>

            <Slider {...settings}>
              {flowers.map((flower) => (
                <Link
                  to={`/detail/${flower.productID}`}
                  key={flower.productID}
                  className="event-flower-item"
                >
                  <img
                    src={flower.avatar}
                    alt={flower.title}
                    className="event-flower-image"
                  />
                  <p className="event-flower-name">{flower.title}</p>
                  <p className="event-flower-sold">🚀 Đã bán: {flower.sold}</p>
                  {flower.priceEvent ? (
                    <div>
                      <p className="event-original-price">
                        {formatPrice(flower.price)}
                      </p>
                      <p className="event-discounted-price">
                        {formatPrice(flower.priceEvent)}
                      </p>
                      <p className="event-discount-rate">
                        🔥 Giảm {flower.saleOff}%
                      </p>
                    </div>
                  ) : (
                    <p className="event-discounted-price">
                      {formatPrice(flower.price)}
                    </p>
                  )}
                </Link>
              ))}
            </Slider>
          </div>
        );
      })}
    </div>
  );
};

export default EventCarousel;
