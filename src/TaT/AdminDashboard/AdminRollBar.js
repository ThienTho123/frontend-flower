import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import returnIcon from "./ImageDashboard/return-button.png";
import plus from "./ImageDashboard/plus.png";

const AdminRollBar = () => {
  const [rollBars, setRollBars] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [selectedRollBar, setSelectedRollBar] = useState(null);
  const [backendMessage, setBackendMessage] = useState("");
  // State mới để lưu trữ dữ liệu cho dropdown
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [typeGifts, setTypeGifts] = useState([]);

  useEffect(() => {
    fetchRollBars();
  }, []);

  const fetchRollBars = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8080/adminrollbar",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );
      
      console.log("API Response:", response.data);
      
      // Lấy danh sách rollBar từ response
      const rawRollBarList = response.data?.rollBarList || [];
      
      if (!Array.isArray(rawRollBarList)) {
        console.error("Roll bar data is not an array:", rawRollBarList);
        setRollBars([]);
        setLoading(false);
        return;
      }

      // Xử lý danh sách rollBar
      const updatedRollBars = rawRollBarList.map((item, index) => ({
        stt: index + 1,
        id: item.rollBar.id,
        name: item.rollBar.name,
        color: item.rollBar.color,
        days: item.rollBar.days,
        status: item.rollBar.status,
        gifts: item.gifts || [],
        flowers: item.flowers || [],
        flowerInfos: item.flowerInfos || []
      }));

      setRollBars(updatedRollBars);
      
      // Lưu trữ dữ liệu cho dropdown từ response
      setCategories(response.data?.categories || []);
      setTypes(response.data?.types || []);
      setPurposes(response.data?.purposes || []);
      setTypeGifts(response.data?.typeGifts || []);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching roll bars:", error);
      setError("Không thể tải danh sách Roll Bar");
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedRollBar) return;
    try {
      const response = await axios.delete(
        `http://localhost:8080/adminrollbar/${selectedRollBar.id}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      setBackendMessage(response.data || "Thao tác thành công!");
      setResultModal(true);
      fetchRollBars(); // Tải lại danh sách sau khi cập nhật
    } catch (err) {
      console.error("Error toggling status:", err);
      setBackendMessage(err.response?.data || "Lỗi không xác định");
      setResultModal(true);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
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
        <h2>Quản Lý Roll Bar - Admin</h2>
        <Link to={`/AdminRollBar/new-rollbar`}>
          <img
            src={plus}
            alt="Thêm mới"
            className="return-button"
            style={{ cursor: "pointer" }}
          />
        </Link>
      </div>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : rollBars.length === 0 ? (
        <p>Không có Roll Bar nào.</p>
      ) : (
        <>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>STT</th>
                <th>ID</th>
                <th>Tên Roll Bar</th>
                <th>Số ngày điểm danh</th>
                <th>Màu sắc</th>
                <th>Trạng thái</th>
                <th>Số quà tặng</th>
                <th>Tương tác</th>
              </tr>
            </thead>
            <tbody>
              {rollBars.map((rollBar) => (
                <tr key={rollBar.id}>
                  <td>{rollBar.stt}</td>
                  <td>
                    <Link
                      to={`/StaffRollBar/edit/${rollBar.id}`}
                      className="link"
                    >
                      {rollBar.id}
                    </Link>
                  </td>
                  <td title={rollBar.name}>
                    {rollBar.name.length > 30
                      ? rollBar.name.slice(0, 30) + "..."
                      : rollBar.name}
                  </td>
                  <td>{rollBar.days}</td>
                  <td>
                    <div 
                      style={{ 
                        backgroundColor: rollBar.color, 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%',
                        margin: '0 auto' 
                      }}
                    />
                  </td>
                  <td>{rollBar.status}</td>
                  <td>{rollBar.gifts ? rollBar.gifts.length : 0}</td>
                  <td>
                    <Link to={`/AdminRollBar/edit/${rollBar.id}`}>
                      <button>Chỉnh Sửa</button>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedRollBar(rollBar);
                        setConfirmModal(true);
                      }}
                    >
                      {rollBar.status === "ENABLE" ? "Vô hiệu hóa" : "Kích hoạt"}
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
              Bạn có chắc chắn muốn {selectedRollBar?.status === "ENABLE" ? "vô hiệu hóa" : "kích hoạt"} Roll Bar này không?
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

export default AdminRollBar;