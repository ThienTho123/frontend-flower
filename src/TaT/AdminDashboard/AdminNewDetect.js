import React, { useState, useEffect } from "react";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "../StaffDashboard/CreateBlogForm.css";

const AdminCreateDetect = () => {
  const [flowers, setFlowers] = useState([]);
  const [flowerdetect, setFlowerdetect] = useState("");
  const [vietnamname, setVietnamname] = useState("");
  const [status, setStatus] = useState("ENABLE");
  const [image, setImages] = useState([]);
  const [timebloom, setTimebloom] = useState([]);
  const [characteristic, setCharacteristic] = useState([]);
  const [flowerlanguage, setFlowerlanguage] = useState([]);
  const [bonus, setBonus] = useState([]);
  const [uses, setUses] = useState([]);
  const [origin, setOrigin] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 🔥 Thêm state cho modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useBootstrap();
  useEffect(() => {
    axios
      .get("https://deploybackend-1ta9.onrender.com/flower")
      .then((response) => setFlowers(response.data.flowers))
      .catch((error) => console.error("Error fetching flowers:", error));
  }, []);
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://deploybackend-1ta9.onrender.com/api/v1/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setImages([response.data.DT]); // chỉ giữ 1 ảnh
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    setLoading(false);
  };

  const handleRemoveImage = (index) => {
    setImages(image.filter((_, i) => i !== index));
  };

  const handleAddFlower = (flower) => {
    if (!selectedFlowers.find((f) => f.flowerID === flower.flowerID)) {
      setSelectedFlowers([...selectedFlowers, flower]);
    }
  };

  const handleRemoveFlower = (id) => {
    setSelectedFlowers(
      selectedFlowers.filter((flower) => flower.flowerID !== id)
    );
  };

  const handleSubmit = async () => {
    if (!flowerdetect.trim() || !vietnamname.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung!");
      return;
    }
    setIsModalOpen(true); // 🔥 Mở modal trước khi gửi dữ liệu
  };

  const confirmSubmit = async () => {
    const accessToken = localStorage.getItem("access_token");
    const detect = {
      flowerdetect: flowerdetect,
      vietnamname: vietnamname,
      imageurl: image[0],
      origin: origin,
      timebloom: timebloom,
      characteristic: characteristic,
      flowerlanguage: flowerlanguage,
      bonus: bonus,
      uses: uses,
      status,
    };
    const detectInfo = {
      detect: detect,
      flowerId: selectedFlowers.map((f) => f.flowerID),
    };
    try {
      await axios.post(
        "https://deploybackend-1ta9.onrender.com/api/v1/admin/detect",
        detectInfo,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      resetForm();
    } catch (error) {
      console.error("Error creating detect:", error);
    }
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const resetForm = () => {
    setFlowerdetect("");
    setVietnamname("");
    setImages([]);
    setBonus([]);
    setCharacteristic([]);
    setFlowerlanguage([]);
    setFlowers([]);
    setTimebloom([]);
    setUses([]);
    setOrigin([]);
    setStatus("ENABLE");
  };

  return (
    <div className="blog-form-container">
      <h2 className="blog-form-title">Tạo Nhận Diện Hoa</h2>

      <input
        type="text"
        className="blog-form-input"
        placeholder="Nhập tên nhận diện"
        value={flowerdetect}
        onChange={(e) => setFlowerdetect(e.target.value)}
      />

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập tên Tiếng Việt của hoa"
        rows="4"
        value={vietnamname}
        onChange={(e) => setVietnamname(e.target.value)}
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập nguồn gốc của hoa"
        rows="4"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập mùa hoa nở"
        rows="4"
        value={timebloom}
        onChange={(e) => setTimebloom(e.target.value)}
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập đặc điểm của hoa"
        rows="8"
        value={characteristic}
        onChange={(e) => setCharacteristic(e.target.value)}
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập ý nghĩa của hoa"
        rows="6"
        value={flowerlanguage}
        onChange={(e) => setFlowerlanguage(e.target.value)}
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập thông tin thêm cho hoa"
        rows="4"
        value={bonus}
        onChange={(e) => setBonus(e.target.value)}
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập công dụng của hoa"
        rows="4"
        value={uses}
        onChange={(e) => setUses(e.target.value)}
      ></textarea>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="blog-form-file-input"
      />
      {loading && <p className="blog-form-loading">Đang tải ảnh...</p>}

      <div className="blog-form-images">
        {image.map((url, index) => (
          <div key={index} className="blog-form-image-wrapper">
            <img src={url} alt="Uploaded" className="blog-form-image" />
            <button
              onClick={() => handleRemoveImage(index)}
              className="blog-form-delete-image"
            >
              <span>✖</span>
            </button>
          </div>
        ))}
      </div>

      <h3 className="blog-form-subtitle">Chọn Hoa</h3>
      <select
        className="blog-form-select"
        onChange={(e) => {
          const flower = flowers.find(
            (f) => f.flowerID === parseInt(e.target.value)
          );
          if (flower) handleAddFlower(flower);
        }}
      >
        <option value="">Chọn một loại hoa</option>
        {flowers.map((flower) => (
          <option
            key={flower.flowerID}
            value={flower.flowerID}
            disabled={selectedFlowers.some(
              (f) => f.flowerID === flower.flowerID
            )}
          >
            {flower.name}
          </option>
        ))}
      </select>

      <div className="blog-form-selected-flowers">
        {selectedFlowers.map((flower) => (
          <div key={flower.flowerID} className="blog-form-selected-flower">
            <span>{flower.name}</span>
            <button
              onClick={() => handleRemoveFlower(flower.flowerID)}
              className="blog-form-remove-flower"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <div className="blog-form-status">
        <label className="blog-form-status-label">
          <input
            type="checkbox"
            checked={status === "ENABLE"}
            onChange={() =>
              setStatus(status === "ENABLE" ? "DISABLE" : "ENABLE")
            }
          />
          <span className="blog-form-status-text">
            {status === "ENABLE" ? "Kích hoạt" : "Vô hiệu hóa"}
          </span>
        </label>
      </div>

      <button onClick={handleSubmit} className="blog-form-submit-button">
        Tạo Nhận Diện
      </button>

      {isModalOpen && (
        <div className="create-blog-modal">
          <div className="create-blog-modal-content">
            <h3>Xác nhận tạo nhận diện mới</h3>
            <p>Bạn có chắc muốn tạo nhận diện này không?</p>
            <div className="create-blog-modal-buttons">
              <button
                onClick={confirmSubmit}
                className="create-blog-modal-confirm"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="create-blog-modal-cancel"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="success-modal">
          <div className="success-modal-content">
            <h3>🎉 Thành công!</h3>
            <p>Nhận diện đã được tạo thành công.</p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="success-modal-button"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreateDetect;
