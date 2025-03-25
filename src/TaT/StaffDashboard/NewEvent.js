import React, { useState, useEffect } from "react";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "./CreateEventForm.css"; 

const NewEvent = () => {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3788d8"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowerList, setFlowerList] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleAddFlower = (flowerData, isAllSize = false) => {
    const exists = selectedFlowers.some(
      (f) => f.flowerName === flowerData.flowerName && 
             (isAllSize || f.sizeIDChoose === flowerData.sizeIDChoose)
    );

    if (!exists) {
      const newFlowerEntry = {
        flowerName: flowerData.flowerName,
        sizeIDChoose: isAllSize ? -1 : flowerData.sizeIDChoose,
        sizeName: isAllSize ? "Tất cả kích thước" : flowerData.sizeName,
        saleOff: "0.00",
        flowerID: flowerData.flowerID,
        imageUrl: flowerData.imageUrl || flowerData.imageurl 
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
            eventFlowerDTOS: selectedFlowers.map(flower => ({
                flowerName: flower.flowerName,
                sizeIDChoose: flower.sizeIDChoose, 
                saleOff: parseFloat(flower.saleOff),
                flowerID: flower.flowerID
            }))
        };

        await axios.post("http://localhost:8080/api/v1/staff/event", eventData, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        setIsModalOpen(false);
        setIsSuccessModalOpen(true);
        resetForm();
    } catch (error) {
        setIsModalOpen(false);
        setErrorMessage(error.response?.data || "Có lỗi xảy ra khi tạo sự kiện!");
        setIsErrorModalOpen(true);
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
    // Kiểm tra nếu dateString rỗng hoặc không hợp lệ
    if (!dateString) {
      return []; // Trả về mảng rỗng nếu không có ngày
    }
  
    const date = new Date(dateString);
  
    // Kiểm tra xem ngày có hợp lệ không
    if (isNaN(date.getTime())) {
      return []; // Trả về mảng rỗng nếu ngày không hợp lệ
    }
  
    return [
      date.getFullYear(),     // Năm
      date.getMonth() + 1,    // Tháng (do được đánh số từ 0 nên cộng thêm 1)
      date.getDate(),         // Ngày
      date.getHours(),        // Giờ
      date.getMinutes(),      // Phút
      date.getSeconds() || 0  // Giây (mặc định là 0 nếu không được cung cấp)
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
            <div className="flower-item-header">
              <img 
                src={flower.imageurl} 
                alt={flower.flowerName} 
                className="flower-image"
                style={{
                  width: '100%', 
                  height: '150px', 
                  objectFit: 'cover', 
                  borderRadius: '6px',
                  marginBottom: '10px'
                }} 
              />
              <h4>{flower.flowerName}</h4>
            </div>
            <div className="size-options">
              <button
                type="button"
                className="size-button all-size-button"
                onClick={() => handleAddFlower({
                  flowerName: flower.flowerName,
                  flowerID: flower.flowerID,
                  imageUrl: flower.imageurl
                }, true)}
              >
                All Sizes
              </button>
              {flower.size?.map((size, sizeIndex) => (
                <button
                  key={sizeIndex}
                  type="button"
                  className="size-button"
                  onClick={() => handleAddFlower({
                    flowerName: flower.flowerName,
                    sizeIDChoose: size.flowerSizeID,
                    sizeName: size.sizeName,
                    flowerID: flower.flowerID,
                    imageUrl: flower.imageurl
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
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'cover', 
                        borderRadius: '4px'
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
    className="event-success-modal"
  >
    <div className="event-success-modal-content">
      <h3>🎉 Thành công!</h3>
      <p>Sự kiện đã được tạo thành công.</p>
      <button
        onClick={() => setIsSuccessModalOpen(false)}
        className="event-success-modal-button"
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

export default NewEvent;