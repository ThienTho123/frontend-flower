import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminPurpose = () => {
  const [purposes, setPurposes] = useState([]);
  const [editingPurposeId, setEditingPurposeId] = useState(null);
  const [newPurposeName, setNewPurposeName] = useState("");
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/purpose", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách mục đích.");
        }

        const data = await response.json();
        setPurposes(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPurposes();
  }, [accesstoken]);

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/purpose/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setPurposes((prevPurposes) =>
          prevPurposes.map((purpose) =>
            purpose.purposeID === id ? { ...purpose, status: "DISABLE" } : purpose
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa mục đích.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/purpose/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setPurposes((prevPurposes) =>
          prevPurposes.filter((purpose) => purpose.purposeID !== id)
        );
      } else {
        throw new Error("Không thể xóa mục đích.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, purposeName, status) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/purpose/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ purposeName, status }),
      });

      if (response.ok) {
        const updatedPurpose = await response.json();
        setPurposes((prevPurposes) =>
          prevPurposes.map((purpose) =>
            purpose.purposeID === id ? updatedPurpose : purpose
          )
        );
        setEditingPurposeId(null);
      } else {
        throw new Error("Không thể cập nhật mục đích.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/purpose", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ purposeName: newPurposeName, status: "ENABLE" }),
      });

      if (response.ok) {
        const createdPurpose = await response.json();
        setPurposes([...purposes, createdPurpose]);
        setNewPurposeName("");
      } else {
        throw new Error("Không thể tạo mục đích.");
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
        <h2>Quản Lý Mục Đích</h2>
      </div>
      <h3>Thêm Mục Đích Mới</h3>
      <div>
        <label>Tên Mục Đích: </label>
        <input
          value={newPurposeName}
          onChange={(e) => setNewPurposeName(e.target.value)}
        />
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {purposes.length === 0 ? (
        <p>Không có mục đích nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Mục Đích</th>
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {purposes.map((purpose) => (
              <tr key={purpose.purposeID}>
                <td>{purpose.purposeID}</td>
                <td>
                  {editingPurposeId === purpose.purposeID ? (
                    <input
                      value={purpose.purposeName}
                      onChange={(e) =>
                        setPurposes((prevPurposes) =>
                          prevPurposes.map((p) =>
                            p.purposeID === purpose.purposeID
                              ? { ...p, purposeName: e.target.value }
                              : p
                          )
                        )
                      }
                    />
                  ) : (
                    purpose.purposeName
                  )}
                </td>
                <td>
                  {editingPurposeId === purpose.purposeID ? (
                    <select
                      value={purpose.status}
                      onChange={(e) =>
                        setPurposes((prevPurposes) =>
                          prevPurposes.map((p) =>
                            p.purposeID === purpose.purposeID
                              ? { ...p, status: e.target.value }
                              : p
                          )
                        )
                      }
                    >
                      <option value="ENABLE">Enable</option>
                      <option value="DISABLE">Disable</option>
                    </select>
                  ) : (
                    purpose.status
                  )}
                </td>
                <td>
                  {editingPurposeId === purpose.purposeID ? (
                    <>
                      <button
                        onClick={() =>
                          handleSave(purpose.purposeID, purpose.purposeName, purpose.status)
                        }
                      >
                        Lưu
                      </button>
                      <button onClick={() => setEditingPurposeId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingPurposeId(purpose.purposeID)}>
                        Chỉnh Sửa
                      </button>
                      <button onClick={() => handleDeleteSoft(purpose.purposeID)}>
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
    </div>
  );
};

export default AdminPurpose;
