import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [newNews, setNewNews] = useState({
    image: "",
    title: "",
    content: "",
    status: "ENABLE",
    date: new Date().toISOString(),
  });
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/news", {
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
        setNewsList(data || []);
      } catch (err) {
        console.error("Error fetching news:", err.message);
        setError(err.message);
      }
    };

    fetchNews();
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
        setNewNews((prevNews) => ({
          ...prevNews,
          image: imageUrl,
        }));
        console.log("Upload successful:", imageUrl);
      } else {
        console.error("Upload failed:", data.EM);
      }
    } catch (err) {
      console.error("Upload error:", err.message);
    }
  };

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/news/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNewsList((prevNewsList) =>
          prevNewsList.map((news) =>
            news.newsID === id ? { ...news, status: "DISABLE" } : news
          )
        );
      } else {
        throw new Error("Unable to disable news.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/news/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNewsList((prevNewsList) =>
          prevNewsList.filter((news) => news.newsID !== id)
        );
      } else {
        throw new Error("Unable to delete news.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, newsData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/news/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newsData),
        }
      );

      if (response.ok) {
        const updatedNews = await response.json();
        setNewsList((prevNewsList) =>
          prevNewsList.map((news) =>
            news.newsID === id ? updatedNews : news
          )
        );
        setEditingNewsId(null);
      } else {
        throw new Error("Unable to update news.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      // Đảm bảo date có định dạng đúng
      const formattedDate = new Date().toISOString().split('.')[0];  // Loại bỏ phần millisecond
  
      const newNewsWithFormattedDate = {
        ...newNews,
        date: formattedDate,
      };
  
      console.log("Creating news with data: ", JSON.stringify(newNewsWithFormattedDate, null, 2));  // In ra JSON để kiểm tra
  
      const response = await fetch("http://localhost:8080/api/v1/admin/news", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newNewsWithFormattedDate),
      });
  
      if (response.ok) {
        const createdNews = await response.json();
        setNewsList([...newsList, createdNews]);
        setNewNews({
          image: "",
          title: "",
          content: "",
          status: "ENABLE",
          date: new Date().toISOString(), // Cập nhật lại giá trị date
        });
      } else {
        throw new Error("Unable to create news.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  const handleEditClick = (news) => {
    setEditingNewsId(news.newsID);
    setNewNews(news);
  
    // Cuộn trang về đầu khi nhấn Edit
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="admin-ql-container">
      <div className="title-container">
        <img
          src={returnIcon}
          alt="Back"
          className="return-button"
          onClick={handleBackToDashboard}
        />
        <h2>Quản lý News</h2>
      </div>
  
      <h3>{editingNewsId === null ? "Add New News" : "Edit News"}</h3>
      <div>
        <label>News Image: </label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Upload Image</button>
        {imageUrl && <img src={imageUrl} alt="News Thumbnail" style={{ width: 100 }} />}
  
        <label>Title:</label>
        <input
          type="text"
          value={newNews.title}
          onChange={(e) =>
            setNewNews((prev) => ({ ...prev, title: e.target.value }))
          }
        />
  
        <label>Content:</label>
        <textarea
          value={newNews.content}
          onChange={(e) =>
            setNewNews((prev) => ({ ...prev, content: e.target.value }))
          }
        />
  
        <label>Status: </label>
        <select
          value={newNews.status}
          onChange={(e) =>
            setNewNews((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>
  
        <label>Date: </label>
        <input
          type="datetime-local"
          value={newNews.date}
          onChange={(e) =>
            setNewNews((prev) => ({ ...prev, date: e.target.value }))
          }
        />
  
        {/* Hiển thị nút Create News khi không có bài viết đang chỉnh sửa */}
        {editingNewsId === null ? (
          <button onClick={handleCreate}>Create News</button>
        ) : (
          // Hiển thị nút Save khi đang chỉnh sửa bài viết
          <button onClick={() => handleSave(editingNewsId, newNews)}>Save</button>
        )}
      </div>
  
      <h3>List</h3>
      {newsList.length === 0 ? (
        <p>No news available.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Title</th>
              <th>Content</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {newsList.map((news) => (
              <tr key={news.newsID}>
                <td>{news.newsID}</td>
                <td>
                  <img
                    src={news.image}
                    alt="News"
                    style={{ width: "100px", height: "auto" }}
                  />
                </td>
                <td>{news.title}</td>
                <td className="content-column">{news.content}</td>
                <td>{news.status}</td>
                <td>{news.date}</td>
                <td>
                  {editingNewsId === news.newsID ? (
                    <>
                      <button onClick={() => handleSave(news.newsID, newNews)}>Save</button>
                      <button onClick={() => setEditingNewsId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                    <button
                      onClick={() => handleEditClick(news)}
                    >
                      Sửa
                    </button>
                      <button onClick={() => handleDeleteSoft(news.newsID)}>
                        Vô hiệu hóa
                      </button>
                      <button onClick={() => handleDeleteHard(news.newsID)}>
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
  
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
  
};

export default AdminNews;
