import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import './RefundPages.css';

const RefundOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook để điều hướng trang
  const access_token = localStorage.getItem("access_token");

  const [transactionNo, setTransactionNo] = useState("");
  const [bank, setBank] = useState("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false); // Trạng thái hiển thị thông báo thành công
  const [bankList, setBankList] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchBankList = async () => {
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks");
        const data = await response.json();
        setBankList(data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ngân hàng:", error);
        setBankList([]);
      }
    };

    fetchBankList();
  }, []);

  const handleRefund = async () => {
    setShowConfirm(false);
    try {
      const response = await axios.post(
        `http://localhost:8080/account/order/${id}/refund`,
        {
          vnp_TransactionNo: transactionNo,
          bank,
          number,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(response.data);
      setShowSuccessModal(true);

      // Điều hướng sau 3 giây
      setTimeout(() => {
        navigate("/account/history");
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data || "Có lỗi xảy ra.");
      setShowSuccessModal(false);
    }
  };
  const confirmRefund = () => {
    setShowConfirm(true);
  };
return (
  <div className="refund-page-container">
    <h2 className="refund-title">Yêu cầu hoàn tiền</h2>
    
    <div className="refund-form-wrapper">
      <div className="refund-form-group">
        <label className="refund-label">Mã thanh toán:</label>
        <input
          className="refund-input"
          type="text"
          value={transactionNo}
          onChange={(e) => setTransactionNo(e.target.value)}
          placeholder="Nhập mã giao dịch"
        />
      </div>

      <div className="refund-form-group">
        <label className="refund-label">Ngân hàng:</label>
        <select className="refund-select" value={bank} onChange={(e) => setBank(e.target.value)}>
          <option value="">Chọn ngân hàng</option>
          {bankList.length > 0 ? (
            bankList.map((b) => (
              <option key={b.code} value={b.code}>
                {b.shortName ? `${b.name} - ${b.shortName}` : b.name}
              </option>
            ))
          ) : (
            <option disabled>Đang tải...</option>
          )}
        </select>
      </div>

      <div className="refund-form-group">
        <label className="refund-label">Số tài khoản:</label>
        <input
          className="refund-input"
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Nhập số tài khoản"
        />
      </div>

      <button className="refund-submit-btn" onClick={confirmRefund}>
        Gửi yêu cầu
      </button>
    </div>

    {/* Modal xác nhận */}
    {showConfirm && (
      <div className="refund-modal-overlay">
        <div className="refund-modal-content">
          <p className="refund-modal-text">Hãy kiểm tra kỹ các thông tin trước khi gửi?</p>
          <div className="refund-modal-buttons">
            <button className="refund-confirm-btn" onClick={handleRefund}>
              Xác nhận
            </button>
            <button className="refund-cancel-btn" onClick={() => setShowConfirm(false)}>
              Hủy
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal thành công */}
    {showSuccessModal && (
      <div className="refund-modal-overlay refund-success-modal">
        <div className="refund-modal-content">
          <p className="refund-modal-text">✅ Yêu cầu hoàn tiền đã được gửi thành công!</p>
          <p className="refund-modal-text">Hệ thống sẽ chuyển hướng trong giây lát...</p>
          <div className="refund-modal-buttons">
            <button className="refund-confirm-btn" onClick={() => setShowSuccessModal(false)}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Thông báo lỗi */}
    {message && !showSuccessModal && (
      <div className="refund-error-message">{message}</div>
    )}
  </div>
);
};

export default RefundOrder;
