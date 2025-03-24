import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import returnIcon from "./ImageDashboard/return-button.png";
import plus from "./ImageDashboard/plus.png";
const StaffEvent = () => {
  const [event, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const formatTimeAgo = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 5) 
      return "Ngày không hợp lệ";

    // Giải nén với giá trị mặc định cho giây
    const [year, month, day, hour, minute, second = 0] = dateArray;

    const postDate = new Date(year, month - 1, day, hour, minute, second);

    if (isNaN(postDate.getTime())) return "Ngày không hợp lệ";

    // Định dạng ngày giờ kiểu Việt Nam
    return postDate.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/staff/event",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );
      const rawOrder = response.data?.Event || [];
      console.log(rawOrder);
      if (!Array.isArray(rawOrder)) {
        console.error("Order data is not an array:", rawOrder);
        setEvents([]);
        return;
      }
    
      const updatedOrder = rawOrder.map((item, index) => ({
        stt: index + 1,
        id: item.id,
        name: item.name,
        description: item.description,
        color: item.color,
        end: formatTimeAgo(item.end),
        start: formatTimeAgo(item.start),
        status: item.status,
        _manual: item._manual,
      }));

      setEvents(updatedOrder);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  const handleToggleStatus = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v1/staff/event/${id}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      if (response.status === 200) {
        // Sau khi xóa hoặc cập nhật trạng thái, lấy lại dữ liệu mới từ backend
        fetchEvents();
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
        <Link to={`/StaffEvent/new-event`}>
          <img
            src={plus}
            alt="Quay Lại"
            className="return-button"
            style={{ cursor: "pointer" }} // Hiển thị con trỏ khi hover
          />
        </Link>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {event.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>Số thứ tự</th>
                <th>ID</th>
                <th>Tên sự kiện</th>
                <th>Nội dung</th>
                <th>Màu sắc</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Tương tác</th>
              </tr>
            </thead>
            <tbody>
              {event.map((event) => (
                <tr key={event.id}>
                  <td>{event.stt}</td>
                  <td>
                    <a href={`/StaffEvent/edit/${event.id}`} className="history-link">
                      {event.id}
                    </a>
                  </td>
                  <td title={event.name}>
                    {event.name.length > 30
                      ? event.name.slice(0, 30) + "..."
                      : event.name}
                  </td>{" "}
                  <td title={event.description}>
                    {event.description.length > 30
                      ? event.description.slice(0, 30) + "..."
                      : event.description}
                  </td>
                  <td>{event.color}</td>
                  <td>{event.start}</td>
                  <td>{event.end}</td>
                  <td>{event.status}</td>
                  <td>
                    <Link to={`/StaffEvent/edit/${event.id}`}>
                      <button>Chỉnh Sửa</button>
                    </Link>
                    {event._manual === false ? (
                      <button
                        onClick={() =>
                          handleToggleStatus(event.id, event.status)
                        }
                      >
                        Xóa
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleToggleStatus(event.id, event.status)
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

export default StaffEvent;
