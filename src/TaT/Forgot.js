import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    console.log(username);
    
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/forgot-password",
        { username },  // Send the username in the request body
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      setSuccess("Mã OTP đã được gửi đến email của bạn!");
      setTimeout(() => {
        navigate("/verify-otp", { state: { username } });
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", width: "300px", backgroundColor: "#f9f9f9" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", color: "#333" }}>Quên mật khẩu</h2>
        <form onSubmit={handleForgotPassword}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Tên đăng nhập:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
          {error && <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>{error}</p>}
          {success && <p style={{ color: "green", marginTop: "10px", textAlign: "center" }}>{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
