import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailure = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate("/Prebuy");
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8d7da, #f5c6cb)",
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
          src="https://img.icons8.com/ios-filled/50/ff4d4d/multiply.png"
          alt="Failure Icon"
          style={{ width: "60px", marginBottom: "20px" }}
        />
        <h1 style={{
          color: "#ff4d4d",
          fontSize: "36px",
          fontWeight: "700",
          margin: "0 0 10px 0",
        }}>
          Thanh toán thất bại
        </h1>
        <p style={{ color: "#555555", fontSize: "18px", marginBottom: "30px" }}>
          Xin lỗi, đã xảy ra sự cố trong quá trình thanh toán. Vui lòng thử lại.
        </p>
        <button
          onClick={handleRetryPayment}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0px 5px 15px rgba(255, 77, 77, 0.4)",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#e04343"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#ff4d4d"}
        >
          Thử lại thanh toán
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;
