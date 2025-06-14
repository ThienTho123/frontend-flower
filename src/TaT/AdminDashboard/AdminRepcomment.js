import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";

const AdminRepcomment = () => {
  const [repCommentList, setRepCommentList] = useState([]);
  const [newRepComment, setNewRepComment] = useState({
    account: { accountID: null },
    comment: { commentID: null }, // Đảm bảo comment luôn là một đối tượng
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchRepComments = async () => {
      try {
        const response = await fetch(
          "https://deploybackend-1ta9.onrender.com/api/v1/admin/repcomment",
          {
            headers: { Authorization: `Bearer ${accesstoken}` },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        setRepCommentList(data.repComments || []);
        setAccounts(data.accounts || []);
        setComments(data.comments || []);
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
      const response = await fetch(
        "https://deploybackend-1ta9.onrender.com/api/v1/upload",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accesstoken}` },
          credentials: "include",
          body: formData,
        }
      );

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
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/repcomment/softdelete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accesstoken}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        setRepCommentList((prev) =>
          prev.map((repComment) =>
            repComment.repcommentID === id
              ? { ...repComment, status: "DISABLE" }
              : repComment
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
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/repcomment/harddelete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accesstoken}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        setRepCommentList((prev) =>
          prev.filter((repComment) => repComment.repcommentID !== id)
        );
      } else {
        throw new Error("Unable to delete rep comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    // Lưu vị trí cuộn hiện tại
    const currentScrollPosition = window.scrollY;
    setScrollPosition(currentScrollPosition);

    const repComment = repCommentList.find((item) => item.repcommentID === id);
    if (repComment) {
      setEditingRepCommentId(id);
      setNewRepComment({
        account: { accountID: repComment.account?.accountID || null },
        comment: { commentID: repComment.comment?.commentID || null },
        repcommenttext: repComment.repcommenttext || "",
        repcommentdate:
          repComment.repcommentdate || new Date().toISOString().split("T")[0],
        status: repComment.status || "ENABLE",
        image: repComment.image || "",
      });

      // Cuộn lên đầu trang
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      if (
        !repCommentData.account.accountID ||
        !repCommentData.comment.commentID
      ) {
        throw new Error("Account ID và Comment ID không được để trống.");
      }
      const payload = {
        comment: { commentID: repCommentData.comment.commentID },
        account: { accountID: repCommentData.account.accountID },
        repcommentdate: repCommentData.repcommentdate,
        repcommenttext: repCommentData.repcommenttext,
        status: repCommentData.status,
        image: repCommentData.image,
      };

      console.log(
        "JSON data to be sent for edit:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/repcomment/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
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

        // Cuộn lại vị trí đã lưu
        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
      } else {
        throw new Error("Unable to update rep comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreate = async () => {
    try {
      if (
        !newRepComment.account.accountID ||
        !newRepComment.comment.commentID
      ) {
        throw new Error("Account ID và Comment ID không được để trống.");
      }

      const formattedDate = new Date(newRepComment.repcommentdate)
        .toISOString()
        .split(".")[0];
      const payload = {
        ...newRepComment,
        repcommentdate: formattedDate,
        account: { accountID: Number(newRepComment.account.accountID) },
        comment: { commentID: Number(newRepComment.comment.commentID) },
      };

      console.log(
        "JSON data to be sent for creation:",
        JSON.stringify(payload, null, 2)
      );
      const response = await fetch(
        "https://deploybackend-1ta9.onrender.com/api/v1/admin/repcomment",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const createdRepComment = await response.json();
        setRepCommentList([...repCommentList, createdRepComment]);
        setNewRepComment({
          account: { accountID: null },
          comment: { commentID: null },
          repcommenttext: "",
          repcommentdate: new Date().toISOString().split("T")[0],
          status: "ENABLE",
          image: "",
        });
        // Cuộn xuống cuối trang
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        }, 100); // Đặt thời gian nhỏ để đảm bảo DOM đã cập nhật
      } else {
        const errorData = await response.json();
        console.error("Error from server:", errorData);
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

      <h3>
        {editingRepCommentId ? "Chỉnh sửa phản hồi" : "Thêm mới phản hồi"}
      </h3>
      <div>
        <label>Account:</label>
        <select
          value={newRepComment.account.accountID || ""}
          onChange={(e) =>
            setNewRepComment((prev) => ({
              ...prev,
              account: { accountID: e.target.value },
            }))
          }
        >
          <option value="">Chọn tài khoản</option>
          {accounts.map((account) => (
            <option key={account.accountID} value={account.accountID}>
              {account.name} ({account.accountID})
            </option>
          ))}
        </select>
        <label>Comment:</label>
        <select
          value={newRepComment.comment.commentID || ""}
          onChange={(e) =>
            setNewRepComment((prev) => ({
              ...prev,
              comment: { commentID: e.target.value },
            }))
          }
        >
          <option value="">Chọn bình luận</option>
          {comments.map((comment) => (
            <option key={comment.commentID} value={comment.commentID}>
              ID: {comment.commentID} - {comment.text}
            </option>
          ))}
        </select>

        <label>Text:</label>
        <textarea
          value={newRepComment.repcommenttext}
          onChange={(e) =>
            setNewRepComment((prev) => ({
              ...prev,
              repcommenttext: e.target.value,
            }))
          }
        ></textarea>

        <label>Date:</label>
        <input
          type="datetime-local"
          value={newRepComment.repcommentdate}
          onChange={(e) =>
            setNewRepComment((prev) => ({
              ...prev,
              repcommentdate: e.target.value,
            }))
          }
        />

        <label>Image:</label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Upload Image</button>
        {imageUrl && (
          <img src={imageUrl} alt="Rep Comment" style={{ width: 100 }} />
        )}

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
              Lưu
            </button>
            <button onClick={handleCancelEdit}>Hủy</button>
          </div>
        ) : (
          <button onClick={handleCreate}>Tạo repcomment</button>
        )}
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Danh sách phản hồi</h3>
      {repCommentList.length === 0 ? (
        <p>Chưa có phản hồi nào.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Comment ID</th>
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
                <td>
                  {repComment.account?.name} ({repComment.account?.accountID})
                </td>
                <td>
                  {repComment.comment?.accountID?.name} (
                  {repComment.comment?.accountID?.accountID})
                </td>
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
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteSoft(repComment.repcommentID)}
                  >
                    Vô hiệu hóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRepcomment;
