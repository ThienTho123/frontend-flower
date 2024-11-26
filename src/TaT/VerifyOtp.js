import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); 
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (location.state && location.state.username) {
      setUsername(location.state.username); 
    }
  }, [location.state]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/verify-otp",
        { username, otp, newPassword },  
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
  
      setSuccess("Mật khẩu đã được đặt lại thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2>Xác Nhận Mã OTP</h2>
      <form onSubmit={handleVerifyOtp}>
        <div>
          <label>Mã OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mật khẩu mới:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Xác Nhận"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </form>
    </div>
  );
};

export default VerifyOtp;
