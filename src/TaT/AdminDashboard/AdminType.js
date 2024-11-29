import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminType = () => {
  const [types, setTypes] = useState([]);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [newType, setNewType] = useState({ typeName: "", minConsume: 0 });
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/type", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách loại người dùng.");
        }

        const data = await response.json();
        setTypes(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchTypes();
  }, [accesstoken]);

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/type/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setTypes((prevTypes) =>
          prevTypes.map((type) =>
            type.typeID === id ? { ...type, status: "DISABLE" } : type
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa loại người dùng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/type/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setTypes((prevTypes) =>
          prevTypes.filter((type) => type.typeID !== id)
        );
      } else {
        throw new Error("Không thể xóa loại người dùng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, typeName, minConsume, status) => {
    if (minConsume <= 0) {
      setError("Tiêu thụ tối thiểu phải lớn hơn 0.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/type/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ typeName, minConsume, status }),
      });

      if (response.ok) {
        const updatedType = await response.json();
        setTypes((prevTypes) =>
          prevTypes.map((type) => (type.typeID === id ? updatedType : type))
        );
        setEditingTypeId(null);
      } else {
        throw new Error("Không thể cập nhật loại người dùng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      if (newType.minConsume <= 0) {
        setError("Tiêu thụ tối thiểu phải lớn hơn 0.");
        return;
      }
      const response = await fetch("http://localhost:8080/api/v1/admin/type", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...newType, status: "ENABLE" }),
      });

      if (response.ok) {
        const createdType = await response.json();
        setTypes([...types, createdType]);
        setNewType({ typeName: "", minConsume: 0 });
      } else {
        throw new Error("Không thể tạo loại người dùng.");
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
        <h2>Quản Lý Loại Người Dùng</h2>
      </div>
      <h3>Thêm Loại Người Dùng Mới</h3>
      <div>
        <label>Tên Loại Người Dùng: </label>
        <input
          value={newType.typeName}
          onChange={(e) =>
            setNewType({ ...newType, typeName: e.target.value })
          }
        />
        <label>Tiêu Thụ Tối Thiểu: </label>
        <input
          type="number"
          value={newType.minConsume}
          onChange={(e) =>
            setNewType({ ...newType, minConsume: parseFloat(e.target.value) })
          }
        />
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {types.length === 0 ? (
        <p>Không có loại người dùng nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Loại Người Dùng</th>
              <th>Tên Loại Người Dùng</th>
              <th>Tiêu Thụ Tối Thiểu</th>
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.typeID}>
                <td>{type.typeID}</td>
                <td>
                  {editingTypeId === type.typeID ? (
                    <input
                      value={type.typeName}
                      onChange={(e) =>
                        setTypes((prevTypes) =>
                          prevTypes.map((t) =>
                            t.typeID === type.typeID
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
                  {editingTypeId === type.typeID ? (
                    <input
                      type="number"
                      value={type.minConsume}
                      onChange={(e) =>
                        setTypes((prevTypes) =>
                          prevTypes.map((t) =>
                            t.typeID === type.typeID
                              ? { ...t, minConsume: parseFloat(e.target.value) }
                              : t
                          )
                        )
                      }
                    />
                  ) : (
                    type.minConsume
                  )}
                </td>
                <td>
                  {editingTypeId === type.typeID ? (
                    <select
                      value={type.status}
                      onChange={(e) =>
                        setTypes((prevTypes) =>
                          prevTypes.map((t) =>
                            t.typeID === type.typeID
                              ? { ...t, status: e.target.value }
                              : t
                          )
                        )
                      }
                    >
                      <option value="ENABLE">Enable</option>
                      <option value="DISABLE">Disable</option>
                    </select>
                  ) : (
                    type.status
                  )}
                </td>
                <td>
                  {editingTypeId === type.typeID ? (
                    <>
                      <button
                        onClick={() =>
                          handleSave(
                            type.typeID,
                            type.typeName,
                            type.minConsume,
                            type.status
                          )
                        }
                      >
                        Lưu
                      </button>
                      <button onClick={() => setEditingTypeId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingTypeId(type.typeID)}>
                        Chỉnh Sửa
                      </button>
                      <button onClick={() => handleDeleteSoft(type.typeID)}>
                        Vô hiệu hóa
                      </button>
                      <button onClick={() => handleDeleteHard(type.typeID)}>
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

export default AdminType;
