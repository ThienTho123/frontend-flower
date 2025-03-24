import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "./CreateEventForm.css";

const EditEvent = () => {
  const { id } = useParams();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3788d8");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allFlowers, setAllFlowers] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  useBootstrap();

  useEffect(() => {
    fetchEventDetails();
    fetchFlowers();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/staff/event/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const eventData = response.data.Event;
      if (eventData) {
        setEventName(eventData.name);
        setDescription(eventData.description);
        setColor(eventData.color);
        
        // Chuyển đổi mảng ngày tháng từ backend thành dạng datetime-local
        if (Array.isArray(eventData.start) && eventData.start.length >= 6) {
          const startDateString = formatDateArrayToString(eventData.start);
          setStartDate(startDateString);
        }
        
        if (Array.isArray(eventData.end) && eventData.end.length >= 6) {
          const endDateString = formatDateArrayToString(eventData.end);
          setEndDate(endDateString);
        }
      }

      const eventFlowers = response.data.EventFlower || [];
      setSelectedFlowers(eventFlowers.map(flower => ({
        idEventFlower: flower.idEventFlower,
        flowerName: flower.flowerName,
        sizeIDChoose: getSelectedSizeId(flower),
        sizeName: flower.sizeChoose,
        saleOff: flower.saleOff || "0.00",
        size: flower.size || []
      })));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setLoading(false);
    }
  };

  // Hàm lấy ID của size được chọn
  const getSelectedSizeId = (flower) => {
    if (!flower.size) return null;
    const selectedSize = flower.size.find(s => s.sizeName === flower.sizeChoose);
    return selectedSize ? selectedSize.flowerSizeID : null;
  };

  const fetchFlowers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/staff/event/getflowersize",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setAllFlowers(response.data.AllFlower || []);
    } catch (error) {
      console.error("Error fetching flowers:", error);
    }
  };

  // Chuyển đổi mảng ngày tháng sang chuỗi datetime-local
  const formatDateArrayToString = (dateArray) => {
    const [year, month, day, hour, minute, second] = dateArray;
    // Định dạng tháng và ngày để đảm bảo có 2 chữ số
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(minute).padStart(2, '0');
    
    // Định dạng chuỗi datetime-local: YYYY-MM-DDThh:mm
    return `${year}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}`;
  };

  // Chuyển đổi chuỗi datetime-local sang mảng ngày tháng
  const formatDateToLocalDateTime = (dateString) => {
    const date = new Date(dateString);
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ];
  };

  const handleAddFlower = (flowerData) => {
    // Kiểm tra nếu hoa đã được chọn với size đó
    const exists = selectedFlowers.some(
      (f) => f.flowerName === flowerData.flowerName && f.sizeIDChoose === flowerData.sizeIDChoose
    );

    if (!exists) {
      setSelectedFlowers([...selectedFlowers, {
        flowerName: flowerData.flowerName,
        sizeIDChoose: flowerData.sizeIDChoose,
        sizeName: flowerData.sizeName,
        saleOff: "0.00", // Giá trị mặc định
      }]);
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
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }

    setIsModalOpen(true);
  };

  const confirmSubmit = async () => {
    try {
      const eventData = {
        eventName: eventName,
        description: description,
        color: color,
        start: formatDateToLocalDateTime(startDate),
        end: formatDateToLocalDateTime(endDate),
        eventFlowerDTOS: selectedFlowers.map(flower => ({
          idEventFlower: flower.idEventFlower, // Giữ ID nếu là cập nhật
          flowerName: flower.flowerName,
          sizeIDChoose: flower.sizeIDChoose,
          saleOff: parseFloat(flower.saleOff)
        }))
      };

      const response = await axios.put(
        `http://localhost:8080/api/v1/staff/event/${id}`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error updating event:", error);
      setIsModalOpen(false);
      alert("Có lỗi xảy ra khi cập nhật sự kiện!");
    }
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="event-form-container">
      <h2 className="event-form-title">Chỉnh Sửa Sự Kiện</h2>

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
        {allFlowers.map((flower, flowerIndex) => (
          <div key={flowerIndex} className="flower-item">
            <h4>{flower.flowerName}</h4>
            <div className="size-options">
              {flower.size?.map((size, sizeIndex) => (
                <button
                  key={sizeIndex}
                  type="button"
                  className="size-button"
                  onClick={() => handleAddFlower({
                    flowerName: flower.flowerName,
                    sizeIDChoose: size.flowerSizeID,
                    sizeName: size.sizeName
                  })}
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
                <th>Tên Hoa</th>
                <th>Kích Thước</th>
                <th>Giảm Giá (%)</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {selectedFlowers.map((flower, index) => (
                <tr key={index}>
                  <td>{flower.flowerName}</td>
                  <td>{flower.sizeName}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={flower.saleOff}
                      onChange={(e) => handleSaleOffChange(index, e.target.value)}
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
        <div className="event-modal">
          <div className="event-modal-content">
            <h3>Xác nhận cập nhật Sự Kiện</h3>
            <p>Bạn có chắc muốn cập nhật sự kiện này không?</p>
            <div className="event-modal-buttons">
              <button
                onClick={confirmSubmit}
                className="event-modal-confirm"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="event-modal-cancel"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thành công */}
      {isSuccessModalOpen && (
        <div className="success-modal">
          <div className="success-modal-content">
            <h3>🎉 Thành công!</h3>
            <p>Sự kiện đã được cập nhật thành công.</p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="success-modal-button"
            >
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEvent;