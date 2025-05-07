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
  const [wheelColor, setWheelColor] = useState("#FFDDC1");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: ""
  });
  const [accountgift, setAccountgift] = useState([]);
  const { id } = useParams();

  useEffect(() => {
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
          typegift: gift.typegift, // Thêm typegift để kiểm tra
          giftId: gift.id // Lưu giftId để gửi lên backend
        }));

        setData(wheelData);
        setGifts(giftList);
        setDays(dayNeeds);
        setRequiredDays(rollBarInfoDTO.days);
        setCanSpin(dayNeeds >= rollBarInfoDTO.days && rolled === false);
        setWheelColor(rollBarInfoDTO.color || "#FFDDC1");
        setLoading(false);
        setRolled(rolled)
      })
      .catch((error) => {
        console.error("Error loading rollbar data", error);
        setLoading(false);
      });
  }, [id]);

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
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const accountgiftid = accountgift.id;
    console.log(accountgiftid);
    const token = localStorage.getItem("access_token");
    axios.post(`http://localhost:8080/attendance/sendInfo/${accountgiftid}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log("Gửi thông tin thành công:", response.data);
      alert("Thông tin đã được gửi thành công!");
      setModalIsOpen(false);
    })
    .catch(error => {
      console.error("Lỗi khi gửi thông tin:", error);
      alert("Có lỗi xảy ra khi gửi thông tin.");
    });
  };
  

  const submitGiftInfo = (giftId) => {
    const token = localStorage.getItem("access_token");
    axios
      .post(`http://localhost:8080/attendance/roll/${id}?giftid=${giftId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAccountgift(response.data.accountGift);
      })
      .catch((error) => {
        console.error("Error submitting gift information", error);
      });
};


  if (loading) return <p>Đang tải...</p>;

  const selectedPrize = gifts[prizeNumber];

  return (
    <div style={{ textAlign: "center", paddingTop: 50 }}>
      <h2>Vòng quay phần thưởng</h2>
      <p>Ngày tham gia: {days} / {requiredDays}</p>
      {rolled && <p style={{ color: "red" }}>Tháng này bạn đã quay, hãy đợi tháng sau nhé!</p>}

      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={data}
        onStopSpinning={() => {
          setMustSpin(false);
          setWonPrize(data[prizeNumber].option);
          setModalIsOpen(true);

          // Sau khi quay xong, gửi thông tin phần quà trúng thưởng đến backend
          const giftId = data[prizeNumber].giftId;
          submitGiftInfo(giftId);
        }}
        backgroundColors={[wheelColor, "#ffffff"]}
        textColors={["#000"]}
      />

      <button
        onClick={handleSpinClick}
        disabled={mustSpin || !canSpin}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: "1rem",
          cursor: mustSpin ? "not-allowed" : "pointer",
          backgroundColor: canSpin ? "#4CAF50" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        {mustSpin ? "Đang quay..." : "Quay"}
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-rollbar-content"
        overlayClassName="modal-overlay"
      >
        <h2>🎉 Chúc mừng!</h2>
        <p>Bạn đã trúng: <strong>{wonPrize}</strong>!</p>

        {/* Kiểm tra phần quà */}
        {selectedPrize && selectedPrize.typegift === "discount" ? (
          <div>
            <p>Hãy đến trang điểm danh để xem chi tiết phần thưởng.</p>
            <Link to="/account/attendance" style={{ textDecoration: "underline" }}>
              Điểm danh tại đây
            </Link>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <div>
              <label>Họ tên:</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label>Số điện thoại:</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label>Địa chỉ:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label>Ghi chú:</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleFormChange}
              />
            </div>
            <button type="submit">Gửi thông tin</button>
          </form>
        )}

        <button onClick={closeModal} className="modal-rollbar-close-button">
          Đóng
        </button>
      </Modal>
    </div>
  );
};

export default WheelComponent;
