import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const StaffFlower = () => {
  const [flowerList, setFlowerList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [newFlower, setNewFlower] = useState({
    name: "",
    description: "",
    image: "",
    languageOfFlowers: "",
    category: { categoryID: null },
    purpose: { purposeID: null },
    status: "ENABLE",
  });
  const [editingFlowerId, setEditingFlowerId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/staff/flower", {
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
        setFlowerList(data.flower || []);
        setCategories(data.category || []);
        setPurposes(data.purpose || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError(err.message);
      }
    };

    fetchData();
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
        setNewFlower((prev) => ({
          ...prev,
          image: imageUrl,
        }));
        console.log("Upload successful:", imageUrl);
      } else {
        console.error("Upload error:", data.EM);
      }
    } catch (err) {
      console.error("Upload error:", err.message);
    }
  };

  const handleSave = async (id, flowerData) => {
    if (!flowerData.name || !flowerData.description || !flowerData.languageOfFlowers || !flowerData.category.categoryID || !flowerData.purpose.purposeID|| 
      !flowerData.image) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/v1/staff/flower/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(flowerData),
      });
  
      if (response.ok) {
        const updatedFlower = await response.json();
        setFlowerList((prev) =>
          prev.map((flower) => (flower.flowerID === id ? updatedFlower : flower))
        );
        setEditingFlowerId(null);
        setError(null); // Reset lỗi khi thành công
        window.location.reload();
      } else {
        throw new Error("Không thể cập nhật hoa.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  

  const handleCreate = async () => {
    if (!newFlower.name || !newFlower.description || !newFlower.languageOfFlowers || !newFlower.category.categoryID || !newFlower.purpose.purposeID|| 
      !newFlower.image) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    try {
      const formattedData = { ...newFlower };
      const response = await fetch("http://localhost:8080/api/v1/staff/flower", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formattedData),
      });
  
      if (response.ok) {
        const createdFlower = await response.json();
        setFlowerList([...flowerList, createdFlower]);
        setNewFlower({
          name: "",
          description: "",
          image: "",
          languageOfFlowers: "",
          category: { categoryID: null },
          purpose: { purposeID: null },
          status: "ENABLE",
        });
        setError(null); // Reset lỗi khi thành công
        window.location.reload();
      } else {
        throw new Error("Không thể tạo hoa.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  

  const handleEdit = (flower) => {
    setEditingFlowerId(flower.flowerID);
    setNewFlower({ ...flower });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/staff/flower/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setFlowerList((prev) =>
          prev.map((flower) =>
            flower.flowerID === id ? { ...flower, status: "DISABLE" } : flower
          )
        );
      } else {
        throw new Error("Unable to disable flower.");
      }
    } catch (err) {
      setError(err.message);
    }
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
        <h2>Quản lý hoa - Nhân viên</h2>
      </div>

      <h3>{editingFlowerId ? "Chỉnh sửa hoa" : "Thêm mới hoa"}</h3>
      <div>
        <label>Tên Hoa:</label>
        <input
          type="text"
          value={newFlower.name}
          onChange={(e) =>
            setNewFlower((prev) => ({ ...prev, name: e.target.value }))
          }
        />

        <label>Mô tả:</label>
        <textarea
          value={newFlower.description}
          onChange={(e) =>
            setNewFlower((prev) => ({ ...prev, description: e.target.value }))
          }
        ></textarea>

        <label>Ngôn Ngữ Hoa:</label>
        <textarea
          value={newFlower.languageOfFlowers}
          onChange={(e) =>
            setNewFlower((prev) => ({ ...prev, languageOfFlowers: e.target.value }))
          }
        ></textarea>

        <label>Danh Mục:</label>
        <select
          value={newFlower.category.categoryID || ""}
          onChange={(e) =>
            setNewFlower((prev) => ({
              ...prev,
              category: { categoryID: parseInt(e.target.value) },
            }))
          }
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.categoryID} value={category.categoryID}>
              {category.categoryName}
            </option>
          ))}
        </select>

        <label>Mục Đích:</label>
        <select
          value={newFlower.purpose.purposeID || ""}
          onChange={(e) =>
            setNewFlower((prev) => ({
              ...prev,
              purpose: { purposeID: parseInt(e.target.value) },
            }))
          }
        >
          <option value="">Chọn mục đích</option>
          {purposes.map((purpose) => (
            <option key={purpose.purposeID} value={purpose.purposeID}>
              {purpose.purposeName}
            </option>
          ))}
        </select>

        <label>Trạng Thái:</label>
        <select
          value={newFlower.status}
          onChange={(e) =>
            setNewFlower((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">ENABLE</option>
          <option value="DISABLE">DISABLE</option>
        </select>

        <label>Hình Ảnh:</label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Tải lên</button>
        {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ width: 100 }} />}
        <br></br>

        <button onClick={editingFlowerId ? () => handleSave(editingFlowerId, newFlower) : handleCreate}>
          {editingFlowerId ? "Lưu thay đổi" : "Thêm hoa"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Danh sách hoa</h3>
      <table>
        <thead>
          <tr>
            <th>ID Hoa</th>
            <th>Tên Hoa</th>
            <th>Hình Ảnh</th>
            <th>Mô Tả</th>
            <th>Ngôn Ngữ Hoa</th>
            <th>Danh Mục</th>
            <th>Mục Đích</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {flowerList.map((flower) => (
            <tr key={flower.flowerID}>
              <td>{flower.flowerID}</td>
              <td>{flower.name}</td>
              <td>
                {flower.image ? (
                  <img src={flower.image} alt={flower.name} style={{ width: 100 }} />
                ) : (
                  "Không có hình ảnh"
                )}
              </td>
              <td>{flower.description}</td>
              <td>{flower.languageOfFlowers}</td>
              <td>{flower.category?.categoryName || "N/A"}</td>
              <td>{flower.purpose?.purposeName || "N/A"}</td>
              <td>{flower.status}</td>
              <td>
                <button onClick={() => handleEdit(flower)}>Sửa</button>
                <button onClick={() => handleDelete(flower.flowerID)}>Vô hiệu</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffFlower;

