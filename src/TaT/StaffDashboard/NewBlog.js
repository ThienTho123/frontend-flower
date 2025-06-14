import React, { useState, useEffect } from "react";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "./CreateBlogForm.css";

const CreateBlogForm = () => {
  const [flowers, setFlowers] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("ENABLE");
  const [images, setImages] = useState([]);
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
    const files = event.target.files;
    setLoading(true);
    const uploadedImages = [...images];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "https://deploybackend-1ta9.onrender.com/api/v1/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        uploadedImages.push(response.data.DT);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    setImages(uploadedImages);
    setLoading(false);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
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
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung!");
      return;
    }
    setIsModalOpen(true); // 🔥 Mở modal trước khi gửi dữ liệu
  };
  const confirmSubmit = async () => {
    const accessToken = localStorage.getItem("access_token");
    const blogData = {
      title,
      content,
      status,
      imageurl: images,
      flowerid: selectedFlowers.map((f) => f.flowerID),
    };

    try {
      await axios.post(
        "https://deploybackend-1ta9.onrender.com/api/v1/staff/blog",
        blogData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      resetForm();
    } catch (error) {
      console.error("Error creating blog:", error);
    }
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImages([]);
    setSelectedFlowers([]);
    setStatus("ENABLE");
  };

  return (
    <div className="blog-form-container">
      <h2 className="blog-form-title">Tạo Blog</h2>

      <input
        type="text"
        className="blog-form-input"
        placeholder="Nhập tiêu đề"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập nội dung"
        rows="4"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>

      <input
        type="file"
        multiple
        onChange={handleImageUpload}
        className="blog-form-file-input"
      />
      {loading && <p className="blog-form-loading">Đang tải ảnh...</p>}

      <div className="blog-form-images">
        {images.map((url, index) => (
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

      <h3 className="blog-form-subtitle">Chọn Flowers</h3>
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
            {status === "ENABLE" ? "Kích hoạt Blog" : "Vô hiệu hóa Blog"}
          </span>
        </label>
      </div>

      <button onClick={handleSubmit} className="blog-form-submit-button">
        Tạo Blog
      </button>

      {isModalOpen && (
        <div className="create-blog-modal">
          <div className="create-blog-modal-content">
            <h3>Xác nhận tạo Blog</h3>
            <p>Bạn có chắc muốn tạo blog này không?</p>
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
            <p>Blog đã được tạo thành công.</p>
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

export default CreateBlogForm;
