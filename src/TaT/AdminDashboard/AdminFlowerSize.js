import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminFlowerSize = () => {
  const [flowerSizeList, setFlowerSizeList] = useState([]);
  const [newFlowerSize, setNewFlowerSize] = useState({
    sizeName: "",
    length: "",
    high: "",
    width: "",
    weight: "",
    stock: "",
    price: "",
    cost: "",
    status: "ENABLE",
    flower: { flowerID: null }
  });
  const [editingFlowerSizeId, setEditingFlowerSizeId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlowerSizes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/flowersize", {
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
        setFlowerSizeList(data || []);
      } catch (err) {
        console.error("Error fetching flower sizes:", err.message);
        setError(err.message);
      }
    };

    fetchFlowerSizes();
  }, [accesstoken]);

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/flowersize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newFlowerSize),
      });
  
      if (response.ok) {
        setNewFlowerSize({
          sizeName: "",
          length: "",
          high: "",
          width: "",
          weight: "",
          stock: "",
          price: "",
          cost: "",
          status: "ENABLE",
          flower: { flowerID: null },
        });
      } else {
        throw new Error("Unable to create flower size.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  


  const handleSave = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flowersize/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editingData),
        }
      );

      if (response.ok) {
        const updatedFlowerSize = await response.json();
        setFlowerSizeList((prev) =>
          prev.map((size) => (size.flowerSizeID === id ? updatedFlowerSize : size))
        );
        setEditingFlowerSizeId(null);
        setEditingData({});
      } else {
        throw new Error("Unable to update flower size.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flowersize/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setFlowerSizeList((prev) =>
          prev.map((size) =>
            size.flowerSizeID === id ? { ...size, status: "DISABLE" } : size
          )
        );
      } else {
        throw new Error("Unable to disable flower size.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flowersize/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setFlowerSizeList((prev) => prev.filter((size) => size.flowerSizeID !== id));
      } else {
        throw new Error("Unable to delete flower size.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    setEditingFlowerSizeId(id);
    setEditingData(
      flowerSizeList.find((size) => size.flowerSizeID === id) || {}
    );
  };

  const handleCancel = () => {
    setEditingFlowerSizeId(null);
    setEditingData({});
  };

  const handleChange = (field, value) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
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
        <h2>Quản lý kích thước hoa</h2>
      </div>

      <h3>Thêm mới kích thước hoa</h3>
      <div>
        <label>Tên kích thước:</label>
        <input
          type="text"
          value={newFlowerSize.sizeName}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, sizeName: e.target.value }))
          }
        />
        <label>Độ dài:</label>
        <input
          type="number"
          value={newFlowerSize.length}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, length: e.target.value }))
          }
        />
        <label>Độ cao:</label>
        <input
          type="number"
          value={newFlowerSize.high}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, high: e.target.value }))
          }
        />
        <label>Độ rộng:</label>
        <input
          type="number"
          value={newFlowerSize.width}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, width: e.target.value }))
          }
        />
        <label>Trọng lượng:</label>
        <input
          type="number"
          value={newFlowerSize.weight}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, weight: e.target.value }))
          }
        />
        <label>Số lượng tồn kho:</label>
        <input
          type="number"
          value={newFlowerSize.stock}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, stock: e.target.value }))
          }
        />
        <label>Giá bán:</label>
        <input
          type="number"
          value={newFlowerSize.price}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, price: e.target.value }))
          }
        />
        <label>Giá gốc:</label>
        <input
          type="number"
          value={newFlowerSize.cost}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, cost: e.target.value }))
          }
        />
        <label>Hoa (ID):</label>
        <input
          type="number"
          value={newFlowerSize.flower.flowerID || ""}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({
              ...prev,
              flower: { flowerID: e.target.value },
            }))
          }
        />
        <label>Trạng thái:</label>
        <select
          value={newFlowerSize.status}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>
        <button onClick={handleCreate}>Tạo mới</button>
      </div>

      <h3>Danh sách kích thước hoa</h3>
      {flowerSizeList.length === 0 ? (
        <p>Không có kích thước hoa nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên kích thước</th>
              <th>Độ dài</th>
              <th>Độ cao</th>
              <th>Độ rộng</th>
              <th>Trọng lượng</th>
              <th>Số lượng tồn kho</th>
              <th>Giá bán</th>
              <th>Giá gốc</th>
              <th>Hoa (ID)</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {flowerSizeList.map((flowerSize) => (
              <tr key={flowerSize.flowerSizeID}>
                <td>{flowerSize.flowerSizeID}</td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="text"
                      value={editingData.sizeName || ""}
                      onChange={(e) => handleChange("sizeName", e.target.value)}
                    />
                  ) : (
                    flowerSize.sizeName
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="number"
                      value={editingData.length || ""}
                      onChange={(e) => handleChange("length", e.target.value)}
                    />
                  ) : (
                    flowerSize.length
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="number"
                      value={editingData.high || ""}
                      onChange={(e) => handleChange("high", e.target.value)}
                    />
                  ) : (
                    flowerSize.high
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="number"
                      value={editingData.width || ""}
                      onChange={(e) => handleChange("width", e.target.value)}
                    />
                  ) : (
                    flowerSize.width
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="number"
                      value={editingData.weight || ""}
                      onChange={(e) => handleChange("weight", e.target.value)}
                    />
                  ) : (
                    flowerSize.weight
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="number"
                      value={editingData.stock || ""}
                      onChange={(e) => handleChange("stock", e.target.value)}
                    />
                  ) : (
                    flowerSize.stock
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="number"
                      value={editingData.price || ""}
                      onChange={(e) => handleChange("price", e.target.value)}
                    />
                  ) : (
                    flowerSize.price
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="number"
                      value={editingData.cost || ""}
                      onChange={(e) => handleChange("cost", e.target.value)}
                    />
                  ) : (
                    flowerSize.cost
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <input
                      type="number"
                      value={editingData.flower?.flowerID || ""}
                      onChange={(e) =>
                        handleChange("flower", {
                          flowerID: e.target.value,
                        })
                      }
                    />
                  ) : (
                    flowerSize.flower?.name || ""
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <select
                      value={editingData.status || ""}
                      onChange={(e) => handleChange("status", e.target.value)}
                    >
                      <option value="ENABLE">Enable</option>
                      <option value="DISABLE">Disable</option>
                    </select>
                  ) : (
                    flowerSize.status
                  )}
                </td>
                <td>
                  {editingFlowerSizeId === flowerSize.flowerSizeID ? (
                    <>
                      <button onClick={() => handleSave(flowerSize.flowerSizeID)}>
                        Lưu
                      </button>
                      <button onClick={handleCancel}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(flowerSize.flowerSizeID)}>
                        Chỉnh sửa
                      </button>
                      <button onClick={() => handleDeleteSoft(flowerSize.flowerSizeID)}>
                        Vô hiệu hóa
                      </button>
                      <button onClick={() => handleDeleteHard(flowerSize.flowerSizeID)}>
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AdminFlowerSize;