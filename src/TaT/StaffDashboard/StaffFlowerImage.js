import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const StaffFlowerImage = () => {
  const [flowerImageList, setFlowerImageList] = useState([]);
  const [flowerList, setFlowerList] = useState([]); // Danh sách hoa
  const [newFlowerImage, setNewFlowerImage] = useState({
    imageURL: "",
    flower: { flowerID: null },
    status: "ENABLE",
  });
  const [editingFlowerImageId, setEditingFlowerImageId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Lấy danh sách ảnh hoa và danh sách hoa từ API tổng
  useEffect(() => {
    const fetchFlowerData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/staff/flower", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Error fetching flower data.");
        const data = await response.json();
  
        // Gán danh sách hoa từ API trả về
        setFlowerList(data.flower || []);
      } catch (err) {
        setError(err.message);
      }
    };
  
    const fetchFlowerImages = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/staff/flowerimage", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Error fetching flower images.");
        const data = await response.json();
        
        // Fix here: data.flowerImage contains the flower images, so set it correctly
        setFlowerImageList(data.flowerImage || []);
      } catch (err) {
        setError(err.message);
      }
    };
  
    fetchFlowerData();
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
        `http://localhost:8080/api/v1/staff/flowerimage/softdelete/${id}`,
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

  const handleSave = async (id, imageData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/flowerimage/${id}`,
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

      } else {
        throw new Error("Unable to update flower image.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/staff/flowerimage", {
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

      } else {
        throw new Error("Unable to create flower image.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (image) => {
    setEditingFlowerImageId(image.flowerImageID);
    setNewFlowerImage({ ...image });
    window.scrollTo(0, 0);

  };

  const handleBackToDashboard = () => {
    navigate("/staff");
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
        <label>Tên hoa:</label>
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

        <label>Trạng thái:</label>
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
          {editingFlowerImageId ? "Save Changes" : "Create Image"}
        </button>
      </div>

      <h3>Danh sách hình ảnh hoa</h3>
      {flowerImageList.length === 0 ? (
        <p>No flower images available.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Flower</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flowerImageList.map((image) => (
              <tr key={image.flowerImageID}>
                <td>{image.flowerImageID}</td>
                <td>
                  <img src={image.imageURL} alt="Flower" style={{ width: 100 }} />
                </td>
                <td>{image.flower.name}</td>
                <td>{image.status}</td>
                <td>
                  <button onClick={() => handleEdit(image)}>Sửa</button>
                  <button onClick={() => handleDeleteSoft(image.flowerImageID)}>
                    Vô hiệu hóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default StaffFlowerImage;
