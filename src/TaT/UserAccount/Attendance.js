import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./Attendance.css";

const Attendance = () => {
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showSuccess, setShowSuccess] = useState(false); // 👈 New
  const [accountGifts, setAccountGifts] = useState([]);
  const today = dayjs();
  const [showSubmit, setShowSubmit] = useState(false);
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const reloadAttendance = () => {
    const token = localStorage.getItem("access_token");

    axios
      .get("http://localhost:8080/attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const list = response.data.attendanceList || [];
        const filtered = list.filter((item) => {
          const [year, month] = item.date;
          return (
            year === selectedDate.year() && month === selectedDate.month() + 1
          );
        });
        const dates = filtered.map((item) => item.date[2]);
        setAttendanceDates(dates);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu điểm danh:", error);
      });
  };

  const getAccountGifts = () => {
    const token = localStorage.getItem("access_token");

    axios
      .get("http://localhost:8080/attendance/gift", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const gifts = response.data.accountGifts || [];
        console.log("gifts: ", gifts);

        setAccountGifts(gifts);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu quà:", error);
      });
    console.log("gifts: ", accountGifts);
  };

  useEffect(() => {
    reloadAttendance();
    getAccountGifts();
    const totalDays = selectedDate.daysInMonth();
    const startDay = dayjs(
      `${selectedDate.year()}-${selectedDate.month() + 1}-01`
    ).day();
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    setDaysInMonth(days);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setSelectedDate((prev) => prev.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => prev.add(1, "month"));
  };

  const handleClickToday = () => {
    const todayDate = today.date();

    if (attendanceDates.includes(todayDate)) {
      console.log("Đã điểm danh hôm nay rồi.");
      return;
    }

    const token = localStorage.getItem("access_token");

    axios
      .post(
        "http://localhost:8080/attendance/check",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        reloadAttendance();
        setShowSuccess(true); // 👈 Hiện thông báo
        setTimeout(() => setShowSuccess(false), 3000); // Tự ẩn sau 3s
      })
      .catch((error) => {
        console.error("Lỗi khi điểm danh:", error);
      });
  };
  const formatDate = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length !== 3) return "-";

    const [year, month, day] = dateArray;

    // Đảm bảo có định dạng dd/MM/yyyy với số có 2 chữ số
    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");

    return `${dd}/${mm}/${year}`;
  };
  const formatDateTime = (dateTimeArray) => {
    if (!Array.isArray(dateTimeArray) || dateTimeArray.length < 6) return "-";
    const [year, month, day, hour, minute, second] = dateTimeArray;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year} ${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}:${String(second).padStart(2, "0")}`;
  };

  const handleFormSubmit = (e, giftId) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    axios
      .post(`http://localhost:8080/attendance/sendInfo/${giftId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setShowForm(null);
        setFormData({ name: "", phone: "", address: "", note: "" });
        setShowSubmit(true); // ✅ Hiện modal thành công
        getAccountGifts(); // Tải lại danh sách quà
        setTimeout(() => setShowSubmit(false), 3000); // Tự ẩn sau 3s
      })
      .catch((error) => console.error("Lỗi khi gửi thông tin:", error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  function showCopyToast() {
    const toast = document.createElement("div");
    toast.className = "toast-copy";
    toast.innerText = "✅ Mã giảm giá đã được sao chép!";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="calendar-container">
      <h2>📅 Lịch điểm danh - {selectedDate.format("MM/YYYY")}</h2>

      <div className="month-navigation">
        <button onClick={handlePrevMonth}>⬅️ Tháng trước</button>
        <button onClick={handleNextMonth}>Tháng sau ➡️</button>
      </div>

      <div className="weekdays">
        {weekDays.map((day, index) => (
          <div key={index} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {daysInMonth.map((day, index) => {
          const isToday =
            day &&
            selectedDate.month() === today.month() &&
            selectedDate.year() === today.year() &&
            day === today.date();

          const isAttended = day && attendanceDates.includes(day);

          const classNames = [
            "calendar-day",
            isAttended ? "attended" : "",
            isToday ? "today" : "",
          ].join(" ");

          return (
            <div
              key={index}
              className={classNames}
              onClick={isToday ? handleClickToday : undefined}
              title={isToday ? "Bấm để điểm danh hôm nay" : ""}
            >
              {day || ""}
            </div>
          );
        })}
      </div>

      {/* ✅ Hiển thị layout khi điểm danh thành công */}
      {showSuccess && (
        <div className="success-banner">✅ Điểm danh thành công!</div>
      )}

      <div className="account-gift">
        <h3>🎁 Quà bạn nhận được:</h3>
        {accountGifts.length === 0 ? (
          <p>Chưa có quà nào.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Tên quà</th>
                <th>Mô tả</th>
                <th>Mã giảm giá</th>
                <th>Hoa</th>
              </tr>
            </thead>
            <tbody>
              {accountGifts.map((gift, index) => {
                const discount = gift.accountGift.discount;
                const order = gift.accountGift.order;

                return (
                  <tr key={index}>
                    <td>{formatDate(gift.accountGift.date)}</td>
                    <td>
                      {gift.accountGift.gift.typeGift !== "discount" &&
                      !gift.accountGift.order ? (
                        <span
                          style={{ color: "blue", cursor: "pointer" }}
                          onClick={() => {
                            setShowForm(gift.accountGift.id);
                          }}
                        >
                          {gift.accountGift.gift?.name || "-"}
                        </span>
                      ) : (
                        gift.accountGift.gift?.name || "-"
                      )}
                    </td>
                    <td>{gift.accountGift.gift?.description || "-"}</td>

                    {/* ✅ Discount có tooltip + click để copy (hiện toast) */}
                    <td>
                      {discount ? (
                        <div className="tooltip-wrapper">
                          <span
                            className="discount-code"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                discount.discountcode
                              );
                              showCopyToast();
                            }}
                          >
                            {discount.discountcode}
                          </span>
                          <div className="tooltip-box">
                            <p>
                              <strong>Hết hạn:</strong>{" "}
                              {formatDateTime(discount.endDate)}
                            </p>
                            <p>
                              <strong>Dành cho:</strong> {gift.disfor || "-"}
                            </p>
                            <p>
                              <strong>Giảm:</strong>{" "}
                              {discount.discountPercent || "-"}%
                            </p>
                            <p>
                              <strong>Tình trạng:</strong>{" "}
                              {discount.status || "-"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* ✅ Order chuyển trang */}
                    <td>
                      {order ? (
                        <a
                          href={`/account/history/${order.orderID}`}
                          style={{
                            color: "green",
                            textDecoration: "underline",
                          }}
                        >
                          {order.orderID}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
              {showForm && (
                <>
                  <div
                    className="gift-account-form-overlay"
                    onClick={() => setShowForm(null)}
                  ></div>
                  <div className="gift-account-form">
                    <h4>Nhập thông tin nhận quà</h4>
                    <form onSubmit={(e) => handleFormSubmit(e, showForm)}>
                      <input
                        type="text"
                        name="name"
                        placeholder="Tên"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="phone"
                        placeholder="Số điện thoại"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="address"
                        placeholder="Địa chỉ"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                      <textarea
                        name="note"
                        placeholder="Ghi chú"
                        value={formData.note}
                        onChange={handleInputChange}
                      />
                      <button type="submit">Gửi</button>
                      <button
                        type="button"
                        className="gift-close-button"
                        onClick={() => setShowForm(null)}
                      >
                        Đóng
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* Thông báo thành công */}
              {showSubmit && (
                <div className="gift-account-modal-success">
                  🎉 Thông tin đã được gửi thành công!
                </div>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Attendance;
