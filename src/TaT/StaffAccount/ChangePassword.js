import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm import này

const ChangeStaffPassword = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState({});
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const validatePassword = () => {
    let formErrors = {};
    if (!passwordForm.currentPassword) {
      formErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
    }
    if (passwordForm.newPassword.length < 8) {
      formErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự.";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      formErrors.confirmPassword = "Mật khẩu mới và xác nhận mật khẩu không trùng khớp.";
    }
    return formErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validatePassword();
    if (Object.keys(formErrors).length > 0) {
      setError(formErrors);
      return;
    }
    
    console.log("Password Form Data:", passwordForm); // Kiểm tra dữ liệu trước khi gửi
    setError({});
    handleChangePassword();
  };
  
  const handleChangePassword = async () => {
    try {
      const response = await axios.put(
        "http://localhost:8080/staffaccount/changepassword",
        {
          curpass: passwordForm.currentPassword,
          newpass: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json', // Đảm bảo gửi đúng định dạng
          },
        }
      );
      
      alert(response.data);
      // Xóa access_token khỏi localStorage
      localStorage.removeItem("access_token");
      // Chuyển hướng tới trang /login
      navigate("/login");
    } catch (error) {
      if (error.response) {
        console.log("Error response:", error.response);
        setError({ message: error.response.data });
      } else if (error.request) {
        console.log("Error request:", error.request);
      } else {
        console.log("Error message:", error.message);
      }
    }
  };
  
  return (
    <div className="change-password-container">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
  <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
  <input
    id="currentPassword"
    name="currentPassword"
    type="password"
    value={passwordForm.currentPassword}
    onChange={handleChange}
    required
  />
  {error.currentPassword && (
    <p style={{ color: "red", fontSize: "0.9rem", marginTop: "5px" }}>
      {error.currentPassword}
    </p>
  )}
</div>

<div className="space-y-2">
  <label htmlFor="newPassword">Mật khẩu mới</label>
  <input
    id="newPassword"
    name="newPassword"
    type="password"
    value={passwordForm.newPassword}
    onChange={handleChange}
    required
  />
  {error.newPassword && (
    <p style={{ color: "red", fontSize: "0.9rem", marginTop: "5px" }}>
      {error.newPassword}
    </p>
  )}
</div>

<div className="space-y-2">
  <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
  <input
    id="confirmPassword"
    name="confirmPassword"
    type="password"
    value={passwordForm.confirmPassword}
    onChange={handleChange}
    required
  />
  {error.confirmPassword && (
    <p style={{ color: "red", fontSize: "0.9rem", marginTop: "5px" }}>
      {error.confirmPassword}
    </p>
  )}
</div>

        <button type="submit">Đổi mật khẩu</button>
        {error.message && (
  <p
    className="error-notice"
    style={{ color: "red", fontSize: "0.9rem", marginTop: "5px" }}
  >
    {error.message}
  </p>
)}
        </form>
    </div>
  );
};

export default ChangeStaffPassword;
