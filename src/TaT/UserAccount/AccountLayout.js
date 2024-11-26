import { Outlet, useNavigate } from "react-router-dom";
import "./Accounct.css";
import axios from "axios";
import { useState } from "react";
import userImg from "./Image/user.png";
const AccountLayout = () => {
  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token");
  const accountID = localStorage.getItem("accountID");
  const [profileForm, setProfileForm] = useState({});
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
  // JWT decoding function to get payload
  const getDecodedToken = (access_token) => {
    try {
      const base64Url = access_token.split(".")[1]; // take payload
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload); // return JSON object
    } catch (error) {
      console.error("Invalid access_token", error);
      return null;
    }
  };

  const payload = getDecodedToken(access_token);
  return (
    <div className="account-layout">
      <div className="account-nav">
        <h2 style={{display:"flex", margin: 0, padding: "8px 4px", alignItems: "center"}}>
          <img src={userImg} alt="user" />
          <div style={{textAlign: "left",display : "flex", flexDirection: "column", marginLeft: "10px"}}>
            <span style={{fontSize: 16, color: "#888", fontWeight: "normal"}}>#{accountID}</span>
            <span style={{fontSize: 18}}>{payload?.sub}</span>
          </div>
        </h2>
        <button onClick={() => navigate("/account")}>Tài khoản</button>
        <button onClick={() => navigate("/account/orders")}>Đơn hàng</button>
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
