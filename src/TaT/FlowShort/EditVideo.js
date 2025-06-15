import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditVideoForm() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vidFile, setVidFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [commentable, setCommentable] = useState("YES");
  const [video, setVideo] = useState("YES");
  const [thumbnail, setThumbnail] = useState("YES");

  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Không tìm thấy access token");

        const res = await axios.get(
          `https://deploybackend-j61h.onrender.com/user/flowshort/putVideo/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const videoData = res.data;
        setTitle(videoData.title || "");
        setDescription(videoData.description || "");
        setVideo(videoData.vid_url || "");
        setThumbnail(videoData.thumb_url || "");
        setCommentable(videoData.commentable || "YES");
      } catch (error) {
        console.error(error);
        setModalMessage("Lỗi khi tải dữ liệu video");
        setModalType("error");
        setShowModal(true);
      }
    };
    fetchVideoData();
  }, [id]);
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
  const showModalMessage = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
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
      if (!token) throw new Error("Không tìm thấy access token");

      // Upload vid_url
      const formDataVideo = new FormData();
      formDataVideo.append("file", vidFile);

      const uploadVideoRes = await axios.post(
        "https://deploybackend-j61h.onrender.com/api/v1/upload",
        formDataVideo,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const vid_url = uploadVideoRes.data.DT;

      // Handle thumb_url
      let thumb_url = null;
      if (thumbFile) {
        // Nếu người dùng đã chọn thumb_url, upload luôn
        const formDataThumb = new FormData();
        formDataThumb.append("file", thumbFile);
        const uploadThumbRes = await axios.post(
          "https://deploybackend-j61h.onrender.com/api/v1/upload",
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
            "https://deploybackend-j61h.onrender.com/api/v1/upload",
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

      // Send PUT request to update video
      const postData = {
        title,
        description,
        vid_url,
        thumb_url,
        commentable,
      };

      await axios.put(
        `https://deploybackend-j61h.onrender.com/user/flowshort/${id}`,
        postData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showModalMessage("Cập nhật video thành công!", "success");
      navigate("/flowshort");
    } catch (error) {
      console.error(error);
      showModalMessage("Lỗi khi cập nhật video", "error");
    }
    setLoading(false);
  };
  function isVideoFile(fileUrl) {
    const videoExtensions = ["mp4", "webm", "ogg"];
    const ext = getFileExtension(fileUrl);
    return videoExtensions.includes(ext);
  }

  function isImageFile(fileUrl) {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
    const ext = getFileExtension(fileUrl);
    return imageExtensions.includes(ext);
  }
  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 400, margin: "auto" }}
        className="form-upload-video"
      >
        <h2>Cập nhật Video / Ảnh</h2>
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

        <label>Video / Ảnh hiện tại</label>
        <br />
        {video && (
          <>
            {isVideoFile(video) ? (
              <video src={video} controls width="100%" />
            ) : isImageFile(video) ? (
              <img src={video} alt="Video" style={{ width: "100%" }} />
            ) : (
              <p>Định dạng không hỗ trợ</p>
            )}
            <br />
            <br />
          </>
        )}

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

        <label>Thumbnail hiện tại</label>
        <br />
        {thumbnail && (
          <>
            {isImageFile(thumbnail) ? (
              <img src={thumbnail} alt="Thumbnail" style={{ width: "100%" }} />
            ) : (
              <p>Định dạng không hỗ trợ</p>
            )}
            <br />
            <br />
          </>
        )}

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
          {loading ? "Đang tải lên..." : "Cập nhật"}
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
