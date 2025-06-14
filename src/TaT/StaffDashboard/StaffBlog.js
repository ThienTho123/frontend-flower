import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import returnIcon from "./ImageDashboard/return-button.png";
import plus from "./ImageDashboard/plus.png";
const StaffBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState(null);

  const formatTimeAgo = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 6)
      return "Ngày không hợp lệ";

    const postDate = new Date(
      dateArray[0],
      dateArray[1] - 1,
      dateArray[2],
      dateArray[3],
      dateArray[4],
      dateArray[5]
    );

    if (isNaN(postDate.getTime())) return "Ngày không hợp lệ";

    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "1 phút trước";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;

    return postDate.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "https://deploybackend-1ta9.onrender.com/api/v1/staff/blog",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );
        const rawOrder = response.data?.blogs || [];
        console.log(rawOrder);
        if (!Array.isArray(rawOrder)) {
          console.error("Order data is not an array:", rawOrder);
          setBlogs([]);
          return;
        }

        const updatedOrder = rawOrder.map((item, index) => ({
          stt: index + 1,
          blogid: item.blogid,
          content: item.content,
          title: item.title,
          status: item.status,
          date: formatTimeAgo(item.date),
        }));

        setBlogs(updatedOrder);
      } catch (error) {
        console.error("Error fetching purchase history:", error);
      }
    };

    fetchOrders();
  }, [accesstoken]);

  const handleSoftDelete = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/staff/order/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.ok) {
        setBlogs((prevOrders) =>
          prevOrders.map((order) =>
            order.orderID === id ? { ...order, status: "DISABLE" } : order
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa đơn hàng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await axios.delete(
        `https://deploybackend-1ta9.onrender.com/api/v1/staff/blog/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.status === 200) {
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.blogid === id
              ? {
                  ...blog,
                  status: currentStatus === "ENABLE" ? "DISABLE" : "ENABLE",
                }
              : blog
          )
        );
      } else {
        throw new Error("Không thể cập nhật trạng thái.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  const handleBackToDashboard = () => {
    navigate("/staff");
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
        <h2>Quản Lý Blog - Nhân viên</h2>
        <Link to={`/StaffBlog/new-blog`}>
          <img
            src={plus}
            alt="Quay Lại"
            className="return-button"
            style={{ cursor: "pointer" }} // Hiển thị con trỏ khi hover
          />
        </Link>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {blogs.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>Số thứ tự</th>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
                <th>Tương tác</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((order) => (
                <tr key={order.blogid}>
                  <td>{order.stt}</td>
                  <td>
                    <a href={`/blog/${order.blogid}`} className="history-link">
                      {order.blogid}
                    </a>
                  </td>
                  <td title={order.title}>
                    {order.title.length > 30
                      ? order.title.slice(0, 30) + "..."
                      : order.title}
                  </td>{" "}
                  <td title={order.content}>
                    {order.content.length > 30
                      ? order.content.slice(0, 30) + "..."
                      : order.content}
                  </td>
                  <td>{order.date}</td>
                  <td>{order.status}</td>
                  <td>
                    <Link to={`/myblog/${order.blogid}`}>
                      <button>Chỉnh Sửa</button>
                    </Link>{" "}
                    {order.status === "ENABLE" ? (
                      <button
                        onClick={() =>
                          handleToggleStatus(order.blogid, order.status)
                        }
                      >
                        Xóa
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleToggleStatus(order.blogid, order.status)
                        }
                      >
                        Hoàn tác
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default StaffBlog;
