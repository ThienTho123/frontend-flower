import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VideoUpload.css";
const allowedExtensions = [
  "mp4",
  "webm",
  "ogg",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "svg",
  "webp",
];

function getFileExtension(filename) {
  return filename.split(".").pop().toLowerCase();
}

export default function PostVideoForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vidFile, setVidFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [commentable, setCommentable] = useState("YES"); // hoặc NO
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // "success" hoặc "error"
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const showModalMessage = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };
  const navigate = useNavigate();

  // Hàm lấy frame đầu video thành ảnh base64
  const captureVideoThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");

      video.preload = "metadata";
      video.src = url;

      video.onloadeddata = () => {
        video.currentTime = 0;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Tạo tên file thumbnail
        const thumbnailName = `${Date.now()}_${crypto.randomUUID()}_thumbnail.png`;

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const fileThumb = new File([blob], thumbnailName, {
              type: "image/png",
            });
            resolve(fileThumb);
          } else {
            reject("Không thể tạo thumbnail video");
          }
        }, "image/png");
      };

      video.onerror = () => {
        reject("Lỗi tải video để tạo thumbnail");
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vidFile) {
      showModalMessage("Vui lòng chọn video hoặc ảnh cho vid_url", "error");
      return;
    }
    const ext = getFileExtension(vidFile.name);
    if (!allowedExtensions.includes(ext)) {
      showModalMessage("File vid_url không hợp lệ", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showModalMessage("Không tìm thấy access token", "error");
        setLoading(false);
        return;
      }

      // Upload vid_url
      const formDataVideo = new FormData();
      formDataVideo.append("file", vidFile);

      const uploadVideoRes = await axios.post(
        "https://deploybackend-1ta9.onrender.com/api/v1/upload",
        formDataVideo,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const vid_url = uploadVideoRes.data.DT;

      // Xử lý thumb_url
      let thumb_url = null;
      if (thumbFile) {
        // Nếu người dùng đã chọn thumb_url, upload luôn
        const formDataThumb = new FormData();
        formDataThumb.append("file", thumbFile);
        const uploadThumbRes = await axios.post(
          "https://deploybackend-1ta9.onrender.com/api/v1/upload",
          formDataThumb,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        thumb_url = uploadThumbRes.data.DT;
      } else {
        // Nếu chưa có thumb, tùy theo loại file vidFile lấy thumb
        if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) {
          // Ảnh thì dùng chính ảnh đó làm thumb
          thumb_url = vid_url;
        } else {
          // Video thì lấy frame đầu
          const thumbFileFromVideo = await captureVideoThumbnail(vidFile);
          const formDataThumb = new FormData();
          formDataThumb.append("file", thumbFileFromVideo);
          const uploadThumbRes = await axios.post(
            "https://deploybackend-1ta9.onrender.com/api/v1/upload",
            formDataThumb,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          thumb_url = uploadThumbRes.data.DT;
        }
      }

      // Gửi PostVideo lên API
      const postData = {
        title,
        description,
        vid_url,
        thumb_url,
        commentable,
      };

      const postRes = await axios.post(
        "https://deploybackend-1ta9.onrender.com/user/flowshort",
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showModalMessage("Đăng video thành công!", "success");
      // reset form
      setTitle("");
      setDescription("");
      setVidFile(null);
      setThumbFile(null);
      setCommentable("YES");
      navigate("/flowshort");
    } catch (error) {
      console.error(error);
      showModalMessage("Lỗi khi đăng video", "error");
    }
    setLoading(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 400, margin: "auto" }}
        className="form-upload-video"
      >
        <h2>Đăng Video / Ảnh</h2>

        <label>Tiêu đề</label>
        <br />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <br />

        <label>Mô tả</label>
        <br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <br />
        <br />

        <label>Chọn video/ảnh</label>
        <br />
        <input
          type="file"
          accept=".mp4,.webm,.ogg,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
          onChange={(e) => setVidFile(e.target.files[0])}
          required
        />
        <br />
        <br />

        <label>Chọn thumbnail (nếu có)</label>
        <br />
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
          onChange={(e) => setThumbFile(e.target.files[0])}
        />
        <br />
        <br />

        <label>Cho phép bình luận?</label>
        <br />
        <select
          value={commentable}
          onChange={(e) => setCommentable(e.target.value)}
        >
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
        <br />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Đang tải lên..." : "Đăng"}
        </button>
      </form>

      {showModal && (
        <div
          className="modal-upload-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className={`modal-upload-content ${modalType}`}>
            <h3>{modalType === "success" ? "🎉 Thành công!" : "⚠️ Lỗi"}</h3>
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}
