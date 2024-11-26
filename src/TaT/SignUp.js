// src/SignUp.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '', 
    email: '',
    phoneNumber: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/register', formData);
      console.log('User registered:', response.data);

      navigate('/login');
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", width: "350px", backgroundColor: "#f9f9f9" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", color: "#333" }}>Đăng Ký</h2>
        <form onSubmit={handleSubmit}>
          {/* Tên người dùng */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Tên người dùng:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
          </div>

          {/* Tên đăng nhập */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Tên đăng nhập:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
          </div>

          {/* Mật khẩu */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Mật khẩu:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Xác nhận mật khẩu:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
          </div>

          {/* Số điện thoại */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Số điện thoại:</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            {errors.phoneNumber && <p style={{ color: 'red' }}>{errors.phoneNumber}</p>}
          </div>

          {/* Địa chỉ */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Địa chỉ:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            {errors.address && <p style={{ color: 'red' }}>{errors.address}</p>}
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            style={{ width: "100%", padding: "10px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Đăng Ký
          </button>
        </form>
      </div>
    </div>

  );
};

export default SignUp;
