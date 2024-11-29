import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; // Adjust the path as needed

const AdminOrderDetail = ({ orderID }) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [editingOrderDetailId, setEditingOrderDetailId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/staff/orderdetail`, {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy thông tin chi tiết đơn hàng.");
        }

        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrderDetails();
  }, [accesstoken]);

  const handleInputChange = (e, orderDetailId, field) => {
    let value = e.target.value;
    
    // Kiểm tra nếu field là "flowerSizeID"
    if (field === "flowerSizeID") {
      // Đảm bảo rằng giá trị flowerSizeID không phải là giá trị trống hoặc không hợp lệ
      value = value === "" || value === "0" ? null : value;
  
      setOrderDetails((prevDetails) =>
        prevDetails.map((orderDetail) =>
          orderDetail.orderdetailID === orderDetailId
            ? { 
                ...orderDetail, 
                flowerSizeID: value, // Cập nhật flowerSizeID mới
                flowerSize: { ...orderDetail.flowerSize, flowerSizeID: value } // Nếu bạn cũng muốn cập nhật flowerSize trong object
              }
            : orderDetail
        )
      );
    } else {
      // Xử lý các trường hợp khác (như quantity, price, status...)
      setOrderDetails((prevDetails) =>
        prevDetails.map((orderDetail) =>
          orderDetail.orderdetailID === orderDetailId
            ? { ...orderDetail, [field]: value }
            : orderDetail
        )
      );
    }
  };

  const handleBackToDashboard = () => {
    navigate("/staff");
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
        <h2>Quản Lý Chi Tiết Đơn Hàng</h2>
      </div>
      {error && <p>{error}</p>}
      {orderDetails.length === 0 ? (
        <p>Không có chi tiết đơn hàng nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Chi Tiết Đơn Hàng</th>
              <th>Flower Size</th>
              <th>Số Lượng</th>
              <th>Giá</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((orderDetail) => (
              <tr key={orderDetail.orderdetailID}>
                <td>{orderDetail.orderdetailID}</td>

                  {/* Flower Size */}
                  <td>
                    {editingOrderDetailId === orderDetail.orderdetailID ? (
                      <input
                        type="text"
                        value={orderDetail.flowerSizeID || ""} // Đảm bảo giá trị là "" nếu không có
                        onChange={(e) =>
                          handleInputChange(e, orderDetail.orderdetailID, "flowerSizeID")
                        }
                      />
                    ) : (
                      orderDetail.flowerSize?.flowerSizeID || "Chưa có" // Hiển thị flowerSizeID nếu có
                    )}
                  </td>

                {/* Quantity */}
                <td>
                  {editingOrderDetailId === orderDetail.orderdetailID ? (
                    <input
                      type="number"
                      value={orderDetail.quantity}
                      onChange={(e) =>
                        handleInputChange(e, orderDetail.orderdetailID, "quantity")
                      }
                    />
                  ) : (
                    orderDetail.quantity
                  )}
                </td>

                {/* Price */}
                <td>
                  {editingOrderDetailId === orderDetail.orderdetailID ? (
                    <input
                      type="number"
                      value={orderDetail.price}
                      onChange={(e) =>
                        handleInputChange(e, orderDetail.orderdetailID, "price")
                      }
                    />
                  ) : (
                    orderDetail.price
                  )}
                </td>

                {/* Status */}
                <td>
                  {editingOrderDetailId === orderDetail.orderdetailID ? (
                    <select
                      value={orderDetail.status}
                      onChange={(e) =>
                        handleInputChange(e, orderDetail.orderdetailID, "status")
                      }
                    >
                      <option value="ENABLE">Enable</option>
                      <option value="DISABLE">Disable</option>
                    </select>
                  ) : (
                    orderDetail.status
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrderDetail;
