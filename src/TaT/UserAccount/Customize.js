import React, { useState } from "react";
import axios from "axios";
import "./Customize.css";

function CustomizeForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    description: "",
    purpose: "",
    sentence: "",
    number: 1,
  });

  const [confirmModal, setConfirmModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      note: "",
      description: "",
      purpose: "",
      sentence: "",
      number: 1,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.name.length < 2 ||
      formData.phone.length < 9 ||
      formData.address.length < 2
    ) {
      setModalMessage(
        "Vui lòng nhập đúng định dạng: tên >= 2 ký tự, sđt >= 9, địa chỉ >= 2."
      );
      setResultModal(true);
      return;
    }

    setConfirmModal(true);
  };

  const confirmAndSend = async () => {
    setConfirmModal(false);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "https://deploybackend-1ta9.onrender.com/customize/customize",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setModalMessage("Gửi thành công!");
      setResultModal(true);
      resetForm();
    } catch (error) {
      console.error(error);
      setModalMessage("Gửi thất bại!");
      setResultModal(true);
    }
  };

  return (
    <div className="customize-container">
      <h2 className="form-title">Nhập thông tin</h2>
      <form className="customize-form" onSubmit={handleSubmit}>
        {/* Các input */}
        <div className="form-group name-group">
          <label className="form-label">Họ tên:</label>
          <input
            className="form-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group phone-group">
          <label className="form-label">SĐT:</label>
          <input
            className="form-input"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group address-group">
          <label className="form-label">Địa chỉ:</label>
          <input
            className="form-input"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group note-group">
          <label className="form-label">Ghi chú:</label>
          <input
            className="form-input"
            type="text"
            name="note"
            value={formData.note}
            onChange={handleChange}
          />
        </div>

        <h3 className="section-title">Mô tả</h3>

        <div className="form-group description-group">
          <label className="form-label">Mô tả:</label>
          <textarea
            className="form-textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group purpose-group">
          <label className="form-label">Mục đích:</label>
          <textarea
            className="form-textarea"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group sentence-group">
          <label className="form-label">Lời nhắn:</label>
          <textarea
            className="form-textarea"
            name="sentence"
            value={formData.sentence}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group number-group">
          <label className="form-label">Số lượng:</label>
          <input
            className="form-input"
            type="number"
            name="number"
            min="1"
            value={formData.number}
            onChange={handleChange}
          />
        </div>

        <button className="submit-button" type="submit">
          Gửi
        </button>
      </form>

      {/* Modal xác nhận */}
      {confirmModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <p>Bạn có chắc chắn muốn gửi không?</p>
            <div className="modal-buttons">
              <button className="modal-confirm-button" onClick={confirmAndSend}>
                Xác nhận
              </button>
              <button
                className="close-modal-button"
                onClick={() => setConfirmModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal kết quả */}
      {resultModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <p>{modalMessage}</p>
            <button
              className="close-modal-button"
              onClick={() => setResultModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomizeForm;
