import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RectangleForgot from "./UserAccount/Image/RectangleForgot.png"; // Đường dẫn hình ảnh

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
        "https://deploybackend-j61h.onrender.com/api/v1/auth/forgot-password",
        { username }, // Send the username in the request body
        {
          headers: {
            "Content-Type": "application/json",
          },
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
        {/* Phần form quên mật khẩu */}
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
            Quên mật khẩu
          </h2>
          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Tên đăng nhập:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
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
            src={RectangleForgot}
            alt="Forgot Password"
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

export default ForgotPassword;
