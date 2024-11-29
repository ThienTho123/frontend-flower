import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminFlowerImage = () => {
  const [flowerImageList, setFlowerImageList] = useState([]);
  const [flowerList, setFlowerList] = useState([]); // Danh sách hoa để tạo dropdown
  const [newFlowerImage, setNewFlowerImage] = useState({
    imageURL: "",
    flower: { flowerID: null },
    status: "ENABLE",
  });
  const [editingFlowerImageId, setEditingFlowerImageId] = useState(null);
  const [error, setError] = useState(null);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0); // Lưu vị trí cuộn
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchFlowerImages = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/flowerimage", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        setFlowerImageList(Array.isArray(data.flowerImages) ? data.flowerImages : []); // Đảm bảo là array
        setFlowerList(Array.isArray(data.flowers) ? data.flowers : []); // Đảm bảo flowers là array
      } catch (err) {
        console.error("Error fetching flower images:", err.message);
        setError(err.message);
      }
    };

    fetchFlowerImages();
  }, [accesstoken]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadImage = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/v1/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const imageUrl = data.DT;
        setImageUrl(imageUrl);
        setNewFlowerImage((prev) => ({
          ...prev,
          imageURL: imageUrl,
        }));
        console.log("Upload successful:", imageUrl);
      } else {
        console.error("Upload error:", data.EM);
      }
    } catch (err) {
      console.error("Upload error:", err.message);
    }
  };

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flowerimage/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setFlowerImageList((prev) =>
          prev.map((image) =>
            image.flowerImageID === id ? { ...image, status: "DISABLE" } : image
          )
        );
      } else {
        throw new Error("Unable to disable flower image.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flowerimage/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setFlowerImageList((prev) => prev.filter((image) => image.flowerImageID !== id));
      } else {
        throw new Error("Unable to delete flower image.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, imageData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flowerimage/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(imageData),
        }
      );

      if (response.ok) {
        const updatedImage = await response.json();
        setFlowerImageList((prev) =>
          prev.map((image) =>
            image.flowerImageID === id ? updatedImage : image
          )
        );
        setEditingFlowerImageId(null);
        window.location.reload();
        window.scrollTo(0, savedScrollPosition);
      } else {
        throw new Error("Unable to update flower image.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/flowerimage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newFlowerImage),
      });

      if (response.ok) {
        const createdImage = await response.json();
        setFlowerImageList([...flowerImageList, createdImage]);
        setNewFlowerImage({
          imageURL: "",
          flower: { flowerID: null },
          status: "ENABLE",
        });
        window.location.reload();
        window.scrollTo(0, document.body.scrollHeight);
      } else {
        throw new Error("Unable to create flower image.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (image) => {
    // Lưu vị trí cuộn hiện tại
    setSavedScrollPosition(window.scrollY);

    setEditingFlowerImageId(image.flowerImageID);
    setNewFlowerImage({ ...image });

    // Cuộn lên đầu trang
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="admin-ql-container">
      <div className="title-container">
        <img
          src={returnIcon}
          alt="Return"
          className="return-button"
          onClick={handleBackToDashboard}
        />
        <h2>Quản lý hình ảnh hoa</h2>
      </div>

      <h3>{editingFlowerImageId ? "Chỉnh sửa hình ảnh hoa" : "Thêm mới hình ảnh hoa"}</h3>
      <div>
        <label>Image URL:</label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Upload Image</button>
        {imageUrl && <img src={imageUrl} alt="Flower" style={{ width: 100 }} />}
        <br></br>
        <label>Flower:</label>
        <select
          value={newFlowerImage.flower.flowerID || ""}
          onChange={(e) =>
            setNewFlowerImage((prev) => ({
              ...prev,
              flower: { flowerID: e.target.value },
            }))
          }
        >
          <option value="">Chọn hoa</option>
          {flowerList.map((flower) => (
            <option key={flower.flowerID} value={flower.flowerID}>
              {flower.name}
            </option>
          ))}
        </select>

        <label>Status:</label>
        <select
          value={newFlowerImage.status}
          onChange={(e) =>
            setNewFlowerImage((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>

        <button
          onClick={
            editingFlowerImageId
              ? () => handleSave(editingFlowerImageId, newFlowerImage)
              : handleCreate
          }
        >
          {editingFlowerImageId ? "Lưu chỉnh sửa" : "Thêm mới"}
        </button>
      </div>

      <h3>Danh sách hình ảnh hoa</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Flower</th>
            <th>Image</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flowerImageList.map((image) => (
            <tr key={image.flowerImageID}>
              <td>{image.flowerImageID}</td>
              <td>{image.flower.name}</td>
              <td>
                <img
                  src={image.imageURL}
                  alt={image.flower.name}
                  style={{ width: 100 }}
                />
              </td>
              <td>{image.status}</td>
              <td>
                <button onClick={() => handleEdit(image)}>Sửa</button>
                <button onClick={() => handleDeleteSoft(image.flowerImageID)}>
                  Vô hiệu hóa
                </button>
                <button onClick={() => handleDeleteHard(image.flowerImageID)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminFlowerImage;
