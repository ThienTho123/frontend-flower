import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useBootstrap from "../useBootstrap";
import "./CreateEventForm.css";

const EditAccountGift = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accountGift, setAccountGift] = useState({
    account: null,
    gift: null,
    order: null,
    discount: null,
    status: "ENABLE",
  });

  const [accountList, setAccountList] = useState([]);
  const [discountList, setDiscountList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [giftList, setGiftList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useBootstrap();

  useEffect(() => {
    fetchData();
    fetchAccountGiftDetails();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        "https://deploybackend-1ta9.onrender.com/staffaccountgift",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { accounts, discounts, orders, gifts } = response.data;

      setAccountList(accounts || []);
      setDiscountList(discounts || []);
      setOrderList(orders || []);

      if (gifts) {
        setGiftList(gifts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Lỗi khi tải dữ liệu danh sách. Vui lòng thử lại sau.");
      setIsErrorModalOpen(true);
    }
  };

  const fetchAccountGiftDetails = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(
        `https://deploybackend-1ta9.onrender.com/staffaccountgift/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const giftData = response.data.accountGift;

      if (giftData) {
        // Đảm bảo rằng chúng ta chỉ lưu những thông tin cần thiết
        setAccountGift({
          account: giftData.account,
          gift: giftData.gift,
          order: giftData.order ? { orderID: giftData.order.orderID } : null,
          discount: giftData.discount,
          status: giftData.status || "ENABLE",
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching account gift details:", error);
      setErrorMessage("Lỗi khi tải dữ liệu quà tặng. Vui lòng thử lại sau.");
      setIsErrorModalOpen(true);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountGift({ ...accountGift, [name]: value });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    if (value === "") {
      setAccountGift({ ...accountGift, [name]: null });
      return;
    }

    let selectedItem;
    let updatedAccountGift = { ...accountGift };

    switch (name) {
      case "account":
        selectedItem = accountList.find(
          (account) => account.accountID === parseInt(value)
        );
        updatedAccountGift.account = selectedItem;
        break;
      case "gift":
        selectedItem = giftList.find((gift) => gift.id === parseInt(value));
        updatedAccountGift.gift = selectedItem;
        break;
      case "discount":
        selectedItem = discountList.find(
          (discount) => discount.discountID === parseInt(value)
        );
        updatedAccountGift.discount = selectedItem;
        // Khi chọn discount, đặt order về null
        updatedAccountGift.order = null;
        break;
      case "order":
        selectedItem = orderList.find(
          (order) => order.orderID === parseInt(value)
        );
        // Chỉ lấy orderID thay vì toàn bộ đối tượng order
        updatedAccountGift.order = { orderID: selectedItem.orderID };
        // Khi chọn order, đặt discount về null
        updatedAccountGift.discount = null;
        break;
      default:
        selectedItem = null;
    }

    setAccountGift(updatedAccountGift);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!accountGift.account || !accountGift.gift) {
      setErrorMessage("Vui lòng chọn tài khoản và quà tặng!");
      setIsErrorModalOpen(true);
      return;
    }

    setIsModalOpen(true);
  };

  const confirmSubmit = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");

      // Gửi đúng định dạng mà backend mong đợi
      const dataToSend = {
        account: {
          accountID: accountGift.account.accountID,
        },
        gift: {
          id: accountGift.gift.id,
        },
        order: accountGift.order,
        discount: accountGift.discount
          ? { discountID: accountGift.discount.discountID }
          : null,
        status: accountGift.status,
      };

      console.log("Sending data:", JSON.stringify(dataToSend, null, 2));

      await axios.put(
        `https://deploybackend-1ta9.onrender.com/staffaccountgift/${id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error updating gift:", error);
      console.error("Error details:", error.response?.data);
      setIsModalOpen(false);
      setErrorMessage(
        error.response?.data || "Có lỗi xảy ra khi cập nhật quà tặng!"
      );
      setIsErrorModalOpen(true);
    }
  };

  const handleBackToList = () => {
    navigate("/StaffAccountGift");
  };

  // Kiểm tra xem có order hoặc discount nào được chọn hay không
  const isOrderSelected = accountGift.order !== null;
  const isDiscountSelected = accountGift.discount !== null;

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="event-form-container">
      <h2 className="event-form-title">Chỉnh Sửa Quà Tặng</h2>

      <div className="event-form-group">
        <label>Tài khoản:</label>
        <select
          name="account"
          className="event-form-input"
          onChange={handleSelectChange}
          value={accountGift.account ? accountGift.account.accountID : ""}
        >
          <option value="">-- Chọn tài khoản --</option>
          {accountList.map((account) => (
            <option key={account.accountID} value={account.accountID}>
              {account.username} - {account.email}
            </option>
          ))}
        </select>
      </div>

      <div className="event-form-group">
        <label>Quà tặng:</label>
        <select
          name="gift"
          className="event-form-input"
          onChange={handleSelectChange}
          value={accountGift.gift ? accountGift.gift.id : ""}
        >
          <option value="">-- Chọn quà tặng --</option>
          {giftList.map((gift) => (
            <option key={gift.id} value={gift.id}>
              {gift.name || `Quà #${gift.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="event-form-group">
        <label>Đơn hàng:</label>
        <select
          name="order"
          className="event-form-input"
          onChange={handleSelectChange}
          value={accountGift.order ? accountGift.order.orderID : ""}
          disabled={isDiscountSelected}
        >
          <option value="">-- Chọn đơn hàng (không bắt buộc) --</option>
          {orderList.map((order) => (
            <option key={order.orderID} value={order.orderID}>
              {order.orderID} -{" "}
              {order.total
                ? `${order.total} VND`
                : order.totalAmount
                ? `${order.totalAmount} VND`
                : ""}
            </option>
          ))}
        </select>
        {isDiscountSelected && (
          <p
            className="form-note"
            style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.3rem" }}
          >
            Bạn đã chọn khuyến mãi. Vui lòng bỏ chọn khuyến mãi để chọn đơn
            hàng.
          </p>
        )}
      </div>

      <div className="event-form-group">
        <label>Khuyến mãi:</label>
        <select
          name="discount"
          className="event-form-input"
          onChange={handleSelectChange}
          value={accountGift.discount ? accountGift.discount.discountID : ""}
          disabled={isOrderSelected}
        >
          <option value="">-- Chọn khuyến mãi (không bắt buộc) --</option>
          {discountList.map((discount) => (
            <option key={discount.discountID} value={discount.discountID}>
              {discount.discountcode || "Mã KM"} -{" "}
              {discount.discountPercent || 0}%
            </option>
          ))}
        </select>
        {isOrderSelected && (
          <p
            className="form-note"
            style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.3rem" }}
          >
            Bạn đã chọn đơn hàng. Vui lòng bỏ chọn đơn hàng để chọn khuyến mãi.
          </p>
        )}
      </div>

      <div className="event-form-group">
        <label>Trạng thái:</label>
        <select
          name="status"
          className="event-form-input"
          value={accountGift.status}
          onChange={handleInputChange}
        >
          <option value="ENABLE">Kích hoạt</option>
          <option value="DISABLE">Vô hiệu hóa</option>
        </select>
      </div>

      <div className="event-form-buttons">
        <button onClick={handleSubmit} className="event-form-submit-button">
          Cập Nhật Quà Tặng
        </button>
        <button onClick={handleBackToList} className="event-form-cancel-button">
          Quay Lại Danh Sách
        </button>
      </div>

      {/* Modal xác nhận */}
      {isModalOpen && (
        <div
          className="event-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="event-modal-content"
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3>Xác nhận cập nhật Quà Tặng</h3>
            <p>Bạn có chắc muốn cập nhật quà tặng này không?</p>
            <div className="event-modal-buttons">
              <button
                onClick={confirmSubmit}
                className="event-modal-confirm"
                style={{
                  marginRight: "0.5rem",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="event-modal-cancel"
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thành công */}
      {isSuccessModalOpen && (
        <div
          className="event-success-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="event-success-modal-content"
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3>🎉 Thành công!</h3>
            <p>Quà tặng đã được cập nhật thành công.</p>
            <div className="event-success-modal-buttons">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  handleBackToList();
                }}
                className="event-success-modal-list-button"
                style={{
                  marginRight: "0.5rem",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Về Danh Sách
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="event-success-modal-continue-button"
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Tiếp Tục Chỉnh Sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal lỗi */}
      {isErrorModalOpen && (
        <div
          className="event-error-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="event-error-modal-content"
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3>❌ Thất bại!</h3>
            <p>{errorMessage}</p>
            <button
              onClick={() => setIsErrorModalOpen(false)}
              className="event-error-modal-button"
              style={{
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAccountGift;
