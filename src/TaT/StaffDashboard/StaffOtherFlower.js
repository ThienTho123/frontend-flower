import React, { useEffect, useState } from "react";
import returnIcon from "./ImageDashboard/return-button.png";
import { useNavigate } from "react-router-dom";

const StaffOtherFlower = () => {
  const navigate = useNavigate();

  const [dataList, setDataList] = useState([]);
  const [formData, setFormData] = useState({
    flowerID: null,
    otherID: null,
    flowerName: "",
    otherName: "",
    price: "",
    type: "flower", // hoặc "other"
    status: "ENABLE",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [filterType, setFilterType] = useState("flower"); // chỉ hiển thị 1 loại
  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/staff/floother", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });
      const data = await res.json();
      const fullList = data.floOthCustomDTOS || [];
      const filteredList = fullList.filter(
        (item) => item.type === filterType.toLowerCase()
      );
      setDataList(filteredList);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateOrUpdate = async () => {
    const method = editingIndex !== null ? "PUT" : "POST";
    const url = "http://localhost:8080/api/v1/staff/floother";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchData();
        setFormData({
          flowerID: null,
          otherID: null,
          flowerName: "",
          otherName: "",
          price: "",
          type: filterType,
          status: "ENABLE",
        });
        setEditingIndex(null);
      } else {
        console.error("Failed to save data");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingIndex(item.type === "flower" ? item.flowerID : item.otherID);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (item) => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/staff/floother", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(item),
      });

      if (res.ok) {
        fetchData();
      } else {
        console.error("Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting:", err);
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
        <h2>Quản lý hoa và vật phẩm theo yêu cầu</h2>
      </div>
      <div>
        <label>Lọc theo loại:</label>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setFormData({ ...formData, type: e.target.value });
          }}
        >
          <option value="flower">Flower</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <h3>
          {editingIndex !== null ? "Chỉnh sửa" : "Thêm mới"} {filterType}
        </h3>
        {filterType === "flower" ? (
          <>
            <label>Tên hoa:</label>
            <input
              name="flowerName"
              value={formData.flowerName}
              onChange={handleInputChange}
            />
          </>
        ) : (
          <>
            <label>Tên khác:</label>
            <input
              name="otherName"
              value={formData.otherName}
              onChange={handleInputChange}
            />
          </>
        )}

        <label>Giá:</label>
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleInputChange}
        />

        <label>Trạng thái:</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="ENABLE">ENABLE</option>
          <option value="DISABLE">DISABLE</option>
        </select>

        <button onClick={handleCreateOrUpdate}>
          {editingIndex !== null ? "Lưu" : "Thêm"}
        </button>
      </div>

      <hr />

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((item, idx) => (
            <tr key={idx}>
              <td>{item.type === "flower" ? item.flowerID : item.otherID}</td>
              <td>
                {item.type === "flower" ? item.flowerName : item.otherName}
              </td>
              <td>{item.price}</td>
              <td>{item.type}</td>
              <td>{item.status}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Sửa</button>
                {item.status === "DISABLE" ? (
                  <button onClick={() => handleDelete(item)}>Khôi phục</button>
                ) : (
                  <button onClick={() => handleDelete(item)}>Xóa</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffOtherFlower;
