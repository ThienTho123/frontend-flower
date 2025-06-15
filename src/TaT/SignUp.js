import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import RectangleRegister from "./UserAccount/Image/RectangleRegister.png"; // Đường dẫn hình ảnh
import { useEffect } from "react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      setFormData((prev) => ({ ...prev, email: emailFromQuery }));
    }
  }, [location]);

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Xóa lỗi cũ
    setErrors({});

    // Kiểm tra lỗi frontend
    const newErrors = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = "Tên người dùng phải có ít nhất 2 ký tự.";
    }
    if (
      formData.username.trim().length < 2 ||
      formData.username.trim().length > 45
    ) {
      newErrors.username = "Tên đăng nhập phải có từ 2 đến 45 ký tự.";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng.";
    }
    if (formData.phoneNumber.length < 8) {
      newErrors.phoneNumber = "Số điện thoại phải có ít nhất 8 ký tự.";
    }
    if (formData.address.trim().length < 2) {
      newErrors.address = "Địa chỉ phải có ít nhất 2 ký tự.";
    }

    // Nếu có lỗi, hiển thị lỗi và dừng submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post(
        "https://deploybackend-j61h.onrender.com/api/v1/auth/register",
        formData
      );
      console.log("User registered:", response.data);
      setSuccessMessage(
        "Đăng ký thành công! Chuyển hướng tới trang đăng nhập..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "1200px",
      }}
    >
      <div
        style={{
          display: "flex",
          height: "auto",
          width: "80%",
          maxWidth: "1000px",
          justifyContent: "space-between",
          height: "80%",
        }}
      >
        {/* Phần form đăng ký */}
        <div
          style={{
            width: "50%",
            height: "auto",
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
            Đăng Ký
          </h2>
          {/* Hiển thị thông báo thành công */}
          {successMessage && (
            <div
              style={{
                backgroundColor: "#d4edda",
                color: "#155724",
                padding: "10px",
                marginBottom: "15px",
                borderRadius: "4px",
                border: "1px solid #c3e6cb",
                fontFamily: "Times New Roman, serif",
                textAlign: "center",
              }}
            >
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Các trường nhập liệu */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Tên người dùng:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
              {errors.name && (
                <p
                  style={{ color: "red", fontFamily: "Times New Roman, serif" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Tên đăng nhập */}
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
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
              {errors.username && (
                <p
                  style={{ color: "red", fontFamily: "Times New Roman, serif" }}
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Mật khẩu:
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
              {errors.password && (
                <p
                  style={{ color: "red", fontFamily: "Times New Roman, serif" }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Xác nhận mật khẩu:
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
              {errors.confirmPassword && (
                <p
                  style={{ color: "red", fontFamily: "Times New Roman, serif" }}
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
              {errors.email && (
                <p
                  style={{ color: "red", fontFamily: "Times New Roman, serif" }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Số điện thoại:
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
              {errors.phoneNumber && (
                <p
                  style={{ color: "red", fontFamily: "Times New Roman, serif" }}
                >
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Địa chỉ */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontFamily: "Times New Roman, serif",
                }}
              >
                Địa chỉ:
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "Times New Roman, serif",
                }}
              />
              {errors.address && (
                <p
                  style={{ color: "red", fontFamily: "Times New Roman, serif" }}
                >
                  {errors.address}
                </p>
              )}
            </div>

            {/* Nút đăng ký */}
            <button
              type="submit"
              style={{
                width: "100%",
                fontSize: "18px",
                padding: "12px",
                backgroundColor: "#E32C89",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "Times New Roman, serif",
              }}
            >
              Đăng Ký
            </button>
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
            src={RectangleRegister}
            alt="Rectangle Register"
            style={{
              width: "100%",
              height: "100%", // Chiều cao của ảnh và khung được giữ bằng nhau
              objectFit: "cover", // Giữ tỷ lệ ảnh
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Thêm bóng cho ảnh
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
