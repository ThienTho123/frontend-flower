import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VideoList = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get('http://localhost:8080/flowshort');
                setVideos(response.data.videos || []);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };
        fetchVideos();
    }, []);

    return (
        <div className="video-list">
            {videos.map(video => (
                <Link to={`/flowshort/${video.id}`} key={video.id} className="video-card">
                    <img src={video.thumb_url} alt={video.title} className="video-thumbnail" />
                    <div className="video-info">
                        <h2>{video.title}</h2>
                        <p>{video.likes} Likes · {video.views} Views</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};


export default VideoList;