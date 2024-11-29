import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminComment = () => {
  const [commentList, setCommentList] = useState([]);
  const [newComment, setNewComment] = useState({
    title: "",
    text: "",
    accountID: { accountID: null },
    commentType: { commenttypeID: null },
    image: "",
    status: "ENABLE",
    stative: "Waiting",
    date: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
  });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/comment", {
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
        setCommentList(data || []);
      } catch (err) {
        console.error("Error fetching comments:", err.message);
        setError(err.message);
      }
    };

    fetchComments();
  }, [accesstoken]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadImage = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/v1/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const imageUrl = data.DT;
        setImageUrl(imageUrl);
        setNewComment((prev) => ({
          ...prev,
          image: imageUrl,
        }));
        console.log("Upload successful:", imageUrl);
      } else {
        console.error("Upload error:", data.EM);
      }
    } catch (err) {
      console.error("Upload error:", err.message);
    }
  };

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/comment/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setCommentList((prev) =>
          prev.map((comment) =>
            comment.commentID === id ? { ...comment, status: "DISABLE" } : comment
          )
        );
      } else {
        throw new Error("Unable to disable comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/comment/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setCommentList((prev) => prev.filter((comment) => comment.commentID !== id));
      } else {
        throw new Error("Unable to delete comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, commentData) => {
    if (!commentData.accountID.accountID || !commentData.commentType.commenttypeID) {
      alert("Account ID và Comment Type ID không được để trống.");
      return;
    }
    try {
      const formattedData = {
        ...commentData,
        date: new Date(commentData.date).toISOString().split(".")[0], // Định dạng ISO 8601 nhưng không có mili giây
      };
  
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/comment/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formattedData),
        }
      );
  
      if (response.ok) {
        const updatedComment = await response.json();
        setCommentList((prev) =>
          prev.map((comment) => (comment.commentID === id ? updatedComment : comment))
        );
        setEditingCommentId(null);
      } else {
        throw new Error("Unable to update comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleCreate = async () => {
    if (!newComment.accountID.accountID || !newComment.commentType.commenttypeID) {
      alert("Account ID và Comment Type ID không được để trống.");
      return;
    }
    try {
      const formattedData = {
        ...newComment,
        date: new Date(newComment.date).toISOString().split(".")[0], // Định dạng ISO 8601 nhưng không có mili giây
      };
  
      const response = await fetch("http://localhost:8080/api/v1/admin/comment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formattedData),
      });
  
      if (response.ok) {
        const createdComment = await response.json();
        setCommentList([...commentList, createdComment]);
        setNewComment({
          title: "",
          text: "",
          accountID: { accountID: null },
          commentType: { commenttypeID: null },
          image: "",
          status: "ENABLE",
          stative: "Waiting",
          date: new Date().toISOString().split("T")[0],
        });
      } else {
        throw new Error("Unable to create comment.");
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
          alt="Return"
          className="return-button"
          onClick={handleBackToDashboard}
        />
        <h2>Quản lý comment</h2>
      </div>

      <h3>Thêm mới comment</h3>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={newComment.title}
          onChange={(e) =>
            setNewComment((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        <label>Text:</label>
        <textarea
          value={newComment.text}
          onChange={(e) =>
            setNewComment((prev) => ({ ...prev, text: e.target.value }))
          }
        ></textarea>

        <label>Account ID:</label>
        <input
          type="number"
          value={newComment.accountID.accountID || ""}
          onChange={(e) =>
            setNewComment((prev) => ({
              ...prev,
              accountID: { accountID: e.target.value },
            }))
          }
        />

        <label>Comment Type ID:</label>
        <input
          type="number"
          value={newComment.commentType.commenttypeID || ""}
          onChange={(e) =>
            setNewComment((prev) => ({
              ...prev,
              commentType: { commenttypeID: e.target.value },
            }))
          }
        />

        <label>Date:</label>
        <input
          type="date"
          value={newComment.date}
          onChange={(e) =>
            setNewComment((prev) => ({ ...prev, date: e.target.value }))
          }
        />

        <label>Stative:</label>
        <select
          value={newComment.stative}
          onChange={(e) =>
            setNewComment((prev) => ({ ...prev, stative: e.target.value }))
          }
        >
          <option value="Waiting">Waiting</option>
          <option value="Processing">Processing</option>
          <option value="Complete">Complete</option>
        </select>

        <label>Image:</label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Upload Image</button>
        {imageUrl && <img src={imageUrl} alt="Comment" style={{ width: 100 }} />}

        <label>Status:</label>
        <select
          value={newComment.status}
          onChange={(e) =>
            setNewComment((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>

        <button onClick={handleCreate}>Tạo bình luận</button>
      </div>

      <h3>Danh sách bình luận</h3>
      {commentList.length === 0 ? (
        <p>No comments available.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Account ID</th>
              <th>Comment Type ID</th>
              <th>Date</th>
              <th>Xử lý</th>
              <th>Hình ảnh</th>
              <th>Trạng thái</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commentList.map((comment) => (
              <tr key={comment.commentID}>
                <td>{comment.commentID}</td>
                <td>{comment.title}</td>
                <td>{comment.text}</td>
                <td>{comment.accountID.accountID}</td>
                <td>{comment.commentType.commenttypeID}</td>
                <td>{comment.date}</td>
                <td>{comment.stative}</td>
                <td>
                  {comment.image && (
                    <img
                      src={comment.image}
                      alt="Comment"
                      style={{ width: "100px", height: "auto" }}
                    />
                  )}
                </td>
                <td>{comment.status}</td>
                <td>
                  {editingCommentId === comment.commentID ? (
                    <>
                      <button onClick={() => handleSave(comment.commentID, newComment)}>Lưu</button>
                      <button onClick={() => setEditingCommentId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.commentID);
                          setNewComment({
                            title: comment.title,
                            text: comment.text,
                            accountID: comment.accountID || { accountID: null },
                            commentType: comment.commentType || { commenttypeID: null },
                            image: comment.image,
                            status: comment.status,
                            stative: comment.stative,
                            date: comment.date,
                          });
                        }}
                      >
                        Chỉnh sửa
                      </button>
                      <button onClick={() => handleDeleteSoft(comment.commentID)}>Vô hiệu hóa</button>
                      <button onClick={() => handleDeleteHard(comment.commentID)}>Xóa</button>
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
