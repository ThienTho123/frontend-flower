import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";

const AdminCommentType = () => {
  const [commentTypeList, setCommentTypeList] = useState([]);
  const [newCommentType, setNewCommentType] = useState({
    commenttypename: "",
    status: "ENABLE",
  });
  const [editingRow, setEditingRow] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommentTypes = async () => {
      try {
        const response = await fetch(
          "https://deploybackend-j61h.onrender.com/api/v1/admin/commenttype",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Lỗi: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        setCommentTypeList(data || []);
      } catch (err) {
        console.error("Lỗi khi lấy loại bình luận:", err.message);
        setError(err.message);
      }
    };

    fetchCommentTypes();
  }, [accesstoken]);

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/commenttype/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setCommentTypeList((prev) =>
          prev.map((type) =>
            type.commenttypeID === id ? { ...type, status: "DISABLE" } : type
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa loại bình luận.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/commenttype/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setCommentTypeList((prev) =>
          prev.filter((type) => type.commenttypeID !== id)
        );
      } else {
        throw new Error("Không thể xóa loại bình luận.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, updatedType) => {
    try {
      if (!newCommentType.commenttypename) {
        throw new Error("Tên Loại không được để trống.");
      }
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/commenttype/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedType),
        }
      );

      if (response.ok) {
        const updatedCommentType = await response.json();
        setCommentTypeList((prev) =>
          prev.map((type) =>
            type.commenttypeID === id ? updatedCommentType : type
          )
        );
        setEditingRow(null); // Thoát chế độ chỉnh sửa
      } else {
        throw new Error("Không thể cập nhật loại bình luận.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditRow = (id) => {
    setEditingRow(id); // Bắt đầu chế độ chỉnh sửa
  };

  const handleCancelEdit = () => {
    setEditingRow(null); // Thoát chế độ chỉnh sửa
  };

  const handleFieldChange = (id, field, value) => {
    setCommentTypeList((prev) =>
      prev.map((type) =>
        type.commenttypeID === id ? { ...type, [field]: value } : type
      )
    );
  };

  const handleCreate = async () => {
    try {
      if (!newCommentType.commenttypename) {
        throw new Error("Tên Loại không được để trống.");
      }
      const response = await fetch(
        "https://deploybackend-j61h.onrender.com/api/v1/admin/commenttype",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newCommentType),
        }
      );

      if (response.ok) {
        const createdType = await response.json();
        setCommentTypeList([...commentTypeList, createdType]);
        setNewCommentType({
          commenttypename: "",
          status: "ENABLE",
        });
      } else {
        throw new Error("Không thể tạo loại bình luận.");
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
          alt="Quay lại"
          className="return-button"
          onClick={handleBackToDashboard}
        />
        <h2>Quản Lý Loại Bình Luận</h2>
      </div>

      <h3>Thêm Loại Bình Luận Mới</h3>
      <div>
        <label>Tên Loại:</label>
        <input
          type="text"
          value={newCommentType.commenttypename}
          onChange={(e) =>
            setNewCommentType((prev) => ({
              ...prev,
              commenttypename: e.target.value,
            }))
          }
        />

        <label>Trạng Thái:</label>
        <select
          value={newCommentType.status}
          onChange={(e) =>
            setNewCommentType((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">ENABLE</option>
          <option value="DISABLE">DISABLE</option>
        </select>

        <button onClick={handleCreate}>Thêm Loại</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Danh Sách Loại Bình Luận</h3>
      {commentTypeList.length === 0 ? (
        <p>Không có loại bình luận nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Loại</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {commentTypeList.map((type) => (
              <tr key={type.commenttypeID}>
                <td>{type.commenttypeID}</td>
                <td>
                  {editingRow === type.commenttypeID ? (
                    <input
                      type="text"
                      value={type.commenttypename}
                      onChange={(e) =>
                        handleFieldChange(
                          type.commenttypeID,
                          "commenttypename",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    type.commenttypename
                  )}
                </td>
                <td>
                  {editingRow === type.commenttypeID ? (
                    <select
                      value={type.status}
                      onChange={(e) =>
                        handleFieldChange(
                          type.commenttypeID,
                          "status",
                          e.target.value
                        )
                      }
                    >
                      <option value="ENABLE">ENABLE</option>
                      <option value="DISABLE">DISABLE</option>
                    </select>
                  ) : (
                    type.status
                  )}
                </td>
                <td>
                  {editingRow === type.commenttypeID ? (
                    <>
                      <button
                        onClick={() => handleSave(type.commenttypeID, type)}
                      >
                        Lưu
                      </button>
                      <button onClick={handleCancelEdit}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditRow(type.commenttypeID)}>
                        Chỉnh Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteSoft(type.commenttypeID)}
                      >
                        Vô Hiệu
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

export default AdminCommentType;
