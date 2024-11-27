import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; 


const AdminBrand = () => {
  const [brands, setBrands] = useState([]);
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [newBrandName, setNewBrandName] = useState("");
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/brand",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách thương hiệu.");
        }

        const data = await response.json();
        setBrands(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBrands();
  }, [accesstoken]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/brand/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setBrands((prevBrands) =>
          prevBrands.map((brand) =>
            brand.brandID === id ? { ...brand, status: "Disable" } : brand
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa thương hiệu.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, brandName, status) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/brand/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ brandName, status }),
        }
      );

      if (response.ok) {
        const updatedBrand = await response.json();
        setBrands((prevBrands) =>
          prevBrands.map((brand) =>
            brand.brandID === id ? updatedBrand : brand
          )
        );
        setEditingBrandId(null);
      } else {
        throw new Error("Không thể cập nhật thương hiệu.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/brand", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ brandName: newBrandName, status: "Enable" }),
      });

      if (response.ok) {
        const createdBrand = await response.json();
        setBrands([...brands, createdBrand]);
        setNewBrandName("");
      } else {
        throw new Error("Không thể tạo thương hiệu.");
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
      <h2>Quản Lý Thương Hiệu</h2>
    </div>
      <h3>Thêm Thương Hiệu Mới</h3>
      <div>
        <label>Tên Thương Hiệu: </label>
        <input
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
        />
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {brands.length === 0 ? (
        <p>Không có thương hiệu nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Thương Hiệu</th>
              <th>Tên Thương Hiệu</th>
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.brandID}>
                <td>{brand.brandID}</td>
                <td>
                  {editingBrandId === brand.brandID ? (
                    <input
                      value={brand.brandName}
                      onChange={(e) =>
                        setBrands((prevBrands) =>
                          prevBrands.map((b) =>
                            b.brandID === brand.brandID
                              ? { ...b, brandName: e.target.value }
                              : b
                          )
                        )
                      }
                    />
                  ) : (
                    brand.brandName
                  )}
                </td>
                <td>
                  {editingBrandId === brand.brandID ? (
                    <select
                      value={brand.status}
                      onChange={(e) =>
                        setBrands((prevBrands) =>
                          prevBrands.map((b) =>
                            b.brandID === brand.brandID
                              ? { ...b, status: e.target.value }
                              : b
                          )
                        )
                      }
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  ) : (
                    brand.status
                  )}
                </td>
                <td>
                  {editingBrandId === brand.brandID ? (
                    <>
                      <button
                        onClick={() =>
                          handleSave(brand.brandID, brand.brandName, brand.status)
                        }
                      >
                        Lưu
                      </button>
                      <button onClick={() => setEditingBrandId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingBrandId(brand.brandID)}>Sửa</button>
                      <button onClick={() => handleDelete(brand.brandID)}>Xóa</button>
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

export default AdminBrand;
