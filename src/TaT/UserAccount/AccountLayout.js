import { Outlet, useNavigate } from "react-router-dom";
import "./Accounct.css";
import axios from "axios";
import { useState, useEffect } from "react";
import userImg from "./Image/user.png";

const AccountLayout = () => {
  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token");
  const accountID = localStorage.getItem("accountID");
  const [profileForm, setProfileForm] = useState({}); // State lưu thông tin người dùng

  // Hàm lấy thông tin người dùng từ API
  const getUserInfo = async () => {
    try {
      const response = await axios.get("http://localhost:8080/account", {
        params: { accountID },
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setProfileForm(response.data); // Lưu thông tin người dùng vào state
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài khoản:", error);
    }
  };

  useEffect(() => {
    if (accountID && access_token) {
      getUserInfo(); // Gọi API khi component render
    } else {
      navigate("/login"); // Chuyển hướng đến trang đăng nhập nếu không có token
    }
  }, []);

  const handleLogout = () => {
    axios
      .get("http://localhost:8080/api/v1/auth/logout", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("accountID");
          navigate("/login");
        } else {
          throw new Error("Không thể đăng xuất");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="account-layout">
      <div className="account-nav">
        <h2
          style={{
            display: "flex",
            margin: 0,
            padding: "8px 4px",
            alignItems: "center",
          }}
        >
          <img
            src={profileForm.avatar || userImg} // Hiển thị avatar từ API hoặc ảnh mặc định
            alt="user"
            className="avatar-user"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }} // Style ảnh tròn
          />
          <div
            style={{
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              marginLeft: "10px",
            }}
          >
            <span style={{ fontSize: 16, color: "#888", fontWeight: "normal" }}>
              #{accountID}
            </span>
            <span style={{ fontSize: 18 }}>
              {(profileForm.username?.length > 20
                ? profileForm.username.slice(0, 30) + "..."
                : profileForm.username) || "Tên không có sẵn"}
            </span>
          </div>
        </h2>
        <button onClick={() => navigate("/account")}>Tài khoản</button>
        <button onClick={() => navigate("/account/wishlist")}>Yêu thích</button>
        <button onClick={() => navigate("/account/orders")}>
          Sản phẩm đã mua
        </button>
        <button onClick={() => navigate("/account/history")}>
          Lịch sử mua hàng
        </button>
        <button onClick={() => navigate("/account/sendcomment")}>
          Gửi góp ý
        </button>
        <button onClick={() => navigate("/account/changepassword")}>
          Đổi mật khẩu
        </button>
        <button onClick={handleLogout}>Đăng xuất</button>
      </div>
      <div className="account-outlet">
        <Outlet />
      </div>
    </div>
  );
};

export default AccountLayout;
