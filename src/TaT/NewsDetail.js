import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './NewsDetail.css';

export default function NewsDetail() {
  const { id } = useParams(); 
  const [news, setNews] = useState(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/news/${id}`);
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news details:", error);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (!news) return <p>Loading...</p>;

  return (
    <div className="news-detail">
      <img
        src={`${news.newsImage}`}
        srcSet={`${news.newsImage} 1x, ${news.newsImage.replace('.jpg', '@2x.jpg')} 2x`}
        alt={news.newsTitle}
        className="news-detail-image"
      />
      <h1 className="news-title">{news.newsTitle}</h1>
      <p className="news-detail-date">{new Date(news.date).toLocaleDateString()}</p>
      <div className="news-detail-content">{news.content}</div>
    </div>
  );
}
