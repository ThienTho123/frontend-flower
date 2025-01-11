import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RectangleLogin from "./UserAccount/Image/RectangleLogin.png"; 
import { useGoogleLogin } from "@react-oauth/google";

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
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log("Google login response:", response);
  
        const accessToken = response?.access_token;
  
        if (!accessToken) {
          console.error("Access Token is missing.");
          return;
        }
  
        console.log("Access Token:", accessToken);
  
        // Gọi Google User Info API
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
  
        console.log("User Info:", userInfoResponse.data);
  
        // Chuẩn bị dữ liệu GoogleTokenRequest
        const googleTokenRequest = {
          email: userInfoResponse.data.email,
          name: userInfoResponse.data.name,
          picture: userInfoResponse.data.picture,
        };
  
        console.log("GoogleTokenRequest:", googleTokenRequest);
  
        // Gửi thông tin tới backend để xử lý
        const backendResponse = await axios.post(
          "http://localhost:8080/api/v1/auth/viagoogle",
          googleTokenRequest,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        const { access_token, refresh_token, idAccount } = backendResponse.data || {};
        if (!access_token || !refresh_token || !idAccount) {
          console.error("Missing tokens in backend response:", backendResponse.data);
          setError("Phản hồi từ server không hợp lệ.");
          return;
        }
        
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("accountID", idAccount);
        
        // Set timeout for token removal
        setTimeout(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("accountID");
          console.log("Tokens have been cleared from localStorage after 1 day.");
        }, 86400000);
        
        localStorage.setItem("loginTime", Date.now());
        navigate("/");
        
      } catch (err) {
        console.error("Google login failed:", err);
        setError("Đăng nhập với Google không thành công.");
      }
    },
  
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Đăng nhập với Google không thành công.");
    },
    scope: "openid profile email", // Ensure you request openid, profile, and email scopes
  });
  
  
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
            <button
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: "#4285F4",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "18px",
            }}
          >
            Đăng nhập bằng Google
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
