import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import returnIcon from "./ImageDashboard/return-button.png";
import plus from "../StaffDashboard/ImageDashboard/plus.png";
const AdminDetect = () => {
  const [detect, setDetects] = useState([]);
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
        "http://localhost:8080/api/v1/admin/detect",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );
      const rawOrder = response.data?.detects || [];
      console.log(rawOrder);
      setDetects(rawOrder);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  const handleToggleStatus = async () => {
    if (!selectedEvent) return;
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v1/admin/detect/${selectedEvent.id}`,
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
        <h2>Quản Lý Nhận Diện Hoa</h2>
        <Link to={`/AdminDetect/new`}>
          <img
            src={plus}
            alt="Quay Lại"
            className="return-button"
            style={{ cursor: "pointer" }}
          />
        </Link>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {detect.length === 0 ? (
        <p>Không có nhận diện nào.</p>
      ) : (
        <>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>Số thứ tự</th>
                <th>hoa nhận diện</th>
                <th>Tên Việt</th>
                <th>Ảnh</th>
                <th>Đặc điểm</th>
                <th>Ý nghĩa</th>
                <th>Trạng thái</th>
                <th>Tương tác</th>
              </tr>
            </thead>
            <tbody>
              {detect.map((item) => (
                <tr key={item.id}>
                  <td>
                    <a
                      href={`/AdminDetect/edit/${item.id}`}
                      className="history-link"
                    >
                      {item.id}
                    </a>
                  </td>
                  <td title={item.flowerdetect}>{item.flowerdetect}</td>
                  <td title={item.vietnamname}>{item.vietnamname}</td>
                  <td>
                    <img
                      src={item.imageurl}
                      alt="Ảnh hoa"
                      style={{
                        width: "100px",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td title={item.characteristic || ""}>
                    {item.characteristic && item.characteristic.length > 100
                      ? item.characteristic.slice(0, 100) + "..."
                      : item.characteristic || "Không có thông tin"}
                  </td>
                  <td title={item.flowerlanguage || ""}>
                    {item.flowerlanguage && item.flowerlanguage.length > 100
                      ? item.flowerlanguage.slice(0, 100) + "..."
                      : item.flowerlanguage || "Không có thông tin"}
                  </td>                  <td>{item.status}</td>
                  <td>
                    <Link to={`/AdminDetect/edit/${item.id}`}>
                      <button>Chỉnh Sửa</button>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedEvent(item);
                        setConfirmModal(true);
                      }}
                    >
                      {item.status === "ENABLE" ? "Xóa" : "Hoàn tác"}
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
              Bạn có chắc chắn muốn {selectedEvent?.status ? "hoàn tác" : "xóa"}{" "}
              nhận diện này không?
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

export default AdminDetect;
