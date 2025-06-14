// src/Components/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Thêm file CSS cho Dashboard
import billInfoIcon from "./ImageDashboard/billinfo.png"; // Hình ảnh cho quản lý Bill Info
import flowerIcon from "./ImageDashboard/flower.png"; // Hình ảnh cho quản lý Cart
import imageIcon from "./ImageDashboard/image.png"; // Hình ảnh cho quản lý Image
import productSizeIcon from "./ImageDashboard/productsize.png"; // Hình ảnh cho quản lý ProductSize
import cartIcon from "./ImageDashboard/cart.png"; // Hình ảnh cho quản lý Review
import logo from "./ImageDashboard/logo.png"; // Hình ảnh cho quản lý Review
import exit from "./ImageDashboard/exit.png"; // Hình ảnh cho quản lý Review
import { Link } from "react-router-dom";
import deliveryIcon from "./ImageDashboard/delivery.png"; // Hình ảnh cho quản lý Review
import cancelIcon from "./ImageDashboard/cancel.png"; // Hình ảnh cho quản lý Review
import refund from "./ImageDashboard/refund.svg";
import preorder from "./ImageDashboard/preorder.png";
import blog from "./ImageDashboard/Blog.png";
import event from "./ImageDashboard/event.png";
import orderDeIcon from "./ImageDashboard/orderde.png";
import giftIcon from "./ImageDashboard/gift.png";
import rollbarIcon from "./ImageDashboard/rollbar.png";
import customIcon from "./ImageDashboard/custom.png";
import ribbonIcon from "./ImageDashboard/gift-bow.png";
const StaffDashboard = () => {
  const navigate = useNavigate();
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const accountID = localStorage.getItem("accountID");

  useEffect(() => {
    // Lấy thông tin tài khoản
    if (accountID && accesstoken) {
      fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/auth/account?accountID=${accountID}`,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.role === "staff") {
            setAccountInfo(data);
          } else {
            navigate("/Prebuy");
          }
        })
        .catch((error) => {
          setError("Có lỗi xảy ra khi lấy thông tin tài khoản.");
          console.error(error);
        });
    } else {
      navigate("/login");
    }
  }, [accountID, accesstoken, navigate]);

  const handleLogout = () => {
    navigate("/staffaccount");
  };

  // Các hàm chuyển hướng
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <h2>Staff Manager</h2>
          <Link to="/">
            <img src={logo} alt="Logo" className="shop-logo" />
          </Link>{" "}
          <div className="admin-section">
            <button className="logout-button" onClick={handleLogout}>
              <img src={exit} alt="Log out" className="logout-icon" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="staff-dashboard-main">
          <div className="staff-button-wrapper">
            <div className="staff-buttons">
              <button onClick={() => handleNavigate("/StaffFlower")}>
                <img src={flowerIcon} alt="Quản lý hoa" /> Hoa
              </button>
              <button onClick={() => handleNavigate("/StaffFlowerImage")}>
                <img src={imageIcon} alt="Quản lý hình ảnh hoa" /> Hình ảnh hoa
              </button>
              <button onClick={() => handleNavigate("/StaffFlowerSize")}>
                <img src={productSizeIcon} alt="Quản lý size hoa" /> Size hoa
              </button>
              <button onClick={() => handleNavigate("/StaffOrder")}>
                <img src={cartIcon} alt="Quản lý đơn hàng" /> Đơn hàng
              </button>
              <button onClick={() => handleNavigate("/StaffDelivery")}>
                <img src={deliveryIcon} alt="Quản lý giao hàng" /> Giao hàng
              </button>
              <button onClick={() => handleNavigate("/StaffCanceldelivery")}>
                <img src={cancelIcon} alt="Quản lý đơn hủy" /> Đơn hủy
              </button>
              <button onClick={() => handleNavigate("/StaffOrderDetail")}>
                <img src={billInfoIcon} alt="Quản lý thông tin đơn hàng" />{" "}
                Thông tin đơn hàng
              </button>
              <button onClick={() => handleNavigate("/StaffRefund")}>
                <img src={refund} alt="Quản lý hoàn tiền hóa đơn" /> Hoàn tiền
              </button>
              <button onClick={() => handleNavigate("/StaffPreorder")}>
                <img src={preorder} alt="Quản lý hoàn tiền hóa đơn" />
                Đơn đặt trước
              </button>
              <button onClick={() => handleNavigate("/StaffBlog")}>
                <img src={blog} alt="Quản lý hoàn tiền hóa đơn" />
                Quản lý Blog
              </button>
              <button onClick={() => handleNavigate("/StaffEvent")}>
                <img src={event} alt="Quản lý sự kiện" />
                Quản lý sự kiện
              </button>
              <button onClick={() => handleNavigate("/StaffOrderDe")}>
                <img src={orderDeIcon} alt="Đơn đặt trước mới" /> Đơn theo lịch
              </button>
              <button onClick={() => handleNavigate("/StaffAccountGift")}>
                <img src={giftIcon} alt="Quản lý quà tặng" /> Quản lý quà tặng
              </button>
              <button onClick={() => handleNavigate("/StaffRollBar")}>
                <img src={rollbarIcon} alt="Quản lý quay thưởng" /> Quản lý quay
                thưởng
              </button>
              <button onClick={() => handleNavigate("/StaffCustomOrders")}>
                <img src={customIcon} alt="Quản lý Custom" /> Quản lý custom
              </button>
              <button onClick={() => handleNavigate("/StaffOtherFlower")}>
                <img
                  src={ribbonIcon}
                  alt="Quản lý hoa và vật phẩm theo yêu cầu"
                />{" "}
                Quản lý hoa và vật phẩm theo yêu cầu
              </button>
            </div>
          </div>

          <div className="staff-account-info-wrapper">
            <div className="staff-account-info">
              <h3>Thông Tin Tài Khoản</h3>
              {accesstoken && accountInfo ? (
                <div>
                  <div className="staff-info-row">
                    <span className="staff-info-label">ID Account:</span>
                    <span className="staff-info-value">{accountInfo.id}</span>
                  </div>
                  <div className="staff-info-row">
                    <span className="staff-info-label">Tên:</span>
                    <span className="staff-info-value">{accountInfo.name}</span>
                  </div>
                  <div className="staff-info-row">
                    <span className="staff-info-label">Role:</span>
                    <span className="staff-info-value">{accountInfo.role}</span>
                  </div>
                  <div className="staff-info-row">
                    <span className="staff-info-label">Address:</span>
                    <span className="staff-info-value">
                      {accountInfo.address}
                    </span>
                  </div>
                  <div className="staff-info-row">
                    <span className="staff-info-label">Phone:</span>
                    <span className="staff-info-value">
                      {accountInfo.phonenumber}
                    </span>
                  </div>
                  <div className="staff-info-row">
                    <span className="staff-info-label">Email:</span>
                    <span className="staff-info-value">
                      {accountInfo.email}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="staff-loading-info">
                  Đang tải thông tin tài khoản...
                </p>
              )}
              {error && <p className="staff-error-info">{error}</p>}
              {!accesstoken && (
                <p className="staff-no-login-info">
                  Không có thông tin đăng nhập.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
