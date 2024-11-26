import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f7fa, #b2ebf2)",
    }}>
      <div style={{
        textAlign: "center",
        padding: "40px 60px",
        borderRadius: "15px",
        backgroundColor: "#ffffff",
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
      }}>
        <img
          src="https://img.icons8.com/ios-filled/50/4caf50/checkmark.png" 
          alt="Success Icon" 
          style={{ width: "60px", marginBottom: "20px" }}
        />
        <h1 style={{
          color: "#4caf50",
          fontSize: "36px",
          fontWeight: "700",
          margin: "0 0 10px 0",
        }}>
          Đặt hàng thành công!
        </h1>
        <p style={{ color: "#555555", fontSize: "18px", marginBottom: "30px" }}>
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.
        </p>
        <button
          onClick={handleBackToHome}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0px 5px 15px rgba(76, 175, 80, 0.4)",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
