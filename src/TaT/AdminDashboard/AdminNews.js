import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import returnIcon from './ImageDashboard/return-button.png'; 

const AdminNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [editingNewsId, setEditingNewsId] = useState(null); 
  const [newNews, setNewNews] = useState({
    newsTitle: "",
    newsImage: "",
    content: "",
    status: "Enable",
  });
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate(); 
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/news",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách tin tức.");
        }

        const data = await response.json();
        setNewsList(data.News || []);
      } catch (err) {
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
        setImageUrl(data.DT); 
        setNewNews((prev) => ({ ...prev, newsImage: data.DT })); // Cập nhật đúng vào newNews
        console.log("Tải lên thành công:", data.DT);
      } else {
        console.error("Lỗi khi tải lên:", data.EM);
      }
    } catch (err) {
      console.error("Lỗi khi tải lên:", err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/news/${id}`,
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
            news.newsID === id ? { ...news, status: "Disable" } : news
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa tin tức.");
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
        throw new Error("Không thể cập nhật tin tức.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/news", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newNews),
      });

      if (response.ok) {
        const createdNews = await response.json();
        setNewsList([...newsList, createdNews]);
        setNewNews({
          newsTitle: "",
          newsImage: "",
          content: "",
          status: "Enable",
        });
      } else {
        throw new Error("Không thể tạo tin tức.");
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
        <h2>Quản Lý Tin Tức</h2>
      </div>
      <h3>Thêm Tin Tức Mới</h3>
      <div>
        <label>Tiêu Đề Tin Tức: </label>
        <input
          value={newNews.newsTitle}
          onChange={(e) =>
            setNewNews((prev) => ({ ...prev, newsTitle: e.target.value }))
          }
        />
        <label>Hình Ảnh (URL): </label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Tải ảnh lên</button>
        {imageUrl && <img src={imageUrl} alt="News Avatar" style={{ width: 100 }} />}

        <label>Nội Dung: </label>
        <textarea
          value={newNews.content}
          onChange={(e) =>
            setNewNews((prev) => ({ ...prev, content: e.target.value }))
          }
        />
        <label>Trạng Thái: </label>
        <select
          value={newNews.status}
          onChange={(e) =>
            setNewNews((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {newsList.length === 0 ? (
        <p>Không có tin tức nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Tin Tức</th>
              <th>Tiêu Đề</th>
              <th>Hình Ảnh (URL)</th>
              <th>Nội Dung</th>
              <th>Ngày Tạo</th> 
              <th>Trạng Thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {newsList.map((news) => (
              <tr key={news.newsID}>
                <td>{news.newsID}</td>
                <td>{editingNewsId === news.newsID ? (
                    <input
                      value={news.newsTitle}
                      onChange={(e) =>
                        setNewsList((prevNewsList) =>
                          prevNewsList.map((n) =>
                            n.newsID === news.newsID
                              ? { ...n, newsTitle: e.target.value }
                              : n
                          )
                        )
                      }
                    />
                  ) : (
                    news.newsTitle
                  )}
                </td>
                <td>{editingNewsId === news.newsID ? (
                    <div>
                      <label>Avatar: </label>
                      <input type="file" onChange={handleFileChange} />
                      <button onClick={handleUploadImage}>Tải ảnh lên</button>
                      {imageUrl && <img src={imageUrl} alt="News Avatar" style={{ width: 100 }} />}
                    </div>
                  ) : (
                    <img src={news.newsImage} alt="News Avatar" style={{ width: 100 }} />
                  )}
                </td>
                <td>{editingNewsId === news.newsID ? (
                    <textarea
                      value={news.content}
                      onChange={(e) =>
                        setNewsList((prevNewsList) =>
                          prevNewsList.map((n) =>
                            n.newsID === news.newsID
                              ? { ...n, content: e.target.value }
                              : n
                          )
                        )
                      }
                    />
                  ) : (
                    news.content
                  )}
                </td>
                <td>{news.date ? new Date(news.date).toLocaleDateString("en-GB") : ""}</td>
                <td>{editingNewsId === news.newsID ? (
                    <select
                      value={news.status}
                      onChange={(e) =>
                        setNewsList((prevNewsList) =>
                          prevNewsList.map((n) =>
                            n.newsID === news.newsID
                              ? { ...n, status: e.target.value }
                              : n
                          )
                        )
                      }
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  ) : (
                    news.status
                  )}
                </td>
                <td>
                  {editingNewsId === news.newsID ? (
                    <>
                      <button
                        onClick={() =>
                          handleSave(news.newsID, {
                            newsTitle: news.newsTitle,
                            newsImage: news.newsImage,
                            content: news.content,
                            status: news.status,
                          })
                        }
                      >
                        Lưu
                      </button>
                      <button onClick={() => setEditingNewsId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingNewsId(news.newsID)}>Chỉnh Sửa</button>
                      <button onClick={() => handleDelete(news.newsID)}>Xóa</button>
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

export default AdminNews;
