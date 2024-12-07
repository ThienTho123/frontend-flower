import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminFlowerSize = () => {
  const [flowerSizeList, setFlowerSizeList] = useState([]);
  const [flowerList, setFlowerList] = useState([]); 
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
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchFlowerSizesAndFlowers = async () => {
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
        if (Array.isArray(data.flowerSizes)) {
          setFlowerSizeList(data.flowerSizes);
        } else {
          setFlowerSizeList([]);
        }

        if (Array.isArray(data.flowers)) {
          setFlowerList(data.flowers); // Lưu danh sách hoa
        }
      } catch (err) {
        console.error("Error fetching flower sizes:", err.message);
        setError(err.message);
      }
    };

    fetchFlowerSizesAndFlowers();
  }, [accesstoken]);

  const handleCreate = async () => {
    try {
      const errors = {};
    if (!newFlowerSize.sizeName) errors.sizeName = "Tên kích thước không được để trống";
    if (newFlowerSize.length <= 0) errors.length = "Độ dài phải là số dương";
    if (newFlowerSize.high <= 0) errors.high = "Độ cao phải là số dương";
    if (newFlowerSize.width <= 0) errors.width = "Độ rộng phải là số dương";
    if (newFlowerSize.weight <= 0) errors.weight = "Trọng lượng phải là số dương";
    if (newFlowerSize.stock < 0) errors.stock = "Số lượng tồn kho không được âm";
    if (newFlowerSize.price <= 0) errors.price = "Giá bán phải là số dương";
    if (newFlowerSize.cost <= 0) errors.cost = "Giá gốc phải là số dương";
    if (!newFlowerSize.flower.flowerID) errors.flower = "Vui lòng chọn hoa";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
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
    const errors = {};
    if (!editingData.sizeName) errors.sizeName = "Tên kích thước không được để trống";
    if (editingData.length <= 0) errors.length = "Độ dài phải là số dương";
    if (editingData.high <= 0) errors.high = "Độ cao phải là số dương";
    if (editingData.width <= 0) errors.width = "Độ rộng phải là số dương";
    if (editingData.weight <= 0) errors.weight = "Trọng lượng phải là số dương";
    if (editingData.stock < 0) errors.stock = "Số lượng tồn kho không được âm";
    if (editingData.price <= 0) errors.price = "Giá bán phải là số dương";
    if (editingData.cost <= 0) errors.cost = "Giá gốc phải là số dương";
    if (!editingData.flower?.flowerID) errors.flower = "Vui lòng chọn hoa";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
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
        window.location.reload();
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
                {validationErrors.sizeName && <div className="error">{validationErrors.sizeName}</div>}

        <label>Độ dài:</label>
        <input
          type="number"
          value={newFlowerSize.length}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, length: e.target.value }))
          }
        />
                {validationErrors.length && <div className="error">{validationErrors.length}</div>}

        <label>Độ cao:</label>
        <input
          type="number"
          value={newFlowerSize.high}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, high: e.target.value }))
          }
        />
                {validationErrors.high && <div className="error">{validationErrors.high}</div>}

        <label>Độ rộng:</label>
        <input
          type="number"
          value={newFlowerSize.width}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, width: e.target.value }))
          }
        />
                        {validationErrors.width && <div className="error">{validationErrors.width}</div>}

        <label>Trọng lượng:</label>
        <input
          type="number"
          value={newFlowerSize.weight}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, weight: e.target.value }))
          }
        />
                {validationErrors.weight && <div className="error">{validationErrors.weight}</div>}

        <label>Số lượng tồn kho:</label>
        <input
          type="number"
          value={newFlowerSize.stock}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, stock: e.target.value }))
          }
        />
        {validationErrors.stock && <div className="error">{validationErrors.stock}</div>}

        <label>Giá bán:</label>
        <input
          type="number"
          value={newFlowerSize.price}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, price: e.target.value }))
          }
        />
                {validationErrors.price && <div className="error">{validationErrors.price}</div>}

        <label>Giá gốc:</label>
        <input
          type="number"
          value={newFlowerSize.cost}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({ ...prev, cost: e.target.value }))
          }
        />
                {validationErrors.cost && <div className="error">{validationErrors.cost}</div>}

        <label>Hoa (ID):</label>
        <select
          value={newFlowerSize.flower.flowerID || ""}
          onChange={(e) =>
            setNewFlowerSize((prev) => ({
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
        {validationErrors.flower && <div className="error">{validationErrors.flower}</div>}


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
                    <select
                      value={editingData.flower?.flowerID || ""}
                      onChange={(e) =>
                        handleChange("flower", { flowerID: e.target.value })
                      }
                    >
                      <option value="">Chọn hoa</option>
                      {flowerList.map((flower) => (
                        <option key={flower.flowerID} value={flower.flowerID}>
                          {flower.name} 
                        </option>
                      ))}
                    </select>
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
