// src/Components/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2"; // Import the Pie chart component
import "./Dashboard.css"; // Thêm file CSS cho Dashboard
import accountIcon from "./ImageDashboard/account.png"; // Hình ảnh cho quản lý account
import bannerIcon from "./ImageDashboard/banner.png"; // Hình ảnh cho quản lý banner
import billInfoIcon from "./ImageDashboard/billinfo.png"; // Hình ảnh cho quản lý Bill Info
import flowerIcon from "./ImageDashboard/flower.png"; // Hình ảnh cho quản lý Cart
import categoryIcon from "./ImageDashboard/category.png"; // Hình ảnh cho quản lý Category
import discountIcon from "./ImageDashboard/discount.png"; // Hình ảnh cho quản lý Discount
import imageIcon from "./ImageDashboard/image.png"; // Hình ảnh cho quản lý Image
import newsIcon from "./ImageDashboard/news.png"; // Hình ảnh cho quản lý News
import originIcon from "./ImageDashboard/origin.png"; // Hình ảnh cho quản lý Origin
import productSizeIcon from "./ImageDashboard/productsize.png"; // Hình ảnh cho quản lý ProductSize
import productTypeIcon from "./ImageDashboard/producttype.png"; // Hình ảnh cho quản lý ProductType
import reviewIcon from "./ImageDashboard/review.png"; // Hình ảnh cho quản lý Review
import commentIcon from "./ImageDashboard/comment.png"; // Hình ảnh cho quản lý Review
import commenttypeIcon from "./ImageDashboard/commenttype.png"; // Hình ảnh cho quản lý Review
import cartIcon from "./ImageDashboard/cart.png"; // Hình ảnh cho quản lý Review
import pureposeIcon from "./ImageDashboard/purpose.png"; // Hình ảnh cho quản lý Review
import repcommentIcon from "./ImageDashboard/repcomment.png"; // Hình ảnh cho quản lý Review
import logo from "./ImageDashboard/logo.png"; // Hình ảnh cho quản lý Review
import exit from "./ImageDashboard/exit.png"; // Hình ảnh cho quản lý Review
import { Bar } from "react-chartjs-2"; // Biểu đồ cột

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Đăng ký các thành phần:
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [accountInfo, setAccountInfo] = useState(null);
  const [orders, setOrders] = useState([]); // Đổi từ 'bills' thành 'orders'
  const [error, setError] = useState(null);
  const [reviewList, setReviewList] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const accountID = localStorage.getItem("accountID");
  const handleLogoClick = () => {
    navigate("/");
  };
  useEffect(() => {
    // Lấy thông tin tài khoản
    if (accountID && accesstoken) {
      fetch(
        `http://localhost:8080/api/v1/auth/account?accountID=${accountID}`,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.role === "admin") {
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

    // Lấy danh sách hóa đơn để vẽ biểu đồ
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/order",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách đơn hàng.");
        }

        const data = await response.json();
        const enabledOrders = data.filter((order) => order.status === "ENABLE");
        setOrders(enabledOrders);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, [accountID, accesstoken, navigate]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/review",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách đánh giá.");
        }

        const data = await response.json();
        console.log("Dữ liệu đánh giá:", data); // Kiểm tra dữ liệu trả về

        // Kiểm tra nếu data là một mảng
        if (Array.isArray(data)) {
          setReviewList(data);
        } else {
          console.error("Dữ liệu không phải mảng");
        }
      } catch (err) {
        console.error("Lỗi khi fetch reviews:", err.message);
      }
    };

    fetchReviews();
  }, [accesstoken]);

  const prepareRevenueChartData = () => {
    const revenueData = {};
    let totalRevenue = 0; // Biến để tính tổng doanh thu

    orders.forEach((order) => {
      if (
        order.paid === "Yes" &&
        Array.isArray(order.date) &&
        order.date.length >= 3
      ) {
        const monthYear = `${order.date[1]}/${order.date[0]}`; // Định dạng Tháng/Năm

        if (!revenueData[monthYear]) {
          revenueData[monthYear] = 0;
        }
        revenueData[monthYear] += order.totalAmount;
        totalRevenue += order.totalAmount; // Cộng dồn doanh thu
      }
    });

    return {
      totalRevenue, // Trả về tổng doanh thu cùng dữ liệu biểu đồ
      chartData: {
        labels: Object.keys(revenueData),
        datasets: [
          {
            label: "Doanh thu (VND)",
            data: Object.values(revenueData),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
    };
  };

  const getChartData = () => {
    const ratingCounts = [0, 0, 0, 0, 0]; // Đếm số lượng đánh giá cho mỗi sao (1-5 sao)

    reviewList.forEach((review) => {
      if (review.rating) {
        const ratingIndex = Math.floor(review.rating) - 1;
        if (ratingIndex >= 0 && ratingIndex < 5) {
          ratingCounts[ratingIndex] += 1; // Tăng số lượng theo số sao
        }
      }
    });

    console.log("Số lượng đánh giá theo sao:", ratingCounts); // Kiểm tra số lượng đánh giá

    return {
      labels: ["1 sao", "2 sao", "3 sao", "4 sao", "5 sao"],
      datasets: [
        {
          data: ratingCounts,
          backgroundColor: ["red", "orange", "yellow", "lightgreen", "green"],
          hoverBackgroundColor: [
            "darkred",
            "darkorange",
            "gold",
            "darkgreen",
            "darkgreen",
          ],
        },
      ],
    };
  };

  const handleLogout = () => {
    fetch("http://localhost:8080/api/v1/auth/logout", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
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

  // Các hàm chuyển hướng
  const handleNavigate = (path) => {
    navigate(path);
  };
  const { totalRevenue, chartData } = prepareRevenueChartData();

  return (
    <div className="admin-dashboard">
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <h2>Dashboard</h2>
          <img
            src={logo}
            alt="Logo"
            className="shop-logo"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }} // Thêm hiệu ứng con trỏ
          />{" "}
          <div className="admin-section">
            <button className="logout-button" onClick={handleLogout}>
              <img src={exit} alt="Log out" className="logout-icon" />
            </button>
          </div>
        </header>

        {/* Nội dung */}
        <div className="dashboard-container">
          <div className="admin-buttons-container">
            <div className="admin-buttons">
              <button onClick={() => handleNavigate("/AdminAccount")}>
                <img src={accountIcon} alt="Quản lý Account" /> Account
              </button>
              <button onClick={() => handleNavigate("/AdminBanner")}>
                <img src={bannerIcon} alt="Quản lý Banner" /> Banner
              </button>
              <button onClick={() => handleNavigate("/AdminOder")}>
                <img src={cartIcon} alt="Quản lý đơn hàng" /> Đơn hàng
              </button>
              <button onClick={() => handleNavigate("/AdminOrderDetail")}>
                <img src={billInfoIcon} alt="Quản lý thông tin đơn hàng" />{" "}
                Thông tin đơn hàng
              </button>
              <button onClick={() => handleNavigate("/AdminCategory")}>
                <img src={pureposeIcon} alt="Quản lý Category" /> Category
              </button>
              <button onClick={() => handleNavigate("/AdminComment")}>
                <img src={commentIcon} alt="Quản lý Comment" /> Comment
              </button>
              <button onClick={() => handleNavigate("/AdminRepcomment")}>
                <img src={repcommentIcon} alt="Quản lý Repcomment" /> Repcomment
              </button>
              <button onClick={() => handleNavigate("/AdminCommentType")}>
                <img src={commenttypeIcon} alt="Quản lý CommentType" />{" "}
                CommentType
              </button>
              <button onClick={() => handleNavigate("/AdminDiscount")}>
                <img src={discountIcon} alt="Quản lý Discount" /> Discount
              </button>
              <button onClick={() => handleNavigate("/AdminFlower")}>
                <img src={flowerIcon} alt="Quản lý hoa" /> Hoa
              </button>
              <button onClick={() => handleNavigate("/AdminFlowerImage")}>
                <img src={imageIcon} alt="Quản lý hình ảnh hoa" /> Hình ảnh hoa
              </button>
              <button onClick={() => handleNavigate("/AdminFlowerSize")}>
                <img src={productSizeIcon} alt="Quản lý size hoa" />
                Size hoa
              </button>
              <button onClick={() => handleNavigate("/AdminNews")}>
                <img src={newsIcon} alt="Quản lý News" /> News
              </button>
              <button onClick={() => handleNavigate("/AdminPurpose")}>
                <img src={categoryIcon} alt="Quản lý Purpose" /> Purpose
              </button>
              <button onClick={() => handleNavigate("/AdminReview")}>
                <img src={reviewIcon} alt="Quản lý Review" /> Review
              </button>
              <button onClick={() => handleNavigate("/AdminShipping")}>
                <img src={originIcon} alt="Quản lý Shipping" /> Shipping
              </button>
              <button onClick={() => handleNavigate("/AdminType")}>
                <img src={productTypeIcon} alt="Quản lý Type" /> Type
              </button>
            </div>
          </div>

          <div className="account-info-container">
            <div className="revenue-chart-container">
              <h2>Thống kê doanh thu theo tháng</h2>
              <h3 className="total-revenue">
                Tổng doanh thu: {totalRevenue.toLocaleString()} VND
              </h3>
              <Bar data={chartData} />
            </div>

            <div className="pie-chart-container">
              <h2>Thống kê đánh giá</h2>
              {reviewList.length > 0 ? (
                <Pie data={getChartData()} />
              ) : (
                <p>Đang tải hoặc không có đánh giá</p>
              )}
            </div>
            <div className="account-info">
              <h3>Thông Tin Tài Khoản</h3>
              {accesstoken && accountInfo ? (
                <div>
                  <div className="info-row">
                    <span className="label">ID Account:</span>
                    <span>{accountInfo.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Tên:</span>
                    <span>{accountInfo.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Role:</span>
                    <span>{accountInfo.role}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span>{accountInfo.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span>{accountInfo.phonenumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span>{accountInfo.email}</span>
                  </div>
                </div>
              ) : (
                <p>Đang tải thông tin tài khoản...</p>
              )}
              {error && <p className="error">{error}</p>}
              {!accesstoken && <p>Không có thông tin đăng nhập.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
