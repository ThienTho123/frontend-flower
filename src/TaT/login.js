// src/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      }}
    >
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          width: "300px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "24px",
            color: "#333",
          }}
        >
          Đăng Nhập
        </h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Tên người dùng:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Mật khẩu:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Đăng Nhập
          </button>
          {error && (
            <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
              {error}
            </p>
          )}
        </form>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3 style={{ marginBottom: "10px" }}>Quên mật khẩu?</h3>
          <button
            onClick={handleForgotPassword}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#007BFF",
              cursor: "pointer",
            }}
          >
            Nhấn vào đây
          </button>
        </div>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3 style={{ marginBottom: "10px" }}>Chưa có tài khoản?</h3>
          <button
            onClick={handleSignUp}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#007BFF",
              cursor: "pointer",
            }}
          >
            Đăng Ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
