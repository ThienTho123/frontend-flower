import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';  // Biểu tượng quay lại

const AdminComment = () => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentStatus, setNewCommentStatus] = useState("ENABLE");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // Lấy tất cả bình luận
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/comment", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        });
        if (!response.ok) throw new Error("Không thể lấy bình luận");
        const data = await response.json();
        setComments(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchComments();
  }, [accesstoken]);

  // Tạo bình luận mới
  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/comment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newCommentText,
          status: newCommentStatus,
        }),
      });

      if (response.ok) {
        const createdComment = await response.json();
        setComments((prev) => [...prev, createdComment]);
        setNewCommentText("");
        setNewCommentStatus("ENABLE");
      } else {
        throw new Error("Không thể tạo bình luận.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Chỉnh sửa bình luận
  const handleSave = async (id, updatedText) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/comment/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: updatedText, status: newCommentStatus }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.commentID === id ? updatedComment : comment
          )
        );
        setEditingCommentId(null);
      } else {
        throw new Error("Không thể cập nhật bình luận.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Xóa mềm (Disable)
  const handleSoftDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/comment/softdelete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      if (response.ok) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.commentID === id ? { ...comment, status: "DISABLE" } : comment
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa bình luận.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Xóa cứng
  const handleHardDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/comment/harddelete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      if (response.ok) {
        setComments((prevComments) => prevComments.filter((comment) => comment.commentID !== id));
      } else {
        throw new Error("Không thể xóa bình luận.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Quay lại trang Dashboard
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
        <h2>Quản Lý Bình Luận</h2>
      </div>

      <h3>Thêm Bình Luận Mới</h3>
      <div className="input-group">
        <label>Nội Dung Bình Luận: </label>
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          rows="4"
          placeholder="Nhập nội dung bình luận..."
        />
      </div>

      <div className="input-group">
        <label>Trạng Thái: </label>
        <select
          value={newCommentStatus}
          onChange={(e) => setNewCommentStatus(e.target.value)}
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>
      </div>

      <button className="btn-create" onClick={handleCreate}>Tạo Bình Luận</button>

      {error && <p className="error-message">{error}</p>}

      <h3>Danh Sách Bình Luận</h3>
      {comments.length === 0 ? (
        <p>Không có bình luận nào.</p>
      ) : (
        <table className="admin-table" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Bình Luận</th>
              <th>Loại Bình Luận</th> {/* commenttypename */}
              <th>ID Tài Khoản</th> {/* accountID */}
              <th>Tiêu Đề</th> {/* title */}
              <th>Nội Dung</th>
              <th>Ngày</th> {/* date */}
              <th>Trạng Thái</th> {/* status */}
              <th>Hình Ảnh</th> {/* image */}
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.commentID}>
                <td>{comment.commentID}</td>
                <td>{comment.commenttypename}</td> {/* Display comment type */}
                <td>{comment.accountID}</td> {/* Display accountID */}
                <td>{comment.title}</td> {/* Display title */}
                <td>
                  {editingCommentId === comment.commentID ? (
                    <input
                      type="text"
                      value={comment.text}
                      onChange={(e) =>
                        setComments((prevComments) =>
                          prevComments.map((c) =>
                            c.commentID === comment.commentID ? { ...c, text: e.target.value } : c
                          )
                        )
                      }
                    />
                  ) : (
                    comment.text
                  )}
                </td>
                <td>{new Date(comment.date).toLocaleString()}</td> {/* Display date */}
                <td>{comment.status}</td>
                <td>{comment.image && <img src={comment.image} alt="Comment" style={{ width: '100px' }} />}</td> {/* Display image */}
                <td>
                  {editingCommentId === comment.commentID ? (
                    <>
                      <button onClick={() => handleSave(comment.commentID, comment.text)}>Lưu</button>
                      <button onClick={() => setEditingCommentId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.commentID);
                          setNewCommentText(comment.text);
                        }}
                      >
                        Chỉnh Sửa
                      </button>
                      <button onClick={() => handleSoftDelete(comment.commentID)}>Vô hiệu hóa</button>
                      <button onClick={() => handleHardDelete(comment.commentID)}>Xóa</button>
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

export default AdminComment;
