import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import returnIcon from "./ImageDashboard/return-button.png";
import plus from "../StaffDashboard/ImageDashboard/plus.png";
const AdminEvent = () => {
  const [event, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [backendMessage, setBackendMessage] = useState("");

  const formatDateTime = (dateTime) => {
    if (!dateTime || !Array.isArray(dateTime)) {
      return "Không xác định";
    }

    const [year, month, day, hour = 0, minute = 0, second = 0] = dateTime;
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");

    return `${day}/${month}/${year} - ${formattedHour}:${formattedMinute}`;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-1ta9.onrender.com/api/v1/admin/event",
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
        end: formatDateTime(item.end),
        start: formatDateTime(item.start),
        status: item.status,
        _manual: item._manual,
      }));

      setEvents(updatedOrder);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  const handleToggleStatus = async () => {
    if (!selectedEvent) return;
    try {
      const response = await axios.delete(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/event/${selectedEvent.id}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      setBackendMessage(response.data || "Thao tác thành công!");
      setResultModal(true);
      fetchEvents();
    } catch (err) {
      setBackendMessage(err.response?.data || "Lỗi không xác định");
      setResultModal(true);
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
        <h2>Quản Lý Sự kiện</h2>
        <Link to={`/AdminEvent/new-event`}>
          <img
            src={plus}
            alt="Quay Lại"
            className="return-button"
            style={{ cursor: "pointer" }}
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
                    <a
                      href={`/AdminEvent/edit/${event.id}`}
                      className="history-link"
                    >
                      {event.id}
                    </a>
                  </td>
                  <td title={event.name}>
                    {event.name.length > 30
                      ? event.name.slice(0, 30) + "..."
                      : event.name}
                  </td>
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
                    <Link to={`/AdminEvent/edit/${event.id}`}>
                      <button>Chỉnh Sửa</button>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setConfirmModal(true);
                      }}
                    >
                      {event._manual === false ? "Xóa" : "Hoàn tác"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {/* Modal Xác Nhận */}
      {confirmModal && (
        <div className="modal">
          <div className="modal-content">
            <p>
              Bạn có chắc chắn muốn{" "}
              {selectedEvent?._manual ? "hoàn tác" : "xóa"} sự kiện này không?
            </p>
            <button
              onClick={() => {
                handleToggleStatus();
                setConfirmModal(false);
              }}
            >
              Xác nhận
            </button>
            <button onClick={() => setConfirmModal(false)}>Hủy</button>
          </div>
        </div>
      )}

      {/* Modal Kết Quả */}
      {resultModal && (
        <div className="modal">
          <div className="modal-content">
            <p>{backendMessage}</p>
            <button onClick={() => setResultModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvent;
