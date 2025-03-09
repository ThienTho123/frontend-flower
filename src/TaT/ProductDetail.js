import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Slider from "react-slick";
import "./ProductDetail.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Grid from "@mui/material/Grid";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [productBrand, setProductBrand] = useState(null);
  const [productSimilar, setProductSimilar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [productSizes, setProductSizes] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [avgScore, setAverageScore] = useState(0);
  const mainSliderRef = useRef(null);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [howManyBought, setHowManyBought] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false); // Trạng thái để theo dõi có trong wishlist khônghandleAddToWishlist
  const [isToastVisible, setIsToastVisible] = useState(false); // Điều khiển hiển thị thông báo
  const [toastMessage, setToastMessage] = useState(""); // Lưu thông báo
  const totalPrice = productSizes[selectedSizeIndex]?.price * quantity || 0;
  const [wishlistID, setWishlistID] = useState(null); // Trạng thái để lưu wishlistID

  const commentsPerPage = 5;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/detail/${id}`);
        if (response.status === 200) {
          const {
            product,
            reviews,
            productSizes,
            imageList,
            productBrand,
            productSimilar,
            howManyBought,
          } = response.data;
          setProduct(product);
          setReviews(reviews);
          setProductSizes(productSizes);
          setImageList(imageList);
          setProductBrand(productBrand);
          setProductSimilar(productSimilar);
          setHowManyBought(howManyBought);
          console.log(howManyBought);
          const totalScore = reviews.reduce(
            (acc, review) => acc + review.rating,
            0
          );
          const avgScore = reviews.length > 0 ? totalScore / reviews.length : 0;
          setAverageScore(avgScore);
        } else {
          setError("Product not available or disabled.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  useEffect(() => {
    setQuantity(1);
  }, [product]);
  const totalPages = Math.ceil(reviews.length / commentsPerPage);
  const currentComments = reviews.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handleBuyNow = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const accountID = localStorage.getItem("accountID");
      const sizeName = productSizes[selectedSizeIndex].sizeName; // Lấy sizeName
      const flowerSizeID = productSizes[selectedSizeIndex].flowerSizeID;
      const productSizeID = productSizes[selectedSizeIndex].flowerSizeID;

      if (!accountID) {
        // Kiểm tra nếu accountID là null hoặc không tồn tại
        navigate("/login"); // Điều hướng đến trang đăng nhập
        return; // Dừng thực thi hàm
      }

      const response = await axios.post(
        "http://localhost:8080/addToPrebuy",
        {
          productSizeID: productSizeID,
          accountID: accountID,
          status: null,
          number: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/prebuy");
    } catch (error) {
      if (error.response) {
        console.error("Error adding to prebuy:", error.response.data);
      } else {
        console.error("Network or server error:", error.message);
      }
    }
  };

  const ModalSuccess = ({ isVisible, message, onClose }) => {
    if (!isVisible) {
      return null;
    }

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <h3>Thông báo</h3>
          <p>{message}</p>
          <button className="modal-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    );
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const sizeName = productSizes[selectedSizeIndex].sizeName; // Lấy sizeName
      const productSizeID = productSizes[selectedSizeIndex].flowerSizeID;
      const flowerSizeID = productSizes[selectedSizeIndex].flowerSizeID;
      const accountID = localStorage.getItem("accountID");

      if (!accountID) {
        // Kiểm tra nếu accountID là null hoặc không tồn tại
        navigate("/login"); // Điều hướng đến trang đăng nhập
        return; // Dừng thực thi hàm
      }
      console.log(productSizes[selectedSizeIndex]); // Kiểm tra dữ liệu ở đây

      const response = await axios.post(
        "http://localhost:8080/addToPrebuy",
        {
          productSizeID: productSizeID,
          accountID: null,
          status: null,
          number: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Sản phẩm đã được thêm vào giỏ hàng!");
      setSuccessModalVisible(true);

      // Có thể không cần điều hướng sau khi thêm vào giỏ hàng
    } catch (error) {
      if (error.response) {
        console.error("Error adding to cart:", error.response.data);
      } else {
        console.error("Network or server error:", error.message);
      }
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
  };

  useEffect(() => {
    if (mainSliderRef.current) {
      if (!isZoomed) {
        mainSliderRef.current.slickPlay();
      } else {
        mainSliderRef.current.slickPause();
      }
    }
  }, [isZoomed]);
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await axios.get("http://localhost:8080/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const wishlists = response.data.wishlists || [];
          const wishlistItem = wishlists.find(
            (item) => item.flower.flowerID === product?.flowerID
          );

          setIsInWishlist(!!wishlistItem);
          if (wishlistItem) {
            setWishlistID(wishlistItem.wishListID); // Lưu lại wishlistID nếu sản phẩm có trong wishlist
          }
        }
      } catch (error) {
        console.error("Error fetching wishlist status:", error.message);
      }
    };

    if (product) {
      fetchWishlistStatus();
    }
  }, [product]);

  useEffect(() => {
    const maxStock = productSizes[selectedSizeIndex]?.stock || 0;
    if (quantity > maxStock) {
      setQuantity(maxStock);
    }
  }, [selectedSizeIndex, productSizes]);

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
    mainSliderRef.current.slickGoTo(index);
  };

  const handleSizeChange = (index) => {
    if (productSizes[selectedSizeIndex].stock === 0) setQuantity(1);
    setSelectedSizeIndex(index);
  };

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  const maxStock = productSizes[selectedSizeIndex]?.stock || 0;

  const handleIncrease = () => {
    setQuantity((prevQuantity) => {
      if (productSizes[selectedSizeIndex]?.stock > 0) {
        return Math.min(prevQuantity + 1, maxStock); // Giới hạn theo kho nếu còn hàng
      } else {
        return prevQuantity + 1; // Không giới hạn nếu Preorder
      }
    });
  };

  const handleDecrease = () => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1)); // Luôn giữ min = 1
  };

  const handleChange = (e) => {
    const value = Math.min(Math.max(1, Number(e.target.value)), maxStock);
    setQuantity(value);
  };
  const toggleDetails = () => {
    setIsExpanded((prev) => !prev); // Đảo ngược trạng thái mở rộng
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const mainSliderSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !isZoomed,
    autoplaySpeed: 5000,
    dots: true,
    arrows: true,
    infinite: false,

    afterChange: (current) => setActiveIndex(current),
  };

  const thumbnailSliderSettings = {
    slidesToShow: imageList.length > 4 ? 4 : imageList.length,
    slidesToScroll: 1,
    focusOnSelect: true,
    arrows: true,
    dots: false,
    centerMode: false,
    infinite: false,
  };
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} className="star full" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star empty" />);
      }
    }
    return stars;
  };
  const sortedReviews = reviews.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const commentStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} className="comment star full" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="comment star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="comment star empty" />);
      }
    }
    return stars;
  };
  const handlePreorder = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const productSizeID = productSizes[selectedSizeIndex].flowerSizeID;

      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:8080/addPreorder",
        {
          productSizeID: productSizeID,
          number: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessModalVisible(true);
    } catch (error) {
      console.error("Error placing preorder:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (isInWishlist) {
        // Xóa sản phẩm khỏi wishlist
        try {
          await axios.delete(`http://localhost:8080/wishlist/${wishlistID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setIsInWishlist(false);
          setWishlistID(null); // Reset wishlistID
          setToastMessage("Sản phẩm đã bị xóa khỏi danh sách yêu thích!");
        } catch (err) {
          console.error(
            "Error deleting from wishlist:",
            err.response?.data || err.message
          );
          setToastMessage(
            "Có lỗi xảy ra khi xóa sản phẩm khỏi danh sách yêu thích!"
          );
        }
      } else {
        // Thêm sản phẩm vào wishlist
        try {
          const response = await axios.post(
            "http://localhost:8080/addToWishlist",
            { flowerID: product.flowerID },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setIsInWishlist(true);
          setWishlistID(response.data.wishListID); // Lưu wishlistID từ phản hồi
          setToastMessage("Sản phẩm đã được thêm vào danh sách yêu thích!");
        } catch (err) {
          console.error(
            "Error adding to wishlist:",
            err.response?.data || err.message
          );
          setToastMessage(
            "Có lỗi xảy ra khi thêm sản phẩm vào danh sách yêu thích!"
          );
        }
      }

      // Hiển thị thông báo
      setIsToastVisible(true);
      setTimeout(() => {
        setIsToastVisible(false);
      }, 3000);
    } catch (error) {
      console.error("Error in wishlist handler:", error.message);
      setToastMessage("Có lỗi xảy ra. Vui lòng thử lại!");
      setIsToastVisible(true);
      setTimeout(() => {
        setIsToastVisible(false);
      }, 3000);
    }
  };

  return (
    <>
      <div className="container">
        <div className="menu">
          <ul id="main-menu">
            <li style={{ borderRight: "1px solid #7c7c7c71" }}>
              <Link to="/">Trang chủ</Link>
            </li>
            <li style={{ borderRight: "1px solid #7c7c7c71" }}>
              <Link to="/product">Danh mục sản phẩm</Link>
            </li>
            {product?.categoryID && (
              <li style={{ borderRight: "1px solid #7c7c7c71" }}>
                <Link to={`/product?category=${product.categoryID.categoryID}`}>
                  {product.categoryID.categoryName}
                </Link>
              </li>
            )}
          </ul>
        </div>
        <Grid container>
          <Grid item xs={6} className="col-6">
            <div className="product-container-gallery">
              <Slider
                {...mainSliderSettings}
                ref={mainSliderRef}
                className="productGallery_slider"
              >
                {imageList.map((image, index) => (
                  <div key={index} onClick={handleImageClick}>
                    <div
                      className="product-gallery"
                      data-image={image.imageURL}
                    >
                      <a className="product-gallery__item">
                        <img
                          src={image.imageURL}
                          alt={product.title}
                          style={{
                            height: "600px",
                            width: "600px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </a>
                    </div>
                  </div>
                ))}
              </Slider>

              <Slider
                {...thumbnailSliderSettings}
                className="productGallery_thumb"
              >
                {imageList.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${
                      activeIndex === index ? "active" : ""
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <div
                      style={{ margin: "0 5px" }}
                      className="product-thumb"
                      data-image={image.imageURL}
                    >
                      <a className="product-thumb__item">
                        <img src={image.imageURL} alt={product.title} />
                      </a>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </Grid>
          <Grid item xs={6} className="grid-col-6">
            <div className="infoProduct">
              <div class="title-container">
                <h1 class="titleProduct">{product?.name}</h1>
              </div>
              <h6>
                <span className="avgScore">{avgScore.toFixed(1)}/5.0</span>{" "}
                <span className="star">★</span>
                <span className="reviewLength">{reviews.length} Đánh giá</span>
                <span className="bought">{howManyBought} Đã mua</span>
                <button
                  className={`heart-icon ${isInWishlist ? "heart-filled" : ""}`}
                  onClick={handleAddToWishlist}
                >
                  &#9825;
                </button>
                {isToastVisible && (
                  <div
                    className="toast"
                    style={{
                      backgroundColor: isInWishlist ? "green" : "red",
                    }}
                  >
                    {toastMessage}
                  </div>
                )}
              </h6>
              <h2 className="totalPrice" style={{ color: "#ff4c4c" }}>
                {productSizes[selectedSizeIndex]?.price.toLocaleString()}{" "}
                <span className="currency-symbol">đ</span>
              </h2>
              <h3 className="Size">
                Size:
                <ul className="productSizes">
                  {productSizes.map((size, index) => (
                    <li
                      key={index}
                      onClick={() => handleSizeChange(index)}
                      className={selectedSizeIndex === index ? "selected" : ""}
                    >
                      {size.sizeName}
                    </li>
                  ))}
                </ul>
              </h3>
              {selectedSizeIndex !== null && (
                <div className="sizeDetails">
                  <p>{`Chiều dài: ${productSizes[selectedSizeIndex].length} cm`}</p>
                  <p>{`Chiều cao: ${productSizes[selectedSizeIndex].high} cm`}</p>
                  <p>{`Chiều rộng: ${productSizes[selectedSizeIndex].width} cm`}</p>
                  <p>{`Cân nặng: ${productSizes[selectedSizeIndex].weight} kg`}</p>
                </div>
              )}

              <h4 className="Stock">
                {productSizes[selectedSizeIndex]?.stock > 0 ? (
                  <>Còn lại: {productSizes[selectedSizeIndex]?.stock || 0}</>
                ) : (
                  <span style={{ color: "red" }}>Sản phẩm tạm hết hàng </span>
                )}
              </h4>

              <div className="Number">
                <h4>Số lượng: </h4>
                <button
                  onClick={handleDecrease}
                  className="decrease-btn"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  className="numberInput"
                  type="number"
                  value={quantity}
                  min="1"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (productSizes[selectedSizeIndex]?.stock > 0) {
                      setQuantity(Math.min(Math.max(1, value), maxStock)); // Kiểm tra maxStock nếu còn hàng
                    } else {
                      setQuantity(Math.max(1, value)); // Không giới hạn nếu Preorder
                    }
                  }}
                />
                <button
                  onClick={handleIncrease}
                  className="increase-btn"
                  disabled={
                    productSizes[selectedSizeIndex]?.stock > 0 &&
                    quantity >= maxStock
                  }
                >
                  +
                </button>
              </div>

              <div className="buy">
                {productSizes[selectedSizeIndex]?.stock > 0 && (
                  <>
                    <button className="addToCart" onClick={handleAddToCart}>
                      <h4>Thêm vào giỏ hàng</h4>
                    </button>
                    <button className="buyNow" onClick={handleBuyNow}>
                      <h4>Mua ngay</h4>
                    </button>
                  </>
                )}
                {productSizes[selectedSizeIndex]?.preorderable === "YES" && (
                  <button className="preorder-button" onClick={handlePreorder}>
                    <h4>Đặt trước</h4>
                  </button>
                )}
                {/* Hiển thị modal thông báo khi thêm vào giỏ hàng thành công */}
                <ModalSuccess
                  isVisible={isSuccessModalVisible}
                  message={successMessage}
                  onClose={handleSuccessModalClose}
                />
              </div>
            </div>
          </Grid>
        </Grid>
        {isZoomed && (
          <div className="zoom-overlay" onClick={handleCloseZoom}>
            <div className="zoomed-image-container">
              <button className="close-button" onClick={handleCloseZoom}>
                X
              </button>
              <img
                src={imageList[activeIndex].imageURL}
                alt={product.title}
                className="zoomed-image"
              />
            </div>
          </div>
        )}
      </div>

      <div className="container" style={{ alignItems: "center" }}>
        <h1 className="detail">CHI TIẾT SẢN PHẨM</h1>

        <h6 className="productinfodetail">
          Danh mục:
          <h4>
            <ul className="infoDanhMuc">
              <li>
                <Link to="/">Trang chủ</Link>
                <img
                  src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/productdetailspage/966fbe37fe1c72e3f2dd.svg"
                  alt="Arrow Icon"
                  className="icon-arrow"
                />
              </li>
              <li>
                <Link to="/product">Danh mục sản phẩm</Link>
                <img
                  src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/productdetailspage/966fbe37fe1c72e3f2dd.svg"
                  alt="Arrow Icon"
                  className="icon-arrow"
                />
              </li>
              {product?.categoryID && (
                <li>
                  <Link
                    to={`/product?category=${product.categoryID.categoryID}`}
                  >
                    {product.categoryID.categoryName}
                  </Link>
                  <img
                    src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/productdetailspage/966fbe37fe1c72e3f2dd.svg"
                    alt="Arrow Icon"
                    className="icon-arrow"
                  />
                </li>
              )}
            </ul>
          </h4>
        </h6>

        <div className={`detail-content ${isExpanded ? "expanded" : ""}`}>
          {/* Loại sản phẩm (Category) */}
          <h6 className="productinfodetail">
            Loại sản phẩm:
            <h4 className="infodetail">
              <Link
                to={`/product?category=${product.category.categoryID}`}
                className="linkTo"
              >
                {product.category.categoryName}
              </Link>
            </h4>
          </h6>

          {/* Mục đích sử dụng (Purpose) */}
          <h6 className="productinfodetail">
            Mục đích:
            <h4 className="infodetail">
              <Link
                to={`/product?purpose=${product.purpose.purposeID}`}
                className="linkTo"
              >
                {product.purpose.purposeName}
              </Link>
            </h4>
          </h6>

          {/* Ngôn ngữ hoa (Language of Flowers) */}
          <h6 className="productinfodetail">
            Ngôn ngữ hoa:
            <h4 className="infodetail">{product.languageOfFlowers}</h4>
          </h6>

          {/* Các kích thước */}
          <h6 className="productinfodetail">
            Các kích thước:
            <h4 className="infodetail">
              {productSizes.map((size, index) => (
                <span key={index}>
                  <strong style={{ fontWeight: "bold" }}>
                    {size.sizeName}:
                  </strong>
                  <span style={{ color: "#888", fontSize: "0.9rem" }}>
                    {` Chiều dài: ${size.length} cm, Chiều cao: ${size.high} cm, Chiều rộng: ${size.width} cm, Cân nặng: ${size.weight} kg`}
                  </span>
                  {index < productSizes.length - 1 && ", "}
                </span>
              ))}
            </h4>
          </h6>
          <h6 className="productinfodetail">
            <h1 className="detail">MÔ TẢ SẢN PHẨM</h1>
            <p className="infodetail">
              {product.description || "Mô tả chưa có"}
            </p>
          </h6>
        </div>
        <div className="button-container">
          <button onClick={toggleDetails} className="toggle-details">
            {isExpanded ? "Rút gọn" : "Xem thêm"}
          </button>
        </div>
      </div>

      <div className="container">
        <h1>ĐÁNH GIÁ SẢN PHẨM</h1>
        <div className="rating">{renderStars(avgScore)}</div>
        <h3>{avgScore.toFixed(1)}/5.0</h3>
        <h5>({reviews.length} đánh giá)</h5>

        <div className="comment-overview">
          <div className="cmt-view">
            {currentComments.map((comment, index) => (
              <div className="comment_content" key={index}>
                {/* Avatar và thông tin người dùng */}
                <div className="reviewer-section">
                  <img
                    src={comment.accountID.avatar}
                    alt={comment.accountID.name}
                    className="avatar-image"
                  />
                  <div className="reviewer-info">
                    <div className="reviewer">{comment.accountID.name}</div>
                    <div className="time">
                      {new Date(comment.date).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="rating-comment">
                      {commentStars(comment.rating)}
                    </div>
                  </div>
                </div>

                {/* Nội dung bình luận */}
                <div className="comment_text">{comment.comment}</div>

                {/* Hình ảnh bình luận nếu có */}
                {comment.image && (
                  <div className="comment-image">
                    <img
                      src={comment.image}
                      alt="Comment attachment"
                      className="attached-image"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              Trang trước
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      <div className="product-detail">
        <div className="product-container">
          <h1 className="other1">Các sản phẩm khác của hãng</h1>

          {productBrand.map((product) => (
            <div key={product.flowerID} className="product">
              <a href={`/detail/${product.flowerID}`} className="product-link">
                <div className="product-image-container">
                  <img
                    style={{
                      height: "250px",
                      width: "250px",
                      objectFit: "cover",
                    }}
                    src={product.image}
                    alt={product.name}
                  />
                  <div className="product-overlay">
                    <h3>{product.name}</h3>
                    <p style={{ color: "red" }}>
                      {product.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        <div className="product-container">
          <h1 className="other1">Có thể bạn thích</h1>
          {console.log("Danh sách sản phẩm tương tự:", productSimilar)}{" "}
          {/* In danh sách sản phẩm ra console */}
          {productSimilar.map((product) => (
            <div key={product.flowerID} className="product">
              <a href={`/detail/${product.flowerID}`}>
                <img
                  style={{
                    height: "250px",
                    width: "250px",
                    objectFit: "cover",
                  }}
                  src={product.image}
                  alt={product.name}
                />
                <h3>{product.name}</h3>
                <p style={{ color: "red" }}>
                  {product.price.toLocaleString("vi-VN")} đ
                </p>
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
