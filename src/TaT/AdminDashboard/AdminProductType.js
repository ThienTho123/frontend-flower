import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; 

const AdminProductType = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [editingProductTypeId, setEditingProductTypeId] = useState(null);
  const [newProductType, setNewProductType] = useState({ typeName: "", categoryID: "", status: "Enable" });
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/producttype", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách loại sản phẩm.");
        }

        const data = await response.json();
        setProductTypes(data.ProductType); // Thay đổi theo cấu trúc dữ liệu trả về
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProductTypes();
  }, [accesstoken]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/producttype/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        setProductTypes((prevProductTypes) =>
          prevProductTypes.map((type) =>
            type.productTypeID === id ? { ...type, status: "Disable" } : type
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa loại sản phẩm.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, typeName, categoryID, status) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/producttype/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ typeName, categoryID: { categoryID }, status }), // Cập nhật đúng định dạng
      });

      if (response.ok) {
        const updatedProductType = await response.json();
        setProductTypes((prevProductTypes) =>
          prevProductTypes.map((type) =>
            type.productTypeID === id ? updatedProductType : type
          )
        );
        setEditingProductTypeId(null);
      } else {
        throw new Error("Không thể cập nhật loại sản phẩm.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    // Kiểm tra các trường nhập
    if (!newProductType.typeName || !newProductType.categoryID) {
      setError("Vui lòng điền đủ các trường cần thiết.");
      return;
    }
  
    // In ra log dữ liệu sẽ được gửi trong yêu cầu POST
    console.log("Dữ liệu sẽ được gửi:", {
      typeName: newProductType.typeName,
      categoryID: { categoryID: newProductType.categoryID },
      status: newProductType.status,
    });
  
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/producttype", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          typeName: newProductType.typeName,  // Đảm bảo trường này là đầu tiên
          categoryID: { categoryID: newProductType.categoryID }, // Trường thứ hai
          status: newProductType.status // Trường thứ ba
        }),
      });
  
      if (response.ok) {
        const createdProductType = await response.json();
        setProductTypes([...productTypes, createdProductType]);
        setNewProductType({ typeName: "", categoryID: "", status: "Enable" }); // Reset input fields
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
      <h2>Quản Lý Loại Sản Phẩm</h2>
    </div>
      <h3>Thêm Loại Sản Phẩm Mới</h3>
      <div>
        <label>Tên Loại Sản Phẩm: </label>
        <input
          type="text"
          value={newProductType.typeName}
          onChange={(e) => setNewProductType({ ...newProductType, typeName: e.target.value })}
        />
        <label>ID Danh Mục: </label>
        <input
          type="text"
          value={newProductType.categoryID}
          onChange={(e) => setNewProductType({ ...newProductType, categoryID: e.target.value })}
        />
        <label>Trạng thái: </label>
        <select
          value={newProductType.status}
          onChange={(e) => setNewProductType({ ...newProductType, status: e.target.value })}
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {productTypes.length === 0 ? (
        <p>Không có loại sản phẩm nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Loại Sản Phẩm</th>
              <th>Tên Loại Sản Phẩm</th>
              <th>ID Danh Mục</th>
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {productTypes.map((type) => (
              <tr key={type.productTypeID}>
                <td>{type.productTypeID}</td>
                <td>
                  {editingProductTypeId === type.productTypeID ? (
                    <input
                      type="text"
                      value={type.typeName}
                      onChange={(e) =>
                        setProductTypes((prevProductTypes) =>
                          prevProductTypes.map((t) =>
                            t.productTypeID === type.productTypeID
                              ? { ...t, typeName: e.target.value }
                              : t
                          )
                        )
                      }
                    />
                  ) : (
                    type.typeName
                  )}
                </td>
                <td>
                  {editingProductTypeId === type.productTypeID ? (
                    <input
                      type="text"
                      value={type.categoryID.categoryID} // Hiển thị ID danh mục
                      onChange={(e) =>
                        setProductTypes((prevProductTypes) =>
                          prevProductTypes.map((t) =>
                            t.productTypeID === type.productTypeID
                              ? { ...t, categoryID: { categoryID: e.target.value } }
                              : t
                          )
                        )
                      }
                    />
                  ) : (
                    type.categoryID.categoryID // Hiển thị ID danh mục
                  )}
                </td>
                <td>
                  {editingProductTypeId === type.productTypeID ? (
                    <select
                      value={type.status}
                      onChange={(e) =>
                        setProductTypes((prevProductTypes) =>
                          prevProductTypes.map((t) =>
                            t.productTypeID === type.productTypeID
                              ? { ...t, status: e.target.value }
                              : t
                          )
                        )
                      }
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  ) : (
                    type.status
                  )}
                </td>
                <td>
                  {editingProductTypeId === type.productTypeID ? (
                    <>
                      <button onClick={() => handleSave(type.productTypeID, type.typeName, type.categoryID.categoryID, type.status)}>Lưu</button>
                      <button onClick={() => setEditingProductTypeId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingProductTypeId(type.productTypeID)}>Chỉnh Sửa</button>
                      <button onClick={() => handleDelete(type.productTypeID)}>Xóa</button>
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

export default AdminProductType;
