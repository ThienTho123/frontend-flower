import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "../StaffDashboard/CreateBlogForm.css";

const AdminEditDetect = () => {
  const { id } = useParams();
  const [detect, setDetect] = useState({
    flowerdetect: "",
    vietnamname: "",
    status: "ENABLE",
    imageurl: "",
    origin: "",
    timebloom: "",
    characteristic: "",
    flowerlanguage: "",
    bonus: "",
    uses: "",
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
      .get(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/detect/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((response) => {
        setDetect(response.data);
        setSelectedFlowers(
          response.data.detectFlowers?.map((flower) => ({
            flowerID: flower.flower.flowerID,
            name: flower.flower.name,
            image: flower.flower.image,
          })) || []
        );
      })
      .catch((error) => console.error("Error fetching blog:", error));
  }, [id]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://deploybackend-j61h.onrender.com/api/v1/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const imageUrl = response.data.DT;

      setDetect({
        ...detect,
        detect: {
          ...detect.detect,
          imageurl: imageUrl,
        },
      });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setDetect({
      ...detect,
      detect: {
        ...detect.detect,
        imageurl: null,
      },
    });
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

    if (!detect.detect.flowerdetect?.trim()) {
      alert("Vui lòng nhập nhận diện!");
      return;
    }
    setIsModalOpen(true);
  };
  const confirmSubmit = async () => {
    const accessToken = localStorage.getItem("access_token");

    const updatedDetect = {
      flowerdetect: detect.detect.flowerdetect,
      vietnamname: detect.detect.vietnamname,
      status: detect.detect.status || "ENABLE",
      imageurl: detect.detect.imageurl,
      origin: detect.detect.origin,
      timebloom: detect.detect.timebloom,
      characteristic: detect.detect.characteristic,
      flowerlanguage: detect.detect.flowerlanguage,
      bonus: detect.detect.bonus,
      uses: detect.detect.uses,
    };
    const flowerId = selectedFlowers.map((flower) => flower.flowerID);
    const detectInfo = {
      detect: updatedDetect,
      flowerId: flowerId,
    };
    console.log("Dữ liệu trước khi submit:", detectInfo);

    axios
      .put(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/detect/${id}`,
        detectInfo,
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
      <h2 className="blog-form-title">Chỉnh sửa Nhận diện</h2>

      <input
        type="text"
        className="blog-form-input"
        placeholder="Nhập tên nhận diện"
        value={detect.detect?.flowerdetect || ""}
        onChange={(e) =>
          setDetect({
            ...detect,
            detect: { ...detect.detect, flowerdetect: e.target.value },
          })
        }
      />

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập tên Tiếng Việt của hoa"
        rows="4"
        value={detect.detect?.vietnamname || ""}
        onChange={(e) =>
          setDetect({
            ...detect,
            detect: { ...detect.detect, vietnamname: e.target.value },
          })
        }
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập nguồn gốc của hoa"
        rows="4"
        value={detect.detect?.origin || ""}
        onChange={(e) =>
          setDetect({
            ...detect,
            detect: { ...detect.detect, origin: e.target.value },
          })
        }
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập mùa hoa nở"
        rows="4"
        value={detect.detect?.timebloom || ""}
        onChange={(e) =>
          setDetect({
            ...detect,
            detect: { ...detect.detect, timebloom: e.target.value },
          })
        }
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập đặc điểm của hoa"
        rows="8"
        value={detect.detect?.characteristic || ""}
        onChange={(e) =>
          setDetect({
            ...detect,
            detect: { ...detect.detect, characteristic: e.target.value },
          })
        }
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập ý nghĩa của hoa"
        rows="6"
        value={detect.detect?.flowerlanguage || ""}
        onChange={(e) =>
          setDetect({
            ...detect,
            detect: { ...detect.detect, flowerlanguage: e.target.value },
          })
        }
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập thông tin thêm cho hoa"
        rows="4"
        value={detect.detect?.bonus || ""}
        onChange={(e) =>
          setDetect({
            ...detect,
            detect: { ...detect.detect, bonus: e.target.value },
          })
        }
      ></textarea>

      <textarea
        className="blog-form-textarea"
        placeholder="Nhập công dụng của hoa"
        rows="4"
        value={detect.detect?.uses || ""}
        onChange={(e) =>
          setDetect({
            ...detect,
            detect: { ...detect.detect, uses: e.target.value },
          })
        }
      ></textarea>

      <input
        type="file"
        onChange={handleImageUpload}
        className="blog-form-file-input"
      />
      {loading && <p className="blog-form-loading">Đang tải ảnh...</p>}

      <div className="blog-form-images">
        {detect.detect?.imageurl && (
          <div className="blog-form-image-wrapper">
            <img
              src={detect.detect?.imageurl}
              alt="Uploaded"
              className="blog-form-image"
            />
            <button
              onClick={() => handleRemoveImage()}
              className="blog-form-delete-image"
            >
              <span>✖</span>
            </button>
          </div>
        )}
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
            checked={detect.detect?.status === "ENABLE"}
            onChange={() =>
              setDetect({
                ...detect,
                detect: {
                  ...detect.detect,
                  status:
                    detect.detect?.status === "ENABLE" ? "DISABLE" : "ENABLE",
                },
              })
            }
          />
          <span className="blog-form-status-text">
            {detect.detect?.status === "ENABLE" ? "Kích hoạt" : "Vô hiệu hóa"}
          </span>
        </label>
      </div>

      <button onClick={handleSubmit} className="blog-form-submit-button">
        Cập nhật Nhận diện
      </button>

      {isModalOpen && (
        <div className="create-blog-modal">
          <div className="create-blog-modal-content">
            <h3>Xác nhận cập nhật Nhận diện</h3>
            <p>Bạn có chắc muốn cập nhật lại Nhận diện này không?</p>
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
            <p>Nhận diện đã được cập nhật thành công.</p>
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

export default AdminEditDetect;
