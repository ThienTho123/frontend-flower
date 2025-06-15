import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./NewsList.css";

export default function NewsList() {
  const sizePage = 4;
  const [newsList, setNewsList] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(sizePage);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          "https://deploybackend-j61h.onrender.com/news"
        );
        setAllNews(response.data.News);
        setNewsList(response.data.News.slice(0, visibleCount));
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    setNewsList(allNews.slice(0, visibleCount));
  }, [visibleCount, allNews]);

  const getShortDescription = (content) => {
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  return (
    <div className="news-list-container">
      <div className="news-title-container">
        <h1>Chuyện hoa từ mọi ngõ ngách</h1>
      </div>
      <div className="news-grid">
        {newsList.length > 0 ? (
          newsList.map((news) => (
            <Link
              to={`/news/${news.newsID}`}
              key={news.newsID}
              className="news-link"
            >
              <div className="news-card">
                <img src={news.image} alt={news.title} className="new-image" />
                <h2>{news.title}</h2>
                <p>{getShortDescription(news.content)}</p>
                <p>
                  <em>Ngày đăng: {new Date(news.date).toLocaleDateString()}</em>
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p>Không có tin tức để hiển thị</p>
        )}
      </div>

      <div className="load-button">
        <button onClick={() => setVisibleCount(visibleCount + sizePage)}>
          Tải thêm
        </button>
      </div>
    </div>
  );
}
