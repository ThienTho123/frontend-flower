import React, { useState } from "react";
import axios from "axios";
import "./DetectPage.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faCamera,
  faArrowLeft,
  faArrowRight,
  faLeaf,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

const DetectPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [detectObjects, setDetectObjects] = useState([]);
  const [currentDetectIndex, setCurrentDetectIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert("Vui lòng chọn ảnh trước khi phân tích");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImage);

    setLoading(true);

    try {
      const response = await axios.post(
        "https://deploybackend-j61h.onrender.com/detect/upload",
        formData
      );
      setResultImage(`data:image/jpeg;base64,${response.data.image}`);
      setDetectObjects(response.data.objects);
      setCurrentDetectIndex(0);

      console.log(response.data.objects);

      // Scroll to results
      if (response.data.objects.length > 0) {
        setTimeout(() => {
          document
            .querySelector(".detect-carousel")
            .scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    } catch (error) {
      console.error("Upload error", error);
      alert("Đã xảy ra lỗi khi phân tích ảnh. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentDetectIndex(
      (prevIndex) => (prevIndex + 1) % detectObjects.length
    );
  };

  const handlePrev = () => {
    setCurrentDetectIndex(
      (prevIndex) =>
        (prevIndex - 1 + detectObjects.length) % detectObjects.length
    );
  };

  const handleDotClick = (index) => {
    setCurrentDetectIndex(index);
  };

  return (
    <div className="detect-container">
      <div className="detect-header">
        <h2>Nhận Diện Loài Hoa</h2>
        <p>
          Tải lên hình ảnh để nhận diện loài hoa và khám phá các sản phẩm tương
          tự trong cửa hàng của chúng tôi
        </p>
      </div>

      <div className="upload-section">
        <h3>
          <FontAwesomeIcon icon={faCamera} /> Tải lên ảnh hoa cần nhận diện
        </h3>

        <label
          htmlFor="image-upload"
          className={`custom-file-input ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div>
            <FontAwesomeIcon
              icon={faUpload}
              size="2x"
              style={{ marginBottom: "10px", color: "#6a1e55" }}
            />
            <p>Kéo thả ảnh vào đây hoặc click để chọn ảnh</p>
            <p style={{ fontSize: "0.8rem", color: "#888" }}>
              Hỗ trợ định dạng JPG, PNG
            </p>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>

        <button
          onClick={handleUpload}
          className="upload-button"
          disabled={!selectedImage}
        >
          <FontAwesomeIcon icon={faLeaf} /> Phân tích ảnh
        </button>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>Đang phân tích hình ảnh của bạn...</p>
          <p style={{ fontSize: "0.9rem" }}>Vui lòng đợi trong giây lát</p>
        </div>
      )}

      {(previewUrl || resultImage) && (
        <div className="image-section">
          <div>
            <h3>Ảnh gốc</h3>
            {previewUrl ? (
              <img src={previewUrl} alt="Ảnh đã tải lên" />
            ) : (
              <div className="no-image-placeholder">
                Chưa có ảnh được tải lên
              </div>
            )}
          </div>
          <div>
            <h3>Kết quả nhận diện</h3>
            {resultImage ? (
              <img src={resultImage} alt="Kết quả nhận diện" />
            ) : (
              <div className="no-image-placeholder">
                Chưa có kết quả nhận diện
              </div>
            )}
          </div>
        </div>
      )}

      {detectObjects.length > 0 && (
        <div className="detect-carousel">
          <h3>Thông Tin Chi Tiết</h3>

          <div className="carousel-content">
            <button
              onClick={handlePrev}
              className="arrow-btn"
              aria-label="Previous flower"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <div className="detect-card">
              <h3>{detectObjects[currentDetectIndex].detect?.vietnamname}</h3>

              <img
                src={detectObjects[currentDetectIndex].detect?.imageurl}
                alt={detectObjects[currentDetectIndex].detect?.flowerdetect}
              />

              <div className="flower-info-grid">
                <div className="flower-info-item">
                  <p>
                    <strong>Tên tiếng Việt:</strong>
                    <br />
                    {detectObjects[currentDetectIndex].detect?.vietnamname ||
                      "Không có thông tin"}
                  </p>
                </div>

                <div className="flower-info-item">
                  <p>
                    <strong>Xuất xứ:</strong>
                    <br />
                    {detectObjects[currentDetectIndex].detect?.origin ||
                      "Không có thông tin"}
                  </p>
                </div>

                <div className="flower-info-item">
                  <p>
                    <strong>Mùa nở:</strong>
                    <br />
                    {detectObjects[currentDetectIndex].detect?.timebloom ||
                      "Không có thông tin"}
                  </p>
                </div>

                <div className="flower-info-item">
                  <p>
                    <strong>Số lượng nhận diện:</strong>
                    <br />
                    {detectObjects[currentDetectIndex].numberFound} hoa
                  </p>
                </div>
              </div>

              {/* Nút "Xem thêm" */}
              {!showMoreInfo && (
                <div className="more-info-toggle">
                  <button
                    onClick={() => setShowMoreInfo(true)}
                    className="see-more-btn"
                  >
                    Xem thêm
                  </button>
                </div>
              )}

              {/* Nội dung mở rộng */}
              {showMoreInfo && (
                <>
                  <p>
                    <strong>Đặc điểm:</strong>{" "}
                    {detectObjects[currentDetectIndex].detect?.characteristic ||
                      "Không có thông tin"}
                  </p>

                  <p>
                    <strong>Ý nghĩa:</strong>{" "}
                    {detectObjects[currentDetectIndex].detect?.flowerlanguage ||
                      "Không có thông tin"}
                  </p>

                  <p>
                    <strong>Bổ sung:</strong>{" "}
                    {detectObjects[currentDetectIndex].detect?.bonus ||
                      "Không có thông tin"}
                  </p>

                  <p>
                    <strong>Công dụng:</strong>{" "}
                    {detectObjects[currentDetectIndex].detect?.uses ||
                      "Không có thông tin"}
                  </p>
                  <div className="more-info-toggle">
                    <button
                      onClick={() => setShowMoreInfo(false)}
                      className="collapse-btn"
                    >
                      Thu gọn
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleNext}
              className="arrow-btn"
              aria-label="Next flower"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          {detectObjects.length > 1 && (
            <div className="carousel-indicator">
              {detectObjects.map((_, index) => (
                <div
                  key={index}
                  className={`carousel-dot ${
                    index === currentDetectIndex ? "active" : ""
                  }`}
                  onClick={() => handleDotClick(index)}
                ></div>
              ))}
            </div>
          )}

          <div className="pagination-info">
            {detectObjects.length > 1 ? (
              <p>
                {currentDetectIndex + 1}/{detectObjects.length}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {detectObjects.length > 0 && (
        <div className="flower-list">
          <h3>Sản phẩm gợi ý</h3>
          <div className="product-recommend-grid">
            {detectObjects[currentDetectIndex]?.flowerDTOList?.length > 0 ? (
              detectObjects[currentDetectIndex].flowerDTOList.map((product) => (
                <div key={product.flowerID} className="product-recommend-card">
                  <Link
                    to={`/detail/${product.flowerID}`}
                    className="product-recommend-link"
                  >
                    <div className="img-recommend-wrapper">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <h2>{product.name}</h2>
                    <p>
                      Giá:{" "}
                      {product.priceEvent !== null ? (
                        <>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "gray",
                              marginRight: "8px",
                              fontSize: "1rem",
                            }}
                          >
                            {product.price.toLocaleString("vi-VN")} đ
                          </span>
                          <span
                            style={{
                              color: "red",
                              fontWeight: "bold",
                              fontSize: "1.2rem",
                            }}
                          >
                            {product.priceEvent.toLocaleString("vi-VN")} đ
                          </span>
                        </>
                      ) : (
                        <span>{product.price.toLocaleString("vi-VN")} đ</span>
                      )}
                    </p>
                    <p>Danh mục: {product.category.categoryName}</p>
                    <p>Mục đích: {product.purpose.purposeName}</p>
                  </Link>
                </div>
              ))
            ) : (
              <p>Không có sản phẩm bạn cần tìm.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectPage;
