import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import RectangleVeri from "./UserAccount/Image/RectangleVeri.png"; // Đường dẫn ảnh

const VerifyOtp = () => {
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (location.state && location.state.username) {
      setUsername(location.state.username); // Lấy username từ state
    }
  }, [location.state]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://deploybackend-1ta9.onrender.com/api/v1/auth/verify-otp",
        { username, otp, newPassword }, // Gửi dữ liệu trong body của request
        {
          headers: {
            "Content-Type": "application/json",
          },
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "80%",
          maxWidth: "1000px",
          justifyContent: "space-between",
          height: "500px",
        }}
      >
        {/* Phần form xác nhận OTP */}
        <div
          style={{
            width: "50%",
            height: "84%",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "24px",
              color: "#E32C89",
              fontFamily: "Times New Roman, serif",
            }}
          >
            Xác Nhận Mã OTP
          </h2>
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Mã OTP:
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Mật khẩu mới:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#E32C89",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "Times New Roman, serif",
                fontSize: "18px",
                textAlign: "center",
              }}
            >
              {loading ? "Đang xử lý..." : "Xác Nhận"}
            </button>
            {error && (
              <p
                style={{
                  color: "red",
                  marginTop: "10px",
                  textAlign: "center",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                style={{
                  color: "green",
                  marginTop: "10px",
                  textAlign: "center",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                {success}
              </p>
            )}
          </form>
        </div>

        {/* Phần hình ảnh */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={RectangleVeri}
            alt="Verify OTP"
            style={{
              width: "100%",
              height: "100%", // Đảm bảo ảnh có cùng chiều cao với khung
              objectFit: "cover",
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
