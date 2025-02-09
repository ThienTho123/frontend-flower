import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RefundPreorder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token");

  const [transactionNo, setTransactionNo] = useState("");
  const [bank, setBank] = useState("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bankList, setBankList] = useState([]);

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

  const confirmRefund = () => {
    setShowConfirm(true);
  };

  const handleRefund = async () => {
    setShowConfirm(false);
    try {
      const response = await axios.post(
        `http://localhost:8080/account/preorder/${id}/refund`,
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

      setTimeout(() => {
        navigate("/account/preorder");
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data || "Có lỗi xảy ra.");
      setShowSuccessModal(false);
    }
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
                {b.shortName ? `${b.name} - ${b.shortName}` : b.name}
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

      {/* Hộp thoại xác nhận */}
      {showConfirm && (
        <div className="modal">
          <div className="modal-content">
            <p>Bạn có chắc chắn muốn gửi yêu cầu hoàn tiền không?</p>
            <button className="confirm-btn" onClick={handleRefund}>
              Xác nhận
            </button>
            <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Hộp thoại thành công */}
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

      {/* Hiển thị thông báo lỗi nếu có */}
      {message && !showSuccessModal && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default RefundPreorder;
