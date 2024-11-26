import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RectangleLogin from "./UserAccount/Image/RectangleLogin.png"; 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/authenticate",
        {
          username,
          password,
        }
      );

      const { access_token, refresh_token, idAccount } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("accountID", idAccount);

      setTimeout(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("accountID");
        console.log("Tokens have been cleared from localStorage after 1 day.");
      }, 86400000);
      localStorage.setItem("loginTime", Date.now());

      navigate("/");
    } catch (err) {
      setError("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
      console.error(err);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        padding: "20px",
        fontFamily: "'Times New Roman', Times, serif", 
      }}
    >
      <div
        style={{
          display: "flex",
          width: "80%",
          maxWidth: "900px", 
          justifyContent: "space-between",
          height: "600px", 
          marginBottom:"90px",
        }}
      >
        <div
          style={{
            width: "50%", 
            padding: "40px", 
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9f9f9",
            fontFamily: "'Times New Roman', Times, serif", 
            fontSize: "20px", 
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "30px", 
              fontSize: "28px",
              color: "#E32C89", 
            }}
          >
            Đăng Nhập
          </h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}> 
              <label style={{ display: "block", marginBottom: "10px" }}>
                Tên người dùng:
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
                  fontFamily: "'Times New Roman', Times, serif", 
                  fontSize: "16px", 
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}> 
              <label style={{ display: "block", marginBottom: "10px" }}>
                Mật khẩu:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px", 
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontFamily: "'Times New Roman', Times, serif", 
                  fontSize: "16px", 
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "15px", 
                backgroundColor: "#E32C89", 
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "'Times New Roman', Times, serif", 
                fontSize: "18px", 
              }}
            >
              Đăng Nhập
            </button>
            {error && (
              <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>
                {error}
              </p>
            )}
          </form>
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <h3 style={{ marginBottom: "15px" }}>Quên mật khẩu?</h3>
            <button
              onClick={handleForgotPassword}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#E32C89", 
                cursor: "pointer",
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: "19px", 
              }}
            >
              Nhấn vào đây
            </button>
          </div>
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <h3 style={{ marginBottom: "15px" }}>Chưa có tài khoản?</h3>
            <button
              onClick={handleSignUp}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#E32C89", 
                cursor: "pointer",
                fontFamily: "'Times New Roman', Times, serif", 
                fontSize: "16px", 
              }}
            >
              Đăng Ký
            </button>
          </div>
        </div>
        <div style={{ width: "55%", height: "100%" }}>
          <img
            src={RectangleLogin}
            alt="Rectangle Login"
            style={{
              width: "100%",
              height: "100%", 
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

export default Login;
