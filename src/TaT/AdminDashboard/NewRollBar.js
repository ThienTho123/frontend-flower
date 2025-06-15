import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "./RollBarForm.css"; // Bạn cần tạo CSS cho form này

const NewRollBar = () => {
  const [rollBarName, setRollBarName] = useState("");
  const [color, setColor] = useState("#3788d8");
  const [days, setDays] = useState(7);
  const [status, setStatus] = useState("ENABLE");
  const [gifts, setGifts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [flowerList, setFlowerList] = useState([]);
  const [flowerInfos, setFlowerInfos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const navigate = useNavigate();

  useBootstrap();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      // Gọi API để lấy dữ liệu hoa, categories, types và purposes
      // Sử dụng endpoint chính thay vì /new
      const response = await axios.get(
        "https://deploybackend-j61h.onrender.com/adminrollbar",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Xử lý dữ liệu từ API trả về
      if (
        response.data &&
        response.data.rollBarList &&
        response.data.rollBarList.length > 0
      ) {
        const firstRollBar = response.data.rollBarList[0];
        setFlowerList(firstRollBar.flowers || []);
        setFlowerInfos(firstRollBar.flowerInfos || []);
        setCategories(response.data.categories || []);
        setTypes(response.data.types || []);
        setPurposes(response.data.purposes || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setIsErrorModalOpen(true);
    }
  };

  const handleAddGift = () => {
    const newGift = {
      id: Date.now(), // Tạo ID tạm thời cho frontend
      name: "",
      typegift: "flower", // Giá trị mặc định
      description: "",
      percent: 10, // Tỉ lệ mặc định
      status: "ENABLE",
      flowersizeid: null,
      categoryid: null,
      typeid: null,
      purposeid: null,
      discountpercent: 0,
      timeend: null,
    };
    setGifts([...gifts, newGift]);
  };

  const handleRemoveGift = (index) => {
    const newGifts = [...gifts];
    newGifts.splice(index, 1);
    setGifts(newGifts);
  };

  const handleGiftChange = (index, field, value) => {
    const newGifts = [...gifts];
    newGifts[index][field] = value;
    setGifts(newGifts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rollBarName.trim() || days <= 0) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin hợp lệ!");
      setIsErrorModalOpen(true);
      return;
    }

    if (gifts.length === 0) {
      setErrorMessage("Vui lòng thêm ít nhất một giải thưởng!");
      setIsErrorModalOpen(true);
      return;
    }

    // Kiểm tra tổng tỉ lệ của các giải thưởng
    const totalPercent = gifts.reduce(
      (sum, gift) => sum + parseFloat(gift.percent || 0),
      0
    );
    if (totalPercent !== 100) {
      setErrorMessage(
        `Tổng tỉ lệ giải thưởng phải bằng 100%. Hiện tại: ${totalPercent}%`
      );
      setIsErrorModalOpen(true);
      return;
    }

    // Kiểm tra các giải thưởng có đủ thông tin không
    const invalidGifts = gifts.filter(
      (gift) => !gift.name.trim() || gift.percent <= 0
    );
    if (invalidGifts.length > 0) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin cho tất cả giải thưởng!");
      setIsErrorModalOpen(true);
      return;
    }

    setIsModalOpen(true);
  };

  const confirmSubmit = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const rollBarData = {
        name: rollBarName,
        color: color,
        days: parseInt(days),
        status: status,
        giftInfoDTOStaffList: gifts.map((gift) => ({
          name: gift.name,
          typegift: gift.typegift,
          description: gift.description,
          percent: parseFloat(gift.percent),
          status: gift.status,
          flowersizeid: gift.flowersizeid,
          categoryid: gift.categoryid,
          typeid: gift.typeid,
          purposeid: gift.purposeid,
          discountpercent:
            gift.typegift === "DISCOUNT"
              ? parseFloat(gift.discountpercent)
              : null,
          timeend:
            gift.typegift === "DISCOUNT"
              ? formatDateToLocalDateTime(gift.timeend)
              : null,
        })),
      };

      await axios.post(
        "https://deploybackend-j61h.onrender.com/adminrollbar",
        rollBarData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      resetForm();
    } catch (error) {
      setIsModalOpen(false);
      setErrorMessage(
        error.response?.data || "Có lỗi xảy ra khi tạo Roll Bar!"
      );
      setIsErrorModalOpen(true);
    }
  };

  const resetForm = () => {
    setRollBarName("");
    setColor("#3788d8");
    setDays(7);
    setStatus("ENABLE");
    setGifts([]);
  };

  // Hàm chuyển đổi định dạng ngày giờ từ input datetime-local sang định dạng LocalDateTime của Java
  const formatDateToLocalDateTime = (dateString) => {
    if (!dateString) {
      return null;
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return null;
    }

    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds() || 0,
    ];
  };

  const handleBackToList = () => {
    navigate("/AdminRollBar");
  };

  return (
    <div className="rollbar-form-container">
      <h2 className="rollbar-form-title">Tạo Roll Bar Mới</h2>
      <button onClick={handleBackToList} className="back-button">
        Quay lại danh sách
      </button>

      <div className="rollbar-form-group">
        <label>Tên Roll Bar:</label>
        <input
          type="text"
          className="rollbar-form-input"
          placeholder="Nhập tên Roll Bar"
          value={rollBarName}
          onChange={(e) => setRollBarName(e.target.value)}
        />
      </div>

      <div className="rollbar-form-group">
        <label>Màu Sắc:</label>
        <input
          type="color"
          className="rollbar-form-color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <span className="color-value">{color}</span>
      </div>

      <div className="rollbar-form-group">
        <label>Số ngày điểm danh yêu cầu:</label>
        <input
          type="number"
          className="rollbar-form-input"
          min="1"
          placeholder="Nhập số ngày"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
      </div>

      <div className="rollbar-form-group">
        <label>Trạng thái:</label>
        <select
          className="rollbar-form-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ENABLE">Kích hoạt</option>
          <option value="DISABLE">Vô hiệu hóa</option>
        </select>
      </div>

      <h3 className="rollbar-form-subtitle">Quản lý Giải thưởng</h3>
      <button type="button" onClick={handleAddGift} className="add-gift-button">
        Thêm Giải thưởng
      </button>

      {gifts.length === 0 ? (
        <p>Chưa có giải thưởng nào được thêm</p>
      ) : (
        <div className="gifts-container">
          {gifts.map((gift, index) => (
            <div key={gift.id} className="gift-item">
              <h4>Giải thưởng #{index + 1}</h4>

              <div className="gift-form-group">
                <label>Tên giải thưởng:</label>
                <input
                  type="text"
                  value={gift.name}
                  onChange={(e) =>
                    handleGiftChange(index, "name", e.target.value)
                  }
                  placeholder="Nhập tên giải thưởng"
                  className="gift-input"
                />
              </div>

              <div className="gift-form-group">
                <label>Loại giải thưởng:</label>
                <select
                  value={gift.typegift}
                  onChange={(e) =>
                    handleGiftChange(index, "typegift", e.target.value)
                  }
                  className="gift-select"
                >
                  <option value="flower">Hoa</option>
                  <option value="discount">Giảm giá</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="gift-form-group">
                <label>Mô tả:</label>
                <textarea
                  value={gift.description}
                  onChange={(e) =>
                    handleGiftChange(index, "description", e.target.value)
                  }
                  placeholder="Nhập mô tả giải thưởng"
                  className="gift-textarea"
                />
              </div>

              <div className="gift-form-group">
                <label>Tỉ lệ (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={gift.percent}
                  onChange={(e) =>
                    handleGiftChange(index, "percent", e.target.value)
                  }
                  className="gift-input"
                />
              </div>

              {gift.typegift === "flower" && (
                <div className="gift-form-group">
                  <label>Chọn Hoa:</label>
                  <select
                    value={gift.flowersizeid || ""}
                    onChange={(e) =>
                      handleGiftChange(
                        index,
                        "flowersizeid",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="gift-select"
                  >
                    <option value="">Chọn kích thước hoa</option>
                    {flowerInfos.map((flowerInfo) =>
                      flowerInfo.flowerSizeDTOS?.map((size) => (
                        <option
                          key={size.flowerSizeID}
                          value={size.flowerSizeID}
                        >
                          {flowerInfo.name} - {size.sizeName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {gift.typegift === "discount" && (
                <>
                  <div className="gift-form-group">
                    <label>Phần trăm giảm giá (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={gift.discountpercent}
                      onChange={(e) =>
                        handleGiftChange(
                          index,
                          "discountpercent",
                          e.target.value
                        )
                      }
                      className="gift-input"
                    />
                  </div>

                  <div className="gift-form-group">
                    <label>Thời gian kết thúc:</label>
                    <input
                      type="datetime-local"
                      value={gift.timeend}
                      onChange={(e) =>
                        handleGiftChange(index, "timeend", e.target.value)
                      }
                      className="gift-input"
                    />
                  </div>

                  <div className="gift-form-row">
                    <div className="gift-form-group">
                      <label>Chọn loại:</label>
                      <select
                        value={gift.typeid || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value)
                            : null;
                          handleGiftChange(index, "typeid", value);
                          // Nếu chọn loại, reset danh mục và mục đích
                          if (value) {
                            handleGiftChange(index, "categoryid", null);
                            handleGiftChange(index, "purposeid", null);
                          }
                        }}
                        className="gift-select"
                        disabled={
                          gift.categoryid || gift.purposeid ? true : false
                        }
                      >
                        <option value="">Không chọn</option>
                        {types.map((type) => (
                          <option key={type.typeID} value={type.typeID}>
                            {type.typeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="gift-form-group">
                      <label>Chọn danh mục:</label>
                      <select
                        value={gift.categoryid || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value)
                            : null;
                          handleGiftChange(index, "categoryid", value);
                          // Nếu chọn danh mục, reset loại và mục đích
                          if (value) {
                            handleGiftChange(index, "typeid", null);
                            handleGiftChange(index, "purposeid", null);
                          }
                        }}
                        className="gift-select"
                        disabled={gift.typeid || gift.purposeid ? true : false}
                      >
                        <option value="">Không chọn</option>
                        {categories.map((category) => (
                          <option
                            key={category.categoryID}
                            value={category.categoryID}
                          >
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="gift-form-group">
                      <label>Chọn mục đích:</label>
                      <select
                        value={gift.purposeid || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value)
                            : null;
                          handleGiftChange(index, "purposeid", value);
                          // Nếu chọn mục đích, reset loại và danh mục
                          if (value) {
                            handleGiftChange(index, "typeid", null);
                            handleGiftChange(index, "categoryid", null);
                          }
                        }}
                        className="gift-select"
                        disabled={gift.typeid || gift.categoryid ? true : false}
                      >
                        <option value="">Không chọn</option>
                        {purposes.map((purpose) => (
                          <option
                            key={purpose.purposeID}
                            value={purpose.purposeID}
                          >
                            {purpose.purposeName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="gift-form-group">
                <label>Trạng thái:</label>
                <select
                  value={gift.status}
                  onChange={(e) =>
                    handleGiftChange(index, "status", e.target.value)
                  }
                  className="gift-select"
                >
                  <option value="ENABLE">Kích hoạt</option>
                  <option value="DISABLE">Vô hiệu hóa</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveGift(index)}
                className="remove-gift-button"
              >
                Xóa Giải thưởng
              </button>
            </div>
          ))}

          <div className="total-percent">
            Tổng tỉ lệ:{" "}
            {gifts.reduce(
              (sum, gift) => sum + parseFloat(gift.percent || 0),
              0
            )}
            %
            {gifts.reduce(
              (sum, gift) => sum + parseFloat(gift.percent || 0),
              0
            ) !== 100 && (
              <span className="percent-warning"> (Phải bằng 100%)</span>
            )}
          </div>
        </div>
      )}

      <button onClick={handleSubmit} className="rollbar-form-submit-button">
        Tạo Roll Bar
      </button>

      {/* Modal xác nhận */}
      {isModalOpen && (
        <div className="rollbar-modal">
          <div className="rollbar-modal-content">
            <h3>Xác nhận tạo Roll Bar</h3>
            <p>Bạn có chắc muốn tạo Roll Bar này không?</p>
            <div className="rollbar-modal-buttons">
              <button onClick={confirmSubmit} className="rollbar-modal-confirm">
                Xác nhận
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rollbar-modal-cancel"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thành công */}
      {isSuccessModalOpen && (
        <div className="rollbar-success-modal">
          <div className="rollbar-success-modal-content">
            <h3>🎉 Thành công!</h3>
            <p>Roll Bar đã được tạo thành công.</p>
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate("/AdminRollBar");
              }}
              className="rollbar-success-modal-button"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Modal lỗi */}
      {isErrorModalOpen && (
        <div className="rollbar-error-modal">
          <div className="rollbar-error-modal-content">
            <h3>❌ Thất bại!</h3>
            <p>{errorMessage}</p>
            <button
              onClick={() => setIsErrorModalOpen(false)}
              className="rollbar-error-modal-button"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRollBar;
