import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; 

const AdminSize = () => {
  const [sizeList, setSizeList] = useState([]);
  const [newSize, setNewSize] = useState({
    sizeName: "",
    bonus: 0.00,
    status: "Enable",
  });
  const [editingSizeId, setEditingSizeId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/size", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách kích thước.");
        }

        const data = await response.json();
        setSizeList(data.Size || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSizes();
  }, [accesstoken]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/size/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setSizeList((prevSizeList) =>
          prevSizeList.map((size) =>
            size.sizeID === id ? { ...size, status: 'Disable' } : size
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa kích thước.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, sizeData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/size/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(sizeData),
        }
      );

      if (response.ok) {
        const updatedSize = await response.json();
        setSizeList((prevSizeList) =>
          prevSizeList.map((size) =>
            size.sizeID === id ? updatedSize : size
          )
        );
        setEditingSizeId(null);
      } else {
        throw new Error("Không thể cập nhật kích thước.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/size", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newSize), // Chỉ gửi sizeName, bonus, và status
      });

      if (response.ok) {
        const createdSize = await response.json();
        setSizeList([...sizeList, createdSize]);
        setNewSize({
          sizeName: "",
          bonus: 0.00,
          status: "Enable",
        });
      } else {
        throw new Error("Không thể tạo kích thước.");
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
      <h2>Quản Lý Loại Kích Thước</h2>
    </div>

      <h3>Thêm Loại Kích Thước Mới</h3>
      <div>
        <label>Tên Loại Kích Thước: </label>
        <input
          value={newSize.sizeName}
          onChange={(e) =>
            setNewSize((prev) => ({ ...prev, sizeName: e.target.value }))
          }
        />
        <label>Bonus: </label>
        <input
          type="number"
          value={newSize.bonus}
          onChange={(e) =>
            setNewSize((prev) => ({ ...prev, bonus: parseFloat(e.target.value) }))
          }
        />
        <label>Trạng thái: </label>
        <select
          value={newSize.status}
          onChange={(e) =>
            setNewSize((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {sizeList.length === 0 ? (
        <p>Không có loại kích thước nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Loạik Kích Thước</th>
              <th>Tên Loại Kích Thước</th>
              <th>Bonus</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {sizeList.map((size) => (
              <tr key={size.sizeID}>
                <td>{size.sizeID}</td>
                <td>
                  {editingSizeId === size.sizeID ? (
                    <input
                      value={size.sizeName}
                      onChange={(e) =>
                        setSizeList((prevSizeList) =>
                          prevSizeList.map((s) =>
                            s.sizeID === size.sizeID
                              ? { ...s, sizeName: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  ) : (
                    size.sizeName
                  )}
                </td>
                <td>
                  {editingSizeId === size.sizeID ? (
                    <input
                      type="number"
                      value={size.bonus}
                      onChange={(e) =>
                        setSizeList((prevSizeList) =>
                          prevSizeList.map((s) =>
                            s.sizeID === size.sizeID
                              ? { ...s, bonus: parseFloat(e.target.value) }
                              : s
                          )
                        )
                      }
                    />
                  ) : (
                    size.bonus
                  )}
                </td>
                <td>
                  {editingSizeId === size.sizeID ? (
                    <select
                      value={size.status}
                      onChange={(e) =>
                        setSizeList((prevSizeList) =>
                          prevSizeList.map((s) =>
                            s.sizeID === size.sizeID
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
                  {editingSizeId === size.sizeID ? (
                    <>
                      <button
                        onClick={() =>
                          handleSave(size.sizeID, {
                            sizeName: size.sizeName,
                            bonus: size.bonus,
                            status: size.status,
                          })
                        }
                      >
                        Lưu
                      </button>
                      <button onClick={() => setEditingSizeId(null)}>
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingSizeId(size.sizeID)}
                      >
                        Chỉnh Sửa
                      </button>
                      <button onClick={() => handleDelete(size.sizeID)}>
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
    </div>
  );
};

export default AdminSize;
