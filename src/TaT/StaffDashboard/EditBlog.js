import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "./CreateBlogForm.css";

const EditBlogForm = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [blog, setBlog] = useState({
    title: "",
    content: "",
    status: "ENABLE", // Giá trị mặc định, có thể thay đổi tùy backend
    imageurl: [],
    flowerid: [],
  });
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 🔥 Thêm state cho modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  useBootstrap();

  useEffect(() => {
    // Lấy danh sách hoa
    axios
      .get("https://deploybackend-j61h.onrender.com/flower")
      .then((response) => setFlowers(response.data.flowers))
      .catch((error) => console.error("Error fetching flowers:", error));
  }, []);

  useEffect(() => {
    // Lấy dữ liệu blog từ backend
    const accessToken = localStorage.getItem("access_token");
    axios
      .get(`https://deploybackend-j61h.onrender.com/api/v1/staff/blog/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        setBlog(response.data);
        setSelectedFlowers(
          response.data.blogFlower?.map((flower) => ({
            flowerID: flower.productID, // Đồng bộ ID giữa `ProductDTO` và `FlowerDTO`
            name: flower.title,
            image: flower.avatar,
          })) || []
        );
      })
      .catch((error) => console.error("Error fetching blog:", error));
  }, [id]);

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    setLoading(true);

    const uploadedImages = [...blog.blogImages];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "https://deploybackend-j61h.onrender.com/api/v1/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        uploadedImages.push({
          imageblogid: Date.now(),
          image: response.data.DT,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    setBlog({ ...blog, blogImages: uploadedImages });
    setLoading(false);
  };

  const handleRemoveImage = (imageblogid) => {
    const updatedImages = blog.blogImages.filter(
      (img) => img.imageblogid !== imageblogid
    );
    setBlog({ ...blog, blogImages: updatedImages });
  };

  const handleAddFlower = (flower) => {
    console.log("Thêm hoa:", flower);

    setSelectedFlowers((prevFlowers) => {
      // Kiểm tra xem hoa đã tồn tại chưa
      if (!prevFlowers.find((f) => f.flowerID === flower.flowerID)) {
        return [
          ...prevFlowers,
          {
            flowerID: flower.flowerID,
            name: flower.name,
            image: flower.image,
          },
        ];
      }
      return prevFlowers;
    });

    console.log("Danh sách sau khi thêm:", selectedFlowers);
  };

  const handleRemoveFlower = (id) => {
    setSelectedFlowers((prevFlowers) => {
      const newFlowers = prevFlowers.filter((flower) => flower.flowerID !== id);
      console.log("Danh sách sau khi xóa:", newFlowers);
      return newFlowers;
    });
  };

  useEffect(() => {
    console.log("Danh sách hoa đã chọn cập nhật:", selectedFlowers);
  }, [selectedFlowers]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!blog.blog.title?.trim() || !blog.blog.content?.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung!");
      return;
    }
    setIsModalOpen(true);
  };
  const confirmSubmit = async () => {
    const accessToken = localStorage.getItem("access_token");

    const updatedBlog = {
      title: blog.blog.title,
      content: blog.blog.content,
      status: blog.blog.status || "ENABLE",
      imageurl: blog.blogImages.map((img) => img.image), // Chỉ lấy URL của ảnh
      flowerid: selectedFlowers.map((flower) => flower.flowerID), // Chỉ gửi ID
    };
    console.log("Dữ liệu trước khi submit:", updatedBlog); // Kiểm tra dữ liệu blog

    axios
      .put(
        `https://deploybackend-j61h.onrender.com/api/v1/staff/blog/${id}`,
        updatedBlog,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((response) => {
        console.log("Cập nhật thành công:", response.data);
      })
      .catch((error) => console.error("Lỗi khi cập nhật:", error));
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="blog-form-container">
      <h2 className="blog-form-title">Chỉnh sửa Blog</h2>

      <input
        type="text"
        className="blog-form-input"
        placeholder="Nhập tiêu đề"
        value={blog.blog?.title || ""}
        onChange={(e) =>
          setBlog({ ...blog, blog: { ...blog.blog, title: e.target.value } })
        }
      />

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập nội dung"
        rows="4"
        value={blog.blog?.content || ""}
        onChange={(e) =>
          setBlog({ ...blog, blog: { ...blog.blog, content: e.target.value } })
        }
      ></textarea>

      <input
        type="file"
        multiple
        onChange={handleImageUpload}
        className="blog-form-file-input"
      />
      {loading && <p className="blog-form-loading">Đang tải ảnh...</p>}

      <div className="blog-form-images">
        {blog.blogImages?.map((img, index) => (
          <div
            key={img.imageblogid || index}
            className="blog-form-image-wrapper"
          >
            <img src={img.image} alt="Uploaded" className="blog-form-image" />
            <button
              onClick={() => handleRemoveImage(img.imageblogid)}
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
            checked={blog.blog?.status === "ENABLE"}
            onChange={() =>
              setBlog({
                ...blog,
                blog: {
                  ...blog.blog,
                  status: blog.blog?.status === "ENABLE" ? "DISABLE" : "ENABLE",
                },
              })
            }
          />
          <span className="blog-form-status-text">
            {blog.blog?.status === "ENABLE"
              ? "Kích hoạt Blog"
              : "Vô hiệu hóa Blog"}
          </span>
        </label>
      </div>

      <button onClick={handleSubmit} className="blog-form-submit-button">
        Cập nhật Blog
      </button>

      {isModalOpen && (
        <div className="create-blog-modal">
          <div className="create-blog-modal-content">
            <h3>Xác nhận cập nhật Blog</h3>
            <p>Bạn có chắc muốn cập nhật lại blog này không?</p>
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
            <p>Blog đã được cập nhật thành công.</p>
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

export default EditBlogForm;
