import React, { useState } from "react";
import axios from "axios";
import "./DetectPage.css";
import { Link } from "react-router-dom";

const DetectPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [detectObjects, setDetectObjects] = useState([]);
  const [currentDetectIndex, setCurrentDetectIndex] = useState(0);
  const [flowerList, setFlowerList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    const formData = new FormData();
    formData.append("file", selectedImage);

    setLoading(true); // Bắt đầu loading

    try {
      const response = await axios.post(
        "http://localhost:8080/detect/upload",
        formData
      );
      setResultImage(`data:image/jpeg;base64,${response.data.image}`);
      setDetectObjects(response.data.objects);
      setCurrentDetectIndex(0);
      const allFlowers = response.data.objects.flatMap(
        (obj) => obj.flowerDTOList
      );
      setFlowerList(allFlowers);
      console.log(response.data.objects);
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setLoading(false); // Kết thúc loading
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

  return (
    <div className="detect-container">
      <h2>Nhận diện hoa</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="custom-file-input"
      />
      <button onClick={handleUpload} className="upload-button">
        Phân tích ảnh
      </button>
      {loading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>Đang xử lý ảnh, vui lòng chờ...</p>
        </div>
      )}

      <div className="image-section">
        <div>
          <h3>Ảnh gốc</h3>
          {previewUrl && <img src={previewUrl} alt="Uploaded" />}
        </div>
        <div>
          <h3>Kết quả nhận diện</h3>
          {resultImage && <img src={resultImage} alt="Detected" />}
        </div>
      </div>

      {detectObjects.length > 0 && (
        <div className="detect-carousel">
          <h3>Thông tin đối tượng nhận diện</h3>
          <div className="carousel-content">
            <button onClick={handlePrev}>&lt;</button>
            <div className="detect-card">
              <h3 style={{ marginBottom: "10px", color: "#2e7d32" }}>
                {detectObjects[currentDetectIndex].detect?.flowerdetect}
              </h3>

              <img
                src={detectObjects[currentDetectIndex].detect?.imageurl}
                alt={detectObjects[currentDetectIndex].detect?.flowerdetect}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              />

              <p>
                <strong>Tên tiếng Việt:</strong>{" "}
                {detectObjects[currentDetectIndex].detect?.vietnamname}
              </p>
              <p>
                <strong>Xuất xứ:</strong>{" "}
                {detectObjects[currentDetectIndex].detect?.origin}
              </p>
              <p>
                <strong>Mùa nở:</strong>{" "}
                {detectObjects[currentDetectIndex].detect?.timebloom}
              </p>
              <p>
                <strong>Đặc điểm:</strong>{" "}
                {detectObjects[currentDetectIndex].detect?.characteristic}
              </p>
              <p>
                <strong>Ý nghĩa:</strong>{" "}
                {detectObjects[currentDetectIndex].detect?.flowerlanguage}
              </p>
              <p>
                <strong>Bổ sung:</strong>{" "}
                {detectObjects[currentDetectIndex].detect?.bonus}
              </p>
              <p>
                <strong>Công dụng:</strong>{" "}
                {detectObjects[currentDetectIndex].detect?.uses}
              </p>

              <p>
                <strong>Số lượng nhận diện:</strong>{" "}
                {detectObjects[currentDetectIndex].numberFound}
              </p>
            </div>

            <button onClick={handleNext}>&gt;</button>
          </div>
        </div>
      )}

      <div className="flower-list">
        <h3>Sản phẩm gợi ý</h3>
        <div className="product-recommend-grid">
          {flowerList.length > 0 ? (
            flowerList.map((product) => (
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
    </div>
  );
};

export default DetectPage;
