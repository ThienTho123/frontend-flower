import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; 


const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/category", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách loại sản phẩm.");
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, [accesstoken]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/category/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.categoryID === id ? { ...category, status: "Disable" } : category
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa loại sản phẩm.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, categoryName, status) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/category/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ categoryName, status }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.categoryID === id ? updatedCategory : category
          )
        );
        setEditingCategoryId(null);
      } else {
        throw new Error("Không thể cập nhật loại sản phẩm.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/category", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ categoryName: newCategoryName, status: "Enable" }),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories([...categories, createdCategory]);
        setNewCategoryName("");
      } else {
        throw new Error("Không thể tạo loại sản phẩm.");
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
      <h2>Quản Lý Danh Mục Sản Phẩm</h2>
    </div>
      <h3>Thêm Danh Mục Sản Phẩm Mới</h3>
      <div>
        <label>Tên Danh Mục Sản Phẩm: </label>
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {categories.length === 0 ? (
        <p>Không có danh mục sản phẩm nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Danh Mục Sản Phẩm</th>
              <th>Tên Danh Mục Sản Phẩm</th>
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.categoryID}>
                <td>{category.categoryID}</td>
                <td>
                  {editingCategoryId === category.categoryID ? (
                    <input
                      value={category.categoryName}
                      onChange={(e) =>
                        setCategories((prevCategories) =>
                          prevCategories.map((c) =>
                            c.categoryID === category.categoryID
                              ? { ...c, categoryName: e.target.value }
                              : c
                          )
                        )
                      }
                    />
                  ) : (
                    category.categoryName
                  )}
                </td>
                <td>
                  {editingCategoryId === category.categoryID ? (
                    <select
                      value={category.status}
                      onChange={(e) =>
                        setCategories((prevCategories) =>
                          prevCategories.map((c) =>
                            c.categoryID === category.categoryID
                              ? { ...c, status: e.target.value }
                              : c
                          )
                        )
                      }
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  ) : (
                    category.status
                  )}
                </td>
                <td>
                  {editingCategoryId === category.categoryID ? (
                    <>
                      <button onClick={() => handleSave(category.categoryID, category.categoryName, category.status)}>Lưu</button>
                      <button onClick={() => setEditingCategoryId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingCategoryId(category.categoryID)}>Chỉnh Sửa</button>
                      <button onClick={() => handleDelete(category.categoryID)}>Xóa</button>
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

export default AdminCategory;
