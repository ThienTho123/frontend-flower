import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./Attendance.css";

const Attendance = () => {
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showSuccess, setShowSuccess] = useState(false); // 👈 New

  const today = dayjs();

  const reloadAttendance = () => {
    const token = localStorage.getItem("access_token");

    axios.get("http://localhost:8080/attendance", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        const list = response.data.attendanceList || [];
        const filtered = list.filter(item => {
          const [year, month] = item.date;
          return year === selectedDate.year() && month === selectedDate.month() + 1;
        });
        const dates = filtered.map(item => item.date[2]);
        setAttendanceDates(dates);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu điểm danh:", error);
      });
  };

  useEffect(() => {
    reloadAttendance();

    const totalDays = selectedDate.daysInMonth();
    const startDay = dayjs(`${selectedDate.year()}-${selectedDate.month() + 1}-01`).day();
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
    setSelectedDate(prev => prev.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => prev.add(1, "month"));
  };

  const handleClickToday = () => {
    const todayDate = today.date();

    if (attendanceDates.includes(todayDate)) {
      console.log("Đã điểm danh hôm nay rồi.");
      return;
    }

    const token = localStorage.getItem("access_token");

    axios.post("http://localhost:8080/attendance/check", {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        reloadAttendance();
        setShowSuccess(true); // 👈 Hiện thông báo
        setTimeout(() => setShowSuccess(false), 3000); // Tự ẩn sau 3s
      })
      .catch((error) => {
        console.error("Lỗi khi điểm danh:", error);
      });
  };

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
          <div key={index} className="weekday">{day}</div>
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
            isToday ? "today" : ""
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
        <div className="success-banner">
          ✅ Điểm danh thành công!
        </div>
      )}
    </div>
  );
};

export default Attendance;
