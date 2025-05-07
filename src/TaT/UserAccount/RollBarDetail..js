import React, { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import "./RollBarDetail.css";
Modal.setAppElement("#root");

const WheelComponent = () => {
  const [data, setData] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [days, setDays] = useState(0);
  const [rolled, setRolled] = useState(false);
  const [requiredDays, setRequiredDays] = useState(0);
  const [canSpin, setCanSpin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wonPrize, setWonPrize] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [gifts, setGifts] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [wheelColor, setWheelColor] = useState("#FFDDC1");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [accountgift, setAccountgift] = useState([]);
  const { id } = useParams();
  useEffect(() => {
    reloadData();
  }, [id]);
  const reloadData = () => {
    const token = localStorage.getItem("access_token");
    axios
      .get(`http://localhost:8080/rollbar/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { dayNeeds, rollBarInfoDTO, rolled } = response.data;
        const giftList = rollBarInfoDTO.giftInfoDTOList;

        const wheelData = giftList.map((gift) => ({
          option: gift.name,
          typegift: gift.typegift,
          giftId: gift.id,
        }));

        setData(wheelData);
        setGifts(giftList);
        setDays(dayNeeds);
        setRequiredDays(rollBarInfoDTO.days);
        setCanSpin(dayNeeds >= rollBarInfoDTO.days && rolled === false);
        setWheelColor(rollBarInfoDTO.color || "#FFDDC1");
        setLoading(false);
        setRolled(rolled);
      })
      .catch((error) => {
        console.error("Error loading rollbar data", error);
        setLoading(false);
      });
  };

  const handleSpinClick = () => {
    if (!canSpin || mustSpin || gifts.length === 0) return;

    const totalPercent = gifts.reduce((sum, gift) => sum + gift.percent, 0);
    const rand = Math.random() * totalPercent;
    let cumulative = 0;
    let selectedIndex = 0;

    for (let i = 0; i < gifts.length; i++) {
      cumulative += gifts[i].percent;
      if (rand <= cumulative) {
        selectedIndex = i;
        break;
      }
    }

    setPrizeNumber(selectedIndex);
    setMustSpin(true);
    setWonPrize(null);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const accountgiftid = accountgift.id;
    console.log(accountgiftid);
    const token = localStorage.getItem("access_token");
    axios
      .post(
        `http://localhost:8080/attendance/sendInfo/${accountgiftid}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setShowSubmit(true); // ✅ Hiện modal thành công
        setModalIsOpen(false);
        reloadData();
        setTimeout(() => setShowSubmit(false), 3000); // Tự ẩn sau 3s
      })
      .catch((error) => {
        console.error("Lỗi khi gửi thông tin:", error);
        alert("Có lỗi xảy ra khi gửi thông tin.");
      });
  };

  const submitGiftInfo = (giftId) => {
    const token = localStorage.getItem("access_token");
    axios
      .post(
        `http://localhost:8080/attendance/roll/${id}?giftid=${giftId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setAccountgift(response.data.accountGift);
        reloadData();
      })
      .catch((error) => {
        console.error("Error submitting gift information", error);
      });
  };

  if (loading) return <p>Đang tải...</p>;

  const selectedPrize = gifts[prizeNumber];

  return (
    <div className="wheel-container">
      <h2 className="wheel-title">Vòng quay phần thưởng</h2>
      <p className="days-info">
        Số ngày điểm danh cần<n></n>: {days} / {requiredDays}
      </p>
      {mustSpin && <p className="spin-warning">Đang quay...</p>}
      {rolled && (
        <p className="spin-limit">
          Tháng này bạn đã quay, hãy đợi tháng sau nhé!
        </p>
      )}

      <div className="wheel-wrapper">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={() => {
            setMustSpin(false);
            setWonPrize(data[prizeNumber].option);
            setModalIsOpen(true);
            submitGiftInfo(data[prizeNumber].giftId);
          }}
          backgroundColors={[wheelColor || "#FFDDC1", "#FFFFFF"]} // Đổi màu vòng quay
          textColors={["#000000"]}
        />
      </div>

      <button
        className="spin-button"
        onClick={handleSpinClick}
        disabled={mustSpin || !canSpin}
      >
        {mustSpin ? "Đang quay..." : "Quay"}
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="account-gift-modal-content"
        overlayClassName="modal-overlay"
      >
        <h2 className="account-gift-modal-title">🎉 Chúc mừng!</h2>
        <p className="account-gift-modal-message">
          Bạn đã trúng: <strong>{wonPrize}</strong>!
        </p>
        {selectedPrize && selectedPrize.typegift === "discount" ? (
          <div className="discount-info">
            <p>Hãy đến trang điểm danh để xem chi tiết phần thưởng.</p>
            <Link to="/account/attendance" className="attendance-link">
              Điểm danh tại đây
            </Link>
          </div>
        ) : (
          <form className="gift-info-form" onSubmit={handleFormSubmit}>
            <label>
              Họ tên:
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Số điện thoại:
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Địa chỉ:
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Ghi chú:
              <textarea
                name="note"
                value={formData.note}
                onChange={handleFormChange}
              ></textarea>
            </label>
            <button type="submit">Gửi thông tin</button>
          </form>
        )}
        <button onClick={closeModal} className="account-gift-modal-close-button">
          Đóng
        </button>
      </Modal>
      {showSubmit && (
                <div className="gift-account-modal-success">
                  🎉 Thông tin đã được gửi thành công!
                </div>
              )}
    </div>
  );
};

export default WheelComponent;
