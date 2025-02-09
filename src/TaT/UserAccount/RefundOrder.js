import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
      setSuccess(true); // Hiển thị thông báo thành công

      // Điều hướng sau 3 giây
      setTimeout(() => {
        navigate("/account/history");
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data || "Có lỗi xảy ra.");
      setSuccess(false);
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

      <button onClick={handleRefund}>Gửi yêu cầu</button>

      {/* Hiển thị thông báo */}
      {success && (
        <div style={{ backgroundColor: "lightgreen", padding: "10px", marginTop: "10px" }}>
          <p>✅ Yêu cầu hoàn tiền đã được gửi thành công!</p>
          <p>Hệ thống sẽ chuyển hướng trong giây lát...</p>
        </div>
      )}

      {message && !success && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default RefundOrder;
