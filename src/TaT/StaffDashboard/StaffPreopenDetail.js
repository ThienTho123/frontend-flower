import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png"; // Adjust the path as needed
import { useNavigate } from "react-router-dom";

const StaffPreorderDetails = () => {
  const { id } = useParams(); // Lấy id từ URL
  const [preorder, setPreorder] = useState(null);
  const [preorderdetails, setPreorderDetails] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const accesstoken = localStorage.getItem("access_token");
  const handleBackToDashboard = () => {
    navigate("/StaffPreorder");
  };
  const translateCondition = (precondition) => {
    const translations = {
      Waiting: "Đang chờ",
      Ordering: "Đang đặt hàng",
      Refund: "Hoàn tiền",
      Refunding: "Đang hoàn tiền",
      Cancel: "Đã hủy",
      Success: "Thành công",
    };
    return translations[precondition] || precondition;
  };

  useEffect(() => {
    if (!accesstoken) {
      setError("Access token không tồn tại. Vui lòng đăng nhập lại.");
      return;
    }

    const fetchPreorderDetails = async () => {
      try {
        const response = await fetch(
          `https://deploybackend-j61h.onrender.com/api/v1/staff/preorder/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy thông tin đơn hàng.");
        }

        const data = await response.json();
        setPreorder(data.preorders || {}); // Đảm bảo không bị null
        setPreorderDetails(data.preorderdetails || []); // Nếu không có thì gán mảng rỗng
      } catch (err) {
        setError(err.message);
      }
    };

    const translateCondition = (precondition) => {
      const translations = {
        Waiting: "Đang chờ",
        Ordering: "Đang đặt hàng",
        Refund: "Hoàn tiền",
        Refunding: "Đang hoàn tiền",
        Cancel: "Đã hủy",
        Success: "Thành công",
      };
      return translations[precondition] || precondition;
    };
    fetchPreorderDetails();
  }, [id, accesstoken]);

  const handleCancelableById = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/staff/preorder/cancelable/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái đơn hàng.");
      }

      // Cập nhật lại danh sách đơn hàng sau khi thay đổi
      const updatedResponse = await fetch(
        "https://deploybackend-j61h.onrender.com/api/v1/staff/preorder",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!updatedResponse.ok) {
        throw new Error("Không thể lấy danh sách đơn hàng sau khi cập nhật.");
      }

      const updatedData = await updatedResponse.json();
      setPreorder(updatedData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCompletePreorder = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/staff/preorder/complete/${id}`,
        {
          method: "POST", // Hoặc "PUT" nếu backend sử dụng `@PutMapping`
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể hoàn thành đơn hàng.");
      }

      // Cập nhật lại danh sách đơn hàng sau khi hoàn thành
      const updatedResponse = await fetch(
        "https://deploybackend-j61h.onrender.com/api/v1/staff/preorder",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!updatedResponse.ok) {
        throw new Error("Không thể lấy danh sách đơn hàng sau khi cập nhật.");
      }

      const updatedData = await updatedResponse.json();
      setPreorder(updatedData);
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateTotalPaid = () => {
    return preorderdetails.reduce(
      (total, detail) => total + (detail.paid || 0),
      0
    );
  };
  return (
    <div className="admin-ql-container">
      <div className="title-container">
        <img
          src={returnIcon}
          alt="Quay Lại"
          className="return-button"
          onClick={handleBackToDashboard}
        />
        <h2>Chi Tiết Đơn Đặt Trước</h2>
      </div>
      <button
        className="order-button"
        onClick={async () => {
          await handleCancelableById(preorder?.id); // Gọi hàm xử lý
          setPreorder({
            ...preorder,
            precondition:
              preorder?.precondition === "Waiting" ? "Ordering" : "Waiting",
          });
        }}
        disabled={["Refund", "Refunding", "Cancel", "Success"].includes(
          preorder?.precondition || ""
        )}
      >
        {preorder?.precondition === "Waiting" ? "Đặt hàng" : "Hoàn tác"}
      </button>

      <button
        className="order-button"
        disabled={[
          "Refund",
          "Refunding",
          "Cancel",
          "Success",
          "Waiting",
        ].includes(preorder?.precondition || "")}
        onClick={async () => {
          await handleCompletePreorder(preorder?.id); // Gọi hàm xử lý
          setPreorder({ ...preorder, precondition: "Success" });
        }}
      >
        Hoàn thành
      </button>

      {preorder && (
        <div className="order-history">
          <div className="order-history-left">
            <p>
              <strong>ID Hóa Đơn:</strong> {preorder.id}
            </p>
            <p>
              <strong>Họ Tên Khách Hàng:</strong> {preorder.name}
            </p>
            <p>
              <strong>Ngày Đặt:</strong>{" "}
              {preorder.date
                ? new Date(
                    preorder.date[0],
                    preorder.date[1] - 1,
                    preorder.date[2],
                    preorder.date[3],
                    preorder.date[4],
                    preorder.date[5]
                  ).toLocaleString()
                : "Không có dữ liệu"}
            </p>
            <p>
              <strong>Trạng Thái:</strong>{" "}
              {translateCondition(preorder.precondition)}
            </p>
          </div>
          <div className="order-history-right">
            <p>
              <strong>Số Điện Thoại:</strong> {preorder.phoneNumber}
            </p>
            <p>
              <strong>Địa Chỉ:</strong> {preorder.deliveryAddress}
            </p>
            <p>
              <strong>Tổng:</strong> {preorder.totalAmount} đ
            </p>
            <p>
              <strong>Tổng tiền đã thanh toán:</strong> {calculateTotalPaid()} đ
            </p>
            <p>
              <strong>Số tiền cần trả:</strong>{" "}
              {preorder.totalAmount - calculateTotalPaid()} đ
            </p>
          </div>
        </div>
      )}

      {/* Phần Order Detail */}
      <div className="order-detail">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên hoa</th>
              <th>Kích thước</th>
              <th>Dài x Rộng x Cao</th>
              <th>Khối lượng</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Tổng</th>
              <th>Đã thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {preorderdetails.map((item) => (
              <tr key={item.stt}>
                <td>{item.preorderdetailid}</td>
                <td>{item.flowerSize.flower.name}</td>
                <td>{item.flowerSize.sizeName}</td>
                <td>
                  {item.flowerSize.length} x {item.flowerSize.width} x{" "}
                  {item.flowerSize.high}
                </td>
                <td>{item.flowerSize.weight}</td>
                <td>{item.quantity}</td>
                <td>{item.price / item.quantity} đ</td>
                <td>{item.price} đ</td>
                <td>{item.paid} đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffPreorderDetails;
