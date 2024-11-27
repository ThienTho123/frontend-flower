import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; 


const AdminImage = () => {
  const [images, setImages] = useState([]);
  const [editingImageId, setEditingImageId] = useState(null);
  const [newImageURL, setNewImageURL] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [newImageStatus, setNewImageStatus] = useState("Enable"); // Thêm trạng thái mới
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [file, setFile] = useState(null); 

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/images", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách hình ảnh.");
        }

        const data = await response.json();
        setImages(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchImages();
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
        setNewImageURL(data.DT); 
        console.log("Tải lên thành công:", data.DT);
        if (editingImageId) {
          setImages((prevImages) =>
            prevImages.map((image) =>
              image.imageID === editingImageId ? { ...image, imageURL: data.DT } : image
            )
          );
        }
      } else {
        console.error("Lỗi khi tải lên:", data.EM);
      }
    } catch (err) {
      console.error("Lỗi khi tải lên:", err.message);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/images/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        setImages((prevImages) =>
          prevImages.map((image) =>
            image.imageID === id ? { ...image, status: "Disable" } : image
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa hình ảnh.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, imageURL, productId, status) => {
    try {
      // Sử dụng URL hình ảnh mới đã được cập nhật
      const response = await fetch(`http://localhost:8080/api/v1/admin/images/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ imageURL, product: { productID: productId }, status }),
      });
  
      if (response.ok) {
        const updatedImage = await response.json();
        setImages((prevImages) =>
          prevImages.map((image) =>
            image.imageID === id ? updatedImage : image
          )
        );
        setEditingImageId(null);
      } else {
        throw new Error("Không thể cập nhật hình ảnh.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          imageURL: newImageURL, 
          product: { productID: selectedProductId }, 
          status: newImageStatus // Gửi trạng thái mới
        }),
      });

      if (response.ok) {
        const createdImage = await response.json();
        setImages([...images, createdImage]);
        setNewImageURL("");
        setSelectedProductId("");
        setNewImageStatus("Enable"); // Reset trạng thái mới
      } else {
        throw new Error("Không thể tạo hình ảnh.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
<div className="admin-ql-container">
<div className="title-container">
      <img 
        src={returnIcon} 
        alt="Quay Lại" 
        className="return-button" 
        onClick={handleBackToDashboard} 
      />
      <h2>Quản Lý Hình Ảnh Sản Phẩm</h2>
    </div>
      <h3>Thêm Hình Ảnh Mới</h3>
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Tải Lên Hình Ảnh</button>
        {newImageURL && (
          <img src={newImageURL} alt="Hình Ảnh" style={{ width: 100, height: 'auto' }} />
        )}
        <label>Sản Phẩm ID: </label>
        <input
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        />
        <label>Trạng Thái: </label>
        <select 
          value={newImageStatus} 
          onChange={(e) => setNewImageStatus(e.target.value)}
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {images.length === 0 ? (
        <p>Không có hình ảnh nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Hình Ảnh</th>
              <th>URL Hình Ảnh</th>
              <th>Sản Phẩm ID</th>
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <tr key={image.imageID}>
                <td>{image.imageID}</td>
                <td>
                {editingImageId === image.imageID ? (
                  <div>
                    <label>Chọn file: </label>
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleUploadImage}>Tải ảnh lên</button>
                    {newImageURL && <img src={newImageURL} alt="Hình Ảnh Mới" style={{ width: 100 }} />}
                  </div>
                ) : (
                  <img src={image.imageURL} alt="Hình Ảnh" style={{ width: 100 }} />
                )}
                </td>
                <td>
                  {editingImageId === image.imageID ? (
                    <input
                      value={image.product.productID}
                      onChange={(e) =>
                        setImages((prevImages) =>
                          prevImages.map((i) =>
                            i.imageID === image.imageID
                              ? { ...i, product: { productID: e.target.value } }
                              : i
                          )
                        )
                      }
                    />
                  ) : (
                    image.product.productID
                  )}
                </td>
                <td>
                  {editingImageId === image.imageID ? (
                    <select
                      value={image.status}
                      onChange={(e) =>
                        setImages((prevImages) =>
                          prevImages.map((i) =>
                            i.imageID === image.imageID
                              ? { ...i, status: e.target.value }
                              : i
                          )
                        )
                      }
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  ) : (
                    image.status
                  )}
                </td>
                <td>
                  {editingImageId === image.imageID ? (
                    <>
                      <button onClick={() => handleSave(image.imageID, image.imageURL, image.product.productID, image.status)}>Lưu</button>
                      <button onClick={() => setEditingImageId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingImageId(image.imageID)}>Chỉnh Sửa</button>
                      <button onClick={() => handleDelete(image.imageID)}>Xóa</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminImage;
