import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; 


const AdminOrigin = () => {
  const [originList, setOriginList] = useState([]);
  const [editingOriginId, setEditingOriginId] = useState(null); 
  const [newOrigin, setNewOrigin] = useState({
    country: "",
    status: "Enable",
  });
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrigin = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/origin",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách nguồn gốc.");
        }

        const data = await response.json();
        setOriginList(data.Origin || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrigin();
  }, [accesstoken]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/origin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setOriginList((prevOriginList) =>
          prevOriginList.map((origin) =>
            origin.originID === id ? { ...origin, status: "Disable" } : origin
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa nguồn gốc.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, originData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/origin/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(originData),
        }
      );

      if (response.ok) {
        const updatedOrigin = await response.json();
        setOriginList((prevOriginList) =>
          prevOriginList.map((origin) =>
            origin.originID === id ? updatedOrigin : origin
          )
        );
        setEditingOriginId(null);
      } else {
        throw new Error("Không thể cập nhật nguồn gốc.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/origin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newOrigin),
      });

      if (response.ok) {
        const createdOrigin = await response.json();
        setOriginList([...originList, createdOrigin]);
        setNewOrigin({
          country: "",
          status: "Enable",
        });
      } else {
        throw new Error("Không thể tạo nguồn gốc.");
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
      <h2>Quản Lý Nguồn Gốc</h2>
    </div>
      <h3>Thêm Nguồn Gốc Mới</h3>
      <div>
        <label>Quốc Gia: </label>
        <input
          value={newOrigin.country}
          onChange={(e) =>
            setNewOrigin((prev) => ({ ...prev, country: e.target.value }))
          }
        />
        <label>Trạng Thái: </label>
        <select
          value={newOrigin.status}
          onChange={(e) =>
            setNewOrigin((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {originList.length === 0 ? (
        <p>Không có nguồn gốc nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Nguồn Gốc</th>
              <th>Quốc Gia</th>
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {originList.map((origin) => (
              <tr key={origin.originID}>
                <td>{origin.originID}</td>
                <td>
                  {editingOriginId === origin.originID ? (
                    <input
                      value={origin.country}
                      onChange={(e) =>
                        setOriginList((prevOriginList) =>
                          prevOriginList.map((o) =>
                            o.originID === origin.originID
                              ? { ...o, country: e.target.value }
                              : o
                          )
                        )
                      }
                    />
                  ) : (
                    origin.country
                  )}
                </td>
                <td>
                  {editingOriginId === origin.originID ? (
                    <select
                      value={origin.status}
                      onChange={(e) =>
                        setOriginList((prevOriginList) =>
                          prevOriginList.map((o) =>
                            o.originID === origin.originID
                              ? { ...o, status: e.target.value }
                              : o
                          )
                        )
                      }
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  ) : (
                    origin.status
                  )}
                </td>
                <td>
                  {editingOriginId === origin.originID ? (
                    <>
                      <button
                        onClick={() =>
                          handleSave(origin.originID, {
                            country: origin.country,
                            status: origin.status,
                          })
                        }
                      >
                        Lưu
                      </button>
                      <button onClick={() => setEditingOriginId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingOriginId(origin.originID)}>
                        Chỉnh Sửa
                      </button>
                      <button onClick={() => handleDelete(origin.originID)}>Xóa</button>
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

export default AdminOrigin;
