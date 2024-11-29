import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import returnIcon from './ImageDashboard/return-button.png';

const AdminReview = () => {
  const [reviewList, setReviewList] = useState([]);
  const [newReview, setNewReview] = useState({
    comment: "",
    rating: null,
    status: "ENABLE",
    accountID: { accountID: "" },
    flower: { flowerID: null },
    image: "",
    date: "", // Đặt lại giá trị của date thành rỗng
  });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/admin/review",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách đánh giá.");
        }

        const data = await response.json();
        setReviewList(data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchReviews();
  }, [accesstoken]);
  const handleUploadImage = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch("http://localhost:8080/api/v1/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accesstoken}` },
        credentials: "include",
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        const uploadedImageUrl = data.DT; // URL ảnh trả về từ API
        if (!uploadedImageUrl) {
          console.error("Image URL is empty");
          return;
        }
  
        // Cập nhật URL ảnh đã upload
        setImageUrl(uploadedImageUrl);
  
        // Liên kết ảnh vào review mới
        setNewReview((prev) => ({ ...prev, image: uploadedImageUrl }));
  
        console.log("Upload successful:", uploadedImageUrl);
      } else {
        console.error("Upload failed:", data.EM || "Unknown error");
      }
    } catch (err) {
      console.error("Upload error:", err.message);
    }
  };
  
  
  const getChartData = () => {
    const ratingCounts = [0, 0, 0, 0, 0];
    reviewList.forEach((review) => {
      if (review.rating) {
        ratingCounts[review.rating - 1] += 1;
      }
    });

    return {
      labels: ['1 sao', '2 sao', '3 sao', '4 sao', '5 sao'],
      datasets: [
        {
          data: ratingCounts,
          backgroundColor: ['red', 'orange', 'yellow', 'lightgreen', 'green'],
          hoverBackgroundColor: ['darkred', 'darkorange', 'gold', 'darkgreen', 'darkgreen'],
        },
      ],
    };
  };

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/review/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );
  
      if (response.ok) {
        setReviewList((prevReviews) =>
          prevReviews.map((review) =>
            review.reviewID === id ? { ...review, status: "DISABLE" } : review
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa đánh giá.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/review/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );
  
      if (response.ok) {
        setReviewList((prevReviews) =>
          prevReviews.filter((review) => review.reviewID !== id)
        );
      } else {
        throw new Error("Không thể xóa đánh giá.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  

  const handleSave = async (id, reviewData) => {
    try {
      // Nếu có ảnh mới được tải lên, cập nhật lại URL ảnh
      if (imageUrl) {
        reviewData.image = imageUrl;
      }
      if (!reviewData.accountID.accountID) {
        throw new Error("ID Tài Khoản không được để trống.");
      }
      if (!reviewData.flower.flowerID) {
        throw new Error("ID Hoa không được để trống.");
      }
  
      // Định dạng ngày nếu có giá trị ngày
      if (reviewData.date && !isNaN(new Date(reviewData.date).getTime())) {
        reviewData.date = new Date(reviewData.date).toISOString().slice(0, 19);
      }
  
      // Đảm bảo cấu trúc JSON khớp với yêu cầu API
      const formattedReviewData = {
        reviewID: id,
        comment: reviewData.comment,
        rating: reviewData.rating,
        status: reviewData.status,
        accountID: { accountID: reviewData.accountID.accountID },
        flower: { flowerID: reviewData.flower.flowerID },
        image: reviewData.image,
        date: reviewData.date,
      };
  
      // In JSON data trước khi gửi
      console.log("JSON data to be sent via PUT:", JSON.stringify(formattedReviewData, null, 2));
  
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/review/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formattedReviewData),
        }
      );
  
      if (response.ok) {
        const updatedReview = await response.json();
        setReviewList((prev) =>
          prev.map((review) =>
            review.reviewID === id ? updatedReview : review
          )
        );
        setEditingReviewId(null);
        console.log("Cập nhật đánh giá thành công!");
      } else {
        const errorData = await response.json();
        console.error("Cập nhật thất bại:", errorData.EM || "Unknown error");
      }
    } catch (err) {
      console.error("Cập nhật thất bại:", err.message);
    }
  };
  
  

  const handleCreate = async () => {
    try {
      // Kiểm tra nếu `newReview.date` không hợp lệ
      if (!newReview.date || isNaN(new Date(newReview.date).getTime())) {
        throw new Error("Date không hợp lệ. Hãy nhập đúng định dạng YYYY-MM-DD.");
      }
      if (!newReview.accountID.accountID) {
        throw new Error("ID Tài Khoản không được để trống.");
      }
      if (!newReview.flower.flowerID) {
        throw new Error("ID Hoa không được để trống.");
      }
  
      // Định dạng ngày theo yêu cầu API (YYYY-MM-DDTHH:mm:ss)
      const formattedDate = new Date(newReview.date).toISOString().slice(0, 19);
  
      const reviewData = {
        ...newReview,
        date: formattedDate, // Gắn giá trị đã định dạng
      };
  
      // In ra JSON trước khi gửi
      console.log("Review data to be sent:", JSON.stringify(reviewData, null, 2));
  
      const response = await fetch("http://localhost:8080/api/v1/admin/review", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });
  
      if (response.ok) {
        const createdReview = await response.json();
        setReviewList([...reviewList, createdReview]);
        setNewReview({
          comment: "",
          rating: null,
          status: "ENABLE",
          accountID: { accountID: "" },
          flower: { flowerID: null },
          image: "",
          date: "",
        });
      } else {
        throw new Error("Không thể tạo đánh giá.");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    }
  };
  
  
  

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const renderStars = (rating, onClick, editable = true) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={editable ? () => onClick(i) : null}
          style={{
            color: i <= rating ? "gold" : "lightgray",
            cursor: editable ? "pointer" : "default",
            fontSize: "40px",
          }}
        >
          ★
        </span>
      );
    }
    return <div>{stars}</div>;
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
        <h2>Quản Lý Đánh Giá</h2>
      </div>
  
      <h3>Thêm Đánh Giá Mới</h3>
      <div>
        <label>Bình luận: </label>
        <input
          value={newReview.comment}
          onChange={(e) =>
            setNewReview((prev) => ({ ...prev, comment: e.target.value }))
          }
        />

        <label>Đánh Giá: </label>
        {renderStars(newReview.rating || 0, (rating) =>
          setNewReview((prev) => ({ ...prev, rating }))
        )}

        <label>ID Tài Khoản: </label>
        <input
          type="number"
          value={newReview.accountID.accountID}
          onChange={(e) =>
            setNewReview((prev) => ({
              ...prev,
              accountID: { accountID: e.target.value },
            }))
          }
        />

        <label>ID Hoa: </label>
        <input
          type="number"
          value={newReview.flower.flowerID}
          onChange={(e) =>
            setNewReview((prev) => ({
              ...prev,
              flower: { flowerID: e.target.value },
            }))
          }
        />

          <label>Hình Ảnh: </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleUploadImage}>Tải ảnh lên</button>

          {/* Hiển thị ảnh đã upload */}
          {imageUrl && (
            <div>
              <p>Ảnh đã tải lên:</p>
              <img src={imageUrl} alt="Uploaded" style={{ width: 150, height: 100 }} />
            </div>
          )}

        <label>Trạng Thái: </label>
        <select
          value={newReview.status}
          onChange={(e) =>
            setNewReview((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>
        <label>Ngày Tạo: </label>
        <input
          type="date"
          value={newReview.date}
          onChange={(e) =>
            setNewReview((prev) => ({ ...prev, date: e.target.value }))
          }
        />

        <button onClick={handleCreate}>Thêm</button>
      </div>
  
      {error && <p style={{ color: "red" }}>{error}</p>}
      {reviewList.length === 0 ? (
        <p>Không có đánh giá nào.</p>
      ) : (
        <div>
          <h3>Danh Sách Đánh Giá</h3>
          <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
  <tr>
    <th>ID Đánh Giá</th>
    <th>ID Tài Khoản</th>
    <th>ID Hoa</th>
    <th>Hình Ảnh</th> {/* Cột Hình Ảnh */}
    <th>Bình Luận</th>
    <th>Đánh Giá</th>
    <th>Ngày Tạo</th>
    <th>Trạng Thái</th>
    <th>Thao Tác</th>
  </tr>
</thead>
<tbody>
  {reviewList.map((review) => (
    <tr key={review.reviewID}>
      <td>{review.reviewID}</td>
      <td>
        {editingReviewId === review.reviewID ? (
          <input
            type="number"
            value={review.accountID.accountID}
            onChange={(e) =>
              setReviewList((prev) =>
                prev.map((r) =>
                  r.reviewID === review.reviewID
                    ? { ...r, accountID: { accountID: e.target.value } }
                    : r
                )
              )
            }
          />
        ) : (
          review.accountID.accountID
        )}
      </td>
      <td>
  {editingReviewId === review.reviewID ? (
    <input
      type="number"
      value={review.flower.flowerID}
      onChange={(e) =>
        setReviewList((prev) =>
          prev.map((r) =>
            r.reviewID === review.reviewID
              ? { ...r, flower: { flowerID: e.target.value } }
              : r
          )
        )
      }
    />
  ) : (
    review.flower.flowerID
  )}
</td>
      <td>
  {editingReviewId === review.reviewID ? (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUploadImage}>Tải ảnh lên</button>
      {imageUrl && (
        <div>
          <p>Ảnh đã tải lên:</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            style={{ width: 100, height: 100 }}
          />
        </div>
      )}
    </div>
  ) : (
    review.image ? (
      <img src={review.image} alt="Review" style={{ width: 100, height: 100 }} />
    ) : (
      <span>Chưa có ảnh</span>
    )
  )}
</td>
      <td>
        {editingReviewId === review.reviewID ? (
          <input
            value={review.comment}
            onChange={(e) =>
              setReviewList((prev) =>
                prev.map((r) =>
                  r.reviewID === review.reviewID
                    ? { ...r, comment: e.target.value }
                    : r
                )
              )
            }
          />
        ) : (
          review.comment
        )}
      </td>
      <td>
        {editingReviewId === review.reviewID
          ? renderStars(review.rating, (rating) =>
              setReviewList((prev) =>
                prev.map((r) =>
                  r.reviewID === review.reviewID
                    ? { ...r, rating }
                    : r
                )
              )
            )
          : renderStars(review.rating, null, false)}
      </td>
      <td>
  {editingReviewId === review.reviewID ? (
    <input
      type="date"
      value={
        review.date
          ? new Date(review.date).toISOString().slice(0, 10)
          : ""
      }
      onChange={(e) =>
        setReviewList((prev) =>
          prev.map((r) =>
            r.reviewID === review.reviewID
              ? { ...r, date: e.target.value }
              : r
          )
        )
      }
    />
  ) : (
    review.date ? new Date(review.date).toLocaleDateString("en-GB") : ""
  )}
</td>
      <td>
        {editingReviewId === review.reviewID ? (
          <select
            value={review.status}
            onChange={(e) =>
              setReviewList((prev) =>
                prev.map((r) =>
                  r.reviewID === review.reviewID
                    ? { ...r, status: e.target.value }
                    : r
                )
              )
            }
          >
            <option value="ENABLE">Enable</option>
            <option value="DISABLE">Disable</option>
          </select>
        ) : (
          review.status
        )}
      </td>
      <td>
        {editingReviewId === review.reviewID ? (
          <>
            <button
              onClick={() =>
                handleSave(review.reviewID, review)
              }
            >
              Lưu
            </button>
            <button onClick={() => setEditingReviewId(null)}>
              Hủy
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditingReviewId(review.reviewID)}
            >
              Sửa
            </button>
            <button onClick={() => handleDeleteSoft(review.reviewID)}>
              Vô hiệu hóa
            </button>
            <button onClick={() => handleDeleteHard(review.reviewID)}>
              Xóa
            </button>
          </>
        )}
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
  
};

export default AdminReview;
