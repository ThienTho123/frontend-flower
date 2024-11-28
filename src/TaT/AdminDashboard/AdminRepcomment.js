import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";

const AdminRepcomment = () => {
  const [repCommentList, setRepCommentList] = useState([]);
  const [newRepComment, setNewRepComment] = useState({
    account: { accountID: null },
    repcommenttext: "",
    repcommentdate: new Date().toISOString().split("T")[0],
    status: "ENABLE",
    image: "",
  });
  const [editingRepCommentId, setEditingRepCommentId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchRepComments = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/repcomment", {
          headers: { Authorization: `Bearer ${accesstoken}` },
          credentials: "include",
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        setRepCommentList(data || []);
      } catch (err) {
        console.error("Error fetching rep comments:", err.message);
        setError(err.message);
      }
    };

    fetchRepComments();
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
        headers: { Authorization: `Bearer ${accesstoken}` },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const imageUrl = data.DT;
        setImageUrl(imageUrl);
        setNewRepComment((prev) => ({ ...prev, image: imageUrl }));
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
        `http://localhost:8080/api/v1/admin/repcomment/softdelete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accesstoken}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        setRepCommentList((prev) =>
          prev.map((repComment) =>
            repComment.repcommentID === id ? { ...repComment, status: "DISABLE" } : repComment
          )
        );
      } else {
        throw new Error("Unable to disable rep comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/repcomment/harddelete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accesstoken}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        setRepCommentList((prev) => prev.filter((repComment) => repComment.repcommentID !== id));
      } else {
        throw new Error("Unable to delete rep comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    const repComment = repCommentList.find((item) => item.repcommentID === id);
    if (repComment) {
      setEditingRepCommentId(id);
      setNewRepComment({
        account: { accountID: repComment.account?.accountID || null },
        repcommenttext: repComment.repcommenttext || "",
        repcommentdate: repComment.repcommentdate || new Date().toISOString().split("T")[0],
        status: repComment.status || "ENABLE",
        image: repComment.image || "",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRepCommentId(null);
    setNewRepComment({
      account: { accountID: null },
      repcommenttext: "",
      repcommentdate: new Date().toISOString().split("T")[0],
      status: "ENABLE",
      image: "",
    });
  };

  const handleSave = async (id, repCommentData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/repcomment/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(repCommentData),
        }
      );

      if (response.ok) {
        const updatedRepComment = await response.json();
        setRepCommentList((prev) =>
          prev.map((repComment) =>
            repComment.repcommentID === id ? updatedRepComment : repComment
          )
        );
        setEditingRepCommentId(null);
      } else {
        throw new Error("Unable to update rep comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/repcomment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newRepComment),
      });

      if (response.ok) {
        const createdRepComment = await response.json();
        setRepCommentList([...repCommentList, createdRepComment]);
        setNewRepComment({
          account: { accountID: null },
          repcommenttext: "",
          repcommentdate: new Date().toISOString().split("T")[0],
          status: "ENABLE",
          image: "",
        });
      } else {
        throw new Error("Unable to create rep comment.");
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
        <h2>Quản lý phản hồi bình luận</h2>
      </div>

      <h3>{editingRepCommentId ? "Chỉnh sửa phản hồi" : "Thêm mới phản hồi"}</h3>
      <div>
        <label>Account ID:</label>
        <input
          type="number"
          value={newRepComment.account.accountID || ""}
          onChange={(e) =>
            setNewRepComment((prev) => ({
              ...prev,
              account: { accountID: e.target.value },
            }))
          }
        />

        <label>Text:</label>
        <textarea
          value={newRepComment.repcommenttext}
          onChange={(e) =>
            setNewRepComment((prev) => ({ ...prev, repcommenttext: e.target.value }))
          }
        ></textarea>

        <label>Date:</label>
        <input
          type="date"
          value={newRepComment.repcommentdate}
          onChange={(e) =>
            setNewRepComment((prev) => ({ ...prev, repcommentdate: e.target.value }))
          }
        />

        <label>Image:</label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Upload Image</button>
        {imageUrl && <img src={imageUrl} alt="Rep Comment" style={{ width: 100 }} />}

        <label>Status:</label>
        <select
          value={newRepComment.status}
          onChange={(e) =>
            setNewRepComment((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>

        {editingRepCommentId ? (
          <div>
            <button
              onClick={() => handleSave(editingRepCommentId, newRepComment)}
            >
              Save Changes
            </button>
            <button onClick={handleCancelEdit}>Cancel</button>
          </div>
        ) : (
          <button onClick={handleCreate}>Create Rep Comment</button>
        )}
      </div>

      <h3>Danh sách phản hồi</h3>
      {repCommentList.length === 0 ? (
        <p>Chưa có phản hồi nào.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Account ID</th>
              <th>Text</th>
              <th>Date</th>
              <th>Status</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {repCommentList.map((repComment) => (
              <tr key={repComment.repcommentID}>
                <td>{repComment.repcommentID}</td>
                <td>{repComment.account?.accountID || "N/A"}</td>
                <td>{repComment.repcommenttext}</td>
                <td>{repComment.repcommentdate}</td>
                <td>{repComment.status}</td>
                <td>
                  {repComment.image && (
                    <img
                      src={repComment.image}
                      alt="Rep Comment"
                      style={{ width: 100 }}
                    />
                  )}
                </td>
                <td>
                  <button onClick={() => handleEdit(repComment.repcommentID)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteSoft(repComment.repcommentID)}>
                    Soft Delete
                  </button>
                  <button onClick={() => handleDeleteHard(repComment.repcommentID)}>
                    Hard Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AdminRepcomment;
