import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RollBar.css";
import { Link } from "react-router-dom";

const RollBar = () => {
  const [rollBarInfo, setRollBarInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRollBarInfo = () => {
    const token = localStorage.getItem("access_token");
    setLoading(true);

    axios
      .get("https://deploybackend-1ta9.onrender.com/rollbar/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const list = response.data.rollBarInfoDTOS || [];
        setRollBarInfo(list);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu vòng quay:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    getRollBarInfo();
  }, []);

  // Color palette for cards
  const getCardColor = (index) => {
    const colors = [
      { primary: "#FF9A9E", secondary: "#FECFEF" },
      { primary: "#A18CD1", secondary: "#FBC2EB" },
      { primary: "#FCCB90", secondary: "#D57EEB" },
      { primary: "#65B0E6", secondary: "#B2FFDA" },
      { primary: "#FF9F8B", secondary: "#FFC3A0" },
      { primary: "#5EE7DF", secondary: "#B490CA" },
    ];

    return colors[index % colors.length];
  };

  return (
    <div className="rollbar-container">
      <h2 className="rollbar-title">🎡 Danh sách Vòng Quay</h2>
      <div className="rollbar-list">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : rollBarInfo.length === 0 ? (
          <p>Không có dữ liệu vòng quay nào.</p>
        ) : (
          rollBarInfo.map((rollBar, index) => {
            const colors = getCardColor(index);
            return (
              <Link
                to={`/rollbar/${rollBar.id}`}
                key={rollBar.id}
                className="rollbar-link"
              >
                <div
                  className="rollbar-card"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}33, ${colors.secondary}33)`,
                    borderLeft: `4px solid ${colors.primary}`,
                  }}
                >
                  <h3>{rollBar.name}</h3>
                  <p>
                    <strong>🗓️ Số ngày:</strong> {rollBar.days}
                  </p>

                  <h4>🎁 Giải thưởng tiêu biểu:</h4>
                  <ul className="gift-list">
                    {rollBar.giftInfoDTOList &&
                    rollBar.giftInfoDTOList.length > 0 ? (
                      rollBar.giftInfoDTOList.slice(0, 3).map((gift) => (
                        <li key={gift.id}>
                          <strong>{gift.name}</strong> ({gift.typegift}) - Giảm{" "}
                          {gift.discountpercent}%
                        </li>
                      ))
                    ) : (
                      <li>Chưa có giải thưởng</li>
                    )}
                  </ul>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RollBar;
