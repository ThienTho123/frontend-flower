import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "./CreateEventForm.css";

const AdminEditEvent = () => {
  const { id } = useParams();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3788d8");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowerList, setFlowerList] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useBootstrap();

  useEffect(() => {
    fetchFlowers();
    fetchEventDetails();
  }, [id]);

  const fetchFlowers = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        "https://deploybackend-j61h.onrender.com/api/v1/admin/event/getflowersize",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setFlowerList(response.data.AllFlower || []);
    } catch (error) {
      console.error("Error fetching flowers:", error);
      setErrorMessage("Không thể tải danh sách hoa");
      setIsErrorModalOpen(true);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/event/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const eventData = response.data.Event;
      const eventFlowers = response.data.EventFlower || [];

      if (eventData) {
        setEventName(eventData.name);
        setDescription(eventData.description);
        setColor(eventData.color);

        setStartDate(formatDateArrayToString(eventData.start));
        setEndDate(formatDateArrayToString(eventData.end));
      }

      const processedFlowers = eventFlowers.map((flower) => ({
        flowerName: flower.flowerName,
        flowerID: flower.flowerID,
        sizeIDChoose:
          flower.size && flower.size.length > 0
            ? flower.size.find((s) => s.sizeName === flower.sizeChoose)
                ?.flowerSizeID
            : null,
        sizeName: flower.sizeChoose || "Tất cả kích thước",
        saleOff: flower.saleOff || "0.00",
        imageUrl: flower.imageurl,
        idEventFlower: flower.idEventFlower,
      }));

      setSelectedFlowers(processedFlowers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setLoading(false);
      setErrorMessage("Không thể tải chi tiết sự kiện");
      setIsErrorModalOpen(true);
    }
  };

  const formatDateArrayToString = (dateArray) => {
    const [year, month, day, hour, minute, second] = dateArray;
    const formattedMonth = String(month).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const formattedHour = String(hour).padStart(2, "0");
    const formattedMinute = String(minute).padStart(2, "0");

    return `${year}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}`;
  };

  const formatDateToLocalDateTime = (dateString) => {
    const date = new Date(dateString);
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ];
  };

  const handleAddFlower = (flowerData, isAllSize = false) => {
    const exists = selectedFlowers.some(
      (f) =>
        f.flowerName === flowerData.flowerName &&
        (isAllSize || f.sizeIDChoose === flowerData.sizeIDChoose)
    );

    if (!exists) {
      const newFlowerEntry = {
        flowerName: flowerData.flowerName,
        sizeIDChoose: isAllSize ? -1 : flowerData.sizeIDChoose,
        sizeName: isAllSize ? "Tất cả kích thước" : flowerData.sizeName,
        saleOff: "0.00",
        flowerID: flowerData.flowerID,
        imageUrl: flowerData.imageUrl || flowerData.imageurl,
      };

      setSelectedFlowers([...selectedFlowers, newFlowerEntry]);
    }
  };

  const handleRemoveFlower = (index) => {
    const newSelectedFlowers = [...selectedFlowers];
    newSelectedFlowers.splice(index, 1);
    setSelectedFlowers(newSelectedFlowers);
  };

  const handleSaleOffChange = (index, value) => {
    const newSelectedFlowers = [...selectedFlowers];
    newSelectedFlowers[index].saleOff = value;
    setSelectedFlowers(newSelectedFlowers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!eventName.trim() || !description.trim() || !startDate || !endDate) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin!");
      setIsErrorModalOpen(true);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setErrorMessage("Ngày không hợp lệ. Vui lòng chọn lại!");
      setIsErrorModalOpen(true);
      return;
    }

    if (start >= end) {
      setErrorMessage("Ngày kết thúc phải sau ngày bắt đầu!");
      setIsErrorModalOpen(true);
      return;
    }

    setIsModalOpen(true);
  };

  const confirmSubmit = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const eventData = {
        eventName: eventName,
        description: description,
        color: color,
        start: formatDateToLocalDateTime(startDate),
        end: formatDateToLocalDateTime(endDate),
        eventFlowerDTOS: selectedFlowers.map((flower) => ({
          idEventFlower: flower.idEventFlower,
          flowerName: flower.flowerName,
          sizeIDChoose: flower.sizeIDChoose,
          saleOff: parseFloat(flower.saleOff),
          flowerID: flower.flowerID,
        })),
      };

      await axios.put(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/event/${id}`,
        eventData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      setIsModalOpen(false);
      setErrorMessage(
        error.response?.data || "Có lỗi xảy ra khi cập nhật sự kiện!"
      );
      setIsErrorModalOpen(true);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="event-form-container">
      <h2 className="event-form-title">Chỉnh Sửa Sự Kiện (Admin)</h2>

      <div className="event-form-group">
        <label>Tên Sự Kiện:</label>
        <input
          type="text"
          className="event-form-input"
          placeholder="Nhập tên sự kiện"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
      </div>

      <div className="event-form-group">
        <label>Mô Tả:</label>
        <textarea
          className="event-form-textarea"
          placeholder="Nhập mô tả sự kiện"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      <div className="event-form-group">
        <label>Màu Sắc:</label>
        <input
          type="color"
          className="event-form-color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <span className="color-value">{color}</span>
      </div>

      <div className="event-form-date-container">
        <div className="event-form-group">
          <label>Ngày Bắt Đầu:</label>
          <input
            type="datetime-local"
            className="event-form-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="event-form-group">
          <label>Ngày Kết Thúc:</label>
          <input
            type="datetime-local"
            className="event-form-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <h3 className="event-form-subtitle">Thêm Sản Phẩm Cho Sự Kiện</h3>

      <div className="event-form-flower-select">
        {flowerList.map((flower, flowerIndex) => (
          <div key={flowerIndex} className="flower-item">
            <div className="flower-item-header">
              <img
                src={flower.imageurl}
                alt={flower.flowerName}
                className="flower-image"
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: "10px",
                }}
              />
              <h4>{flower.flowerName}</h4>
            </div>
            <div className="size-options">
              <button
                type="button"
                className="size-button all-size-button"
                onClick={() =>
                  handleAddFlower(
                    {
                      flowerName: flower.flowerName,
                      flowerID: flower.flowerID,
                      imageUrl: flower.imageurl,
                    },
                    true
                  )
                }
              >
                Tất Cả Kích Thước
              </button>
              {flower.size?.map((size, sizeIndex) => (
                <button
                  key={sizeIndex}
                  type="button"
                  className="size-button"
                  onClick={() =>
                    handleAddFlower({
                      flowerName: flower.flowerName,
                      sizeIDChoose: size.flowerSizeID,
                      sizeName: size.sizeName,
                      flowerID: flower.flowerID,
                      imageUrl: flower.imageurl,
                    })
                  }
                >
                  {size.sizeName}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="event-form-selected-flowers">
        <h4>Sản Phẩm Đã Chọn:</h4>
        {selectedFlowers.length === 0 ? (
          <p>Chưa có sản phẩm nào được chọn</p>
        ) : (
          <table className="selected-flowers-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên Hoa</th>
                <th>Kích Thước</th>
                <th>Giảm Giá (%)</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {selectedFlowers.map((flower, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={flower.imageUrl}
                      alt={flower.flowerName}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>{flower.flowerName}</td>
                  <td>{flower.sizeName}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={flower.saleOff}
                      onChange={(e) =>
                        handleSaleOffChange(index, e.target.value)
                      }
                      className="sale-off-input"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="remove-flower-button"
                      onClick={() => handleRemoveFlower(index)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button onClick={handleSubmit} className="event-form-submit-button">
        Cập Nhật Sự Kiện
      </button>

      {/* Modal xác nhận */}
      {isModalOpen && (
        <div
          className="event-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="event-modal-content"
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3>Xác nhận cập nhật Sự Kiện</h3>
            <p>Bạn có chắc muốn cập nhật sự kiện này không?</p>
            <div className="event-modal-buttons">
              <button
                onClick={confirmSubmit}
                className="event-modal-confirm"
                style={{
                  marginRight: "0.5rem",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="event-modal-cancel"
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thành công */}
      {isSuccessModalOpen && (
        <div
          className="event-success-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="event-success-modal-content"
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3>🎉 Thành công!</h3>
            <p>Sự kiện đã được cập nhật thành công.</p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="event-success-modal-button"
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      {isErrorModalOpen && (
        <div className="event-error-modal">
          <div className="event-error-modal-content">
            <h3>❌ Thất bại!</h3>
            <p>{errorMessage}</p>
            <button
              onClick={() => setIsErrorModalOpen(false)}
              className="event-error-modal-button"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditEvent;
