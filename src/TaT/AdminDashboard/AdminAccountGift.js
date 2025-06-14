import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import returnIcon from "./ImageDashboard/return-button.png";
import plus from "./ImageDashboard/plus.png";

const AdminAccountGift = () => {
  const [accountGifts, setAccountGifts] = useState([]);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    fetchAccountGifts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";

    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const fetchAccountGifts = async () => {
    try {
      const response = await axios.get(
        "https://deploybackend-1ta9.onrender.com/adminaccountgift",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      const rawAccountGifts = response.data?.accountGifts || [];

      if (!Array.isArray(rawAccountGifts)) {
        console.error("AccountGift data is not an array:", rawAccountGifts);
        setAccountGifts([]);
        return;
      }

      const updatedAccountGifts = rawAccountGifts.map((item, index) => ({
        stt: index + 1,
        id: item.id,
        account: item.account ? item.account.username : "",
        // Xử lý gift là một đối tượng thay vì chuỗi
        gift: item.gift ? item.gift.name || `Quà #${item.gift.id}` : "",
        giftObject: item.gift || null,
        order: item.order ? `${item.order.orderID}` : "",
        date: formatDate(item.date),
        discount: item.discount
          ? `${item.discount.discountcode} (${item.discount.discountPercent}%)`
          : "",
        status: item.status,
      }));

      setAccountGifts(updatedAccountGifts);
    } catch (error) {
      console.error("Error fetching account gifts:", error);
      setError("Không thể tải dữ liệu quà tặng. Vui lòng thử lại sau.");
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedGift) return;

    try {
      const response = await axios.delete(
        `https://deploybackend-1ta9.onrender.com/adminaccountgift/${selectedGift.id}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      setBackendMessage(response.data || "Thao tác thành công!");
      setResultModal(true);
      fetchAccountGifts();
    } catch (err) {
      setBackendMessage(err.response?.data || "Lỗi không xác định");
      setResultModal(true);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const getGiftDescription = (gift) => {
    if (!gift) return "N/A";

    // Nếu gift là đối tượng Gift, hiển thị tên của nó
    if (gift.giftName) {
      return gift.giftName;
    }

    // Nếu không có tên, hiển thị ID
    if (gift.giftID) {
      return `Quà #${gift.giftID}`;
    }

    // Nếu không có thông tin gì về gift, hiển thị "N/A"
    return "N/A";
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
        <h2>Quản Lý Quà Tặng</h2>
        <Link to={`/AdminAccountGift/new`}>
          <img
            src={plus}
            alt="Thêm mới"
            className="return-button"
            style={{ cursor: "pointer" }}
          />
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {accountGifts.length === 0 ? (
        <p>Không có quà tặng nào.</p>
      ) : (
        <>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>STT</th>
                <th>ID</th>
                <th>Tài khoản</th>
                <th>Quà tặng</th>
                <th>Đơn hàng</th>
                <th>Ngày</th>
                <th>Khuyến mãi</th>
                <th>Trạng thái</th>
                <th>Tương tác</th>
              </tr>
            </thead>
            <tbody>
              {accountGifts.map((gift) => (
                <tr key={gift.id}>
                  <td>{gift.stt}</td>
                  <td>
                    <Link
                      to={`/AdminAccountGift/edit/${gift.id}`}
                      className="gift-link"
                    >
                      {gift.id}
                    </Link>
                  </td>
                  <td>{gift.account}</td>
                  <td title={gift.gift}>
                    {/* Xử lý hiển thị thông tin của gift - rút gọn nếu quá dài */}
                    {gift.gift && gift.gift.length > 30
                      ? gift.gift.slice(0, 30) + "..."
                      : gift.gift}
                  </td>
                  <td>{gift.order}</td>
                  <td>{gift.date}</td>
                  <td>{gift.discount}</td>
                  <td>{gift.status}</td>
                  <td>
                    <Link to={`/AdminAccountGift/edit/${gift.id}`}>
                      <button>Chỉnh Sửa</button>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedGift(gift);
                        setConfirmModal(true);
                      }}
                    >
                      {gift.status === "ENABLE" ? "Vô hiệu" : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Modal Xác Nhận */}
      {confirmModal && (
        <div className="modal">
          <div className="modal-content">
            <p>
              Bạn có chắc chắn muốn{" "}
              {selectedGift?.status === "ENABLE" ? "vô hiệu hóa" : "kích hoạt"}{" "}
              quà tặng này không?
            </p>
            <button
              onClick={() => {
                handleToggleStatus();
                setConfirmModal(false);
              }}
            >
              Xác nhận
            </button>
            <button onClick={() => setConfirmModal(false)}>Hủy</button>
          </div>
        </div>
      )}

      {/* Modal Kết Quả */}
      {resultModal && (
        <div className="modal">
          <div className="modal-content">
            <p>{backendMessage}</p>
            <button onClick={() => setResultModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountGift;
