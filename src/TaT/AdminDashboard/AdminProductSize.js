import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; 

const AdminProductSize = () => {
  const [productSizes, setProductSizes] = useState([]);
  const [editingProductSizeId, setEditingProductSizeId] = useState(null);
  const [newProductSize, setNewProductSize] = useState({ productID: "", sizeID: "", stock: "", status: "Enable" });
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductSizes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/productsize", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách kích thước sản phẩm.");
        }

        const data = await response.json();
        setProductSizes(data.ProductSize); // Thay đổi theo cấu trúc dữ liệu trả về
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProductSizes();
  }, [accesstoken]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/productsize/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        setProductSizes((prevProductSizes) =>
          prevProductSizes.map((size) =>
            size.productSizeID === id ? { ...size, status: "Disable" } : size
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa kích thước sản phẩm.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, productID, sizeID, stock, status) => {
    try {
      const updatedProductSizeData = {
        productID: { productID: parseInt(productID) }, // Giữ nguyên productID
        sizeID: { sizeID: parseInt(sizeID) }, // Giữ nguyên sizeID
        stock: parseInt(stock), // Chuyển đổi sang số
        status: status,
      };
  
      const response = await fetch(`http://localhost:8080/api/v1/admin/productsize/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProductSizeData),
      });
  
      if (response.ok) {
        const updatedProductSize = await response.json();
        setProductSizes((prevProductSizes) =>
          prevProductSizes.map((size) =>
            size.productSizeID === id ? updatedProductSize : size
          )
        );
        setEditingProductSizeId(null);
      } else {
        throw new Error("Không thể cập nhật kích thước sản phẩm.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  

  const handleCreate = async () => {
    // Kiểm tra các trường nhập
    if (!newProductSize.productID || !newProductSize.sizeID || !newProductSize.stock) {
      setError("Vui lòng điền đủ các trường cần thiết.");
      return;
    }

    try {
      // Tạo đối tượng dữ liệu theo cấu trúc mong muốn
      const productSizeData = {
        productID: { productID: parseInt(newProductSize.productID) }, // Chuyển đổi sang số
        sizeID: { sizeID: parseInt(newProductSize.sizeID) }, // Chuyển đổi sang số
        stock: parseInt(newProductSize.stock), // Chuyển đổi sang số
        status: newProductSize.status,
      };

      const response = await fetch("http://localhost:8080/api/v1/admin/productsize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(productSizeData),
      });

      if (response.ok) {
        const createdProductSize = await response.json();
        setProductSizes([...productSizes, createdProductSize]);
        setNewProductSize({ productID: "", sizeID: "", stock: "", status: "Enable" }); // Reset input fields
      } else {
        throw new Error("Không thể tạo kích thước sản phẩm.");
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
      <h2>Quản Lý Kích Thước Sản Phẩm</h2>
    </div>
      <h3>Thêm Kích Thước Sản Phẩm Mới</h3>
      <div>
        <label>ID Sản Phẩm: </label>
        <input
          type="text"
          value={newProductSize.productID}
          onChange={(e) => setNewProductSize({ ...newProductSize, productID: e.target.value })}
        />
        <label>Kích Thước ID: </label>
        <input
          type="text"
          value={newProductSize.sizeID}
          onChange={(e) => setNewProductSize({ ...newProductSize, sizeID: e.target.value })}
        />
        <label>Số lượng: </label>
        <input
          type="number"
          value={newProductSize.stock}
          onChange={(e) => setNewProductSize({ ...newProductSize, stock: e.target.value })}
        />
        <label>Trạng thái: </label>
        <select
          value={newProductSize.status}
          onChange={(e) => setNewProductSize({ ...newProductSize, status: e.target.value })}
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {productSizes.length === 0 ? (
        <p>Không có kích thước sản phẩm nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Kích Thước Sản Phẩm</th>
              <th>ID Sản Phẩm</th>
              <th>ID Kích Thước</th>
              <th>Tồn Kho</th>
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {productSizes.map((size) => (
              <tr key={size.productSizeID}>
                <td>{size.productSizeID}</td>
                <td>
                  {editingProductSizeId === size.productSizeID ? (
                    <input
                      type="text"
                      value={size.productID.productID}
                      onChange={(e) =>
                        setProductSizes((prevProductSizes) =>
                          prevProductSizes.map((s) =>
                            s.productSizeID === size.productSizeID
                              ? { ...s, productID: { productID: e.target.value } }
                              : s
                          )
                        )
                      }
                    />
                  ) : (
                    size.productID.productID
                  )}
                </td>
                <td>
                  {editingProductSizeId === size.productSizeID ? (
                    <input
                      type="text"
                      value={size.sizeID.sizeID}
                      onChange={(e) =>
                        setProductSizes((prevProductSizes) =>
                          prevProductSizes.map((s) =>
                            s.productSizeID === size.productSizeID
                              ? { ...s, sizeID: { sizeID: e.target.value } }
                              : s
                          )
                        )
                      }
                    />
                  ) : (
                    size.sizeID.sizeID
                  )}
                </td>
                <td>
                  {editingProductSizeId === size.productSizeID ? (
                    <input
                      type="number"
                      value={size.stock}
                      onChange={(e) =>
                        setProductSizes((prevProductSizes) =>
                          prevProductSizes.map((s) =>
                            s.productSizeID === size.productSizeID
                              ? { ...s, stock: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  ) : (
                    size.stock
                  )}
                </td>
                <td>
                  {editingProductSizeId === size.productSizeID ? (
                    <select
                      value={size.status}
                      onChange={(e) =>
                        setProductSizes((prevProductSizes) =>
                          prevProductSizes.map((s) =>
                            s.productSizeID === size.productSizeID
                              ? { ...s, status: e.target.value }
                              : s
                          )
                        )
                      }
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  ) : (
                    size.status
                  )}
                </td>
                <td>
                  {editingProductSizeId === size.productSizeID ? (
                    <>
                      <button onClick={() => handleSave(size.productSizeID, size.productID.productID, size.sizeID.sizeID, size.stock, size.status)}>Lưu</button>
                      <button onClick={() => setEditingProductSizeId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingProductSizeId(size.productSizeID)}>Chỉnh Sửa</button>
                      <button onClick={() => handleDelete(size.productSizeID)}>Xóa</button>
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

export default AdminProductSize;
