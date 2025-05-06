import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RollBar.css"; // Import CSS tách riêng
import { Link } from "react-router-dom";

const RollBar = () => {
  const [rollBarInfo, setRollBarInfo] = useState([]);

  const getRollBarInfo = () => {
    const token = localStorage.getItem("access_token");

    axios
      .get("http://localhost:8080/rollbar/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const list = response.data.rollBarInfoDTOS || [];
        console.log(list);
        setRollBarInfo(list);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu vòng quay:", error);
      });
  };

  useEffect(() => {
    getRollBarInfo();
  }, []);

  return (
    <div className="rollbar-container">
      <h2 className="rollbar-title">🎡 Danh sách Vòng Quay</h2>
      <div className="rollbar-list">
        {rollBarInfo.length === 0 ? (
          <p>Không có dữ liệu.</p>
        ) : (
          rollBarInfo.map((rollBar) => (
            <Link
              to={`/rollbar/${rollBar.id}`}
              key={rollBar.id}
              className="rollbar-link"
            >
              <div
                className="rollbar-card"
                style={{
                  background: `linear-gradient(135deg, ${rollBar.color}, #fff8f8)`,
                }}
              >
                <h3>{rollBar.name}</h3>
                <p>
                  <strong>🗓️ Số ngày:</strong> {rollBar.days}
                </p>

                <h4>🎁 Giải thưởng tiêu biểu:</h4>
                <ul className="gift-list">
                  {rollBar.giftInfoDTOList.slice(0, 3).map((gift) => (
                    <li key={gift.id}>
                      <strong>{gift.name}</strong> ({gift.typegift}) - Giảm{" "}
                      {gift.discountpercent}%
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RollBar;
