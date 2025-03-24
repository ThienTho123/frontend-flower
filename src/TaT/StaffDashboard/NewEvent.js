import React, { useState, useEffect } from "react";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "./CreateEventForm.css"; 

const NewEvent = () => {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3788d8"); // Màu mặc định
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowerList, setFlowerList] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  useBootstrap();

  useEffect(() => {
    fetchFlowers();
  }, []);

  const fetchFlowers = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://localhost:8080/api/v1/staff/event/getflowersize",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setFlowerList(response.data.AllFlower || []);
    } catch (error) {
      console.error("Error fetching flowers:", error);
    }
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
      const accessToken = localStorage.getItem("access_token");
      
      // Tạo đối tượng event với ID = 0 (hoặc để trống)
      const eventData = {
        // Bỏ dòng id: 0 đi
        eventName: eventName,
        description: description,
        color: color,
        start: formatDateToLocalDateTime(startDate),
        end: formatDateToLocalDateTime(endDate),
        eventFlowerDTOS: selectedFlowers.map(flower => ({
          // Bỏ dòng idEventFlower: 0 đi
          flowerName: flower.flowerName,
          sizeIDChoose: flower.sizeIDChoose,
          saleOff: parseFloat(flower.saleOff)
        }))
      };
  
      const response = await axios.post(
        "http://localhost:8080/api/v1/staff/event",
        eventData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      resetForm();
    } catch (error) {
      console.error("Error creating event:", error);
      setIsModalOpen(false);
      alert("Có lỗi xảy ra khi tạo sự kiện!");
    }
  };

  const resetForm = () => {
    setEventName("");
    setDescription("");
    setColor("#3788d8");
    setStartDate("");
    setEndDate("");
    setSelectedFlowers([]);
  };

  // Hàm chuyển đổi định dạng ngày giờ từ input datetime-local sang định dạng LocalDateTime của Java
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

  return (
    <div className="event-form-container">
      <h2 className="event-form-title">Tạo Sự Kiện Mới</h2>

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
        Tạo Sự Kiện
      </button>

      {/* Modal xác nhận */}
      {/* Modal xác nhận */}
{isModalOpen && (
  <div 
    className="event-modal"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}
  >
    <div 
      className="event-modal-content"
      style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <h3>Xác nhận tạo Sự Kiện</h3>
      <p>Bạn có chắc muốn tạo sự kiện này không?</p>
      <div className="event-modal-buttons">
        <button
          onClick={confirmSubmit}
          className="event-modal-confirm"
          style={{
            marginRight: '0.5rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Xác nhận
        </button>
        <button
          onClick={() => setIsModalOpen(false)}
          className="event-modal-cancel"
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Hủy
        </button>
      </div>
    </div>
  </div>
)}

      {/* Modal thành công */}
      {/* Modal thành công - sửa lại để căn giữa */}
{isSuccessModalOpen && (
  <div 
    className="success-modal"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}
  >
    <div 
      className="success-modal-content"
      style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <h3>🎉 Thành công!</h3>
      <p>Sự kiện đã được tạo thành công.</p>
      <button
        onClick={() => setIsSuccessModalOpen(false)}
        className="success-modal-button"
        style={{
          marginTop: '1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Đóng
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default NewEvent;