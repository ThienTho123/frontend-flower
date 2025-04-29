import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RefundOrDe = () => {
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
        `http://localhost:8080/userorde/${id}/refund`,
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
        navigate("/account/orde");
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
    <div>
      <h2>Yêu cầu hoàn tiền</h2>

      <label>
        Mã giao dịch:
        <input
          type="text"
          value={transactionNo}
          onChange={(e) => setTransactionNo(e.target.value)}
        />
      </label>

      <label>
        Ngân hàng:
        <select value={bank} onChange={(e) => setBank(e.target.value)}>
          <option value="">Chọn ngân hàng</option>
          {bankList.length > 0 ? (
            bankList.map((b) => (
              <option key={b.code} value={b.code}>
                {b.shortName ? `${b.shortName} - ${b.name}` : b.name}
              </option>
            ))
          ) : (
            <option disabled>Đang tải...</option>
          )}
        </select>
      </label>

      <label>
        Số tài khoản:
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </label>

      <button onClick={confirmRefund}>Gửi yêu cầu</button>

      {showConfirm && (
        <div className="modal">
          <div className="modal-content">
            <p>Hãy kiểm tra kỹ các thông tin trước khi gửi?</p>
            <button className="confirm-btn" onClick={handleRefund}>
              Xác nhận
            </button>
            <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <p>✅ Yêu cầu hoàn tiền đã được gửi thành công!</p>
            <p>Hệ thống sẽ chuyển hướng trong giây lát...</p>
            <button className="confirm-btn" onClick={() => setShowSuccessModal(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
      {message && !showSuccessModal && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default RefundOrDe;
