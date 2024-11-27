import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2"; // Nhập biểu đồ tròn
import returnIcon from './ImageDashboard/return-button.png'; 

const AdminReview = () => {
  const [reviewList, setReviewList] = useState([]);
  const [newReview, setNewReview] = useState({
    comment: "",
    rating: null,
    status: "Enable",
    accountID: { accountID: "" },
    productID: null,
  });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

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
        setReviewList(data.Review || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchReviews();
  }, [accesstoken]);

  // Tính toán dữ liệu cho biểu đồ tròn
  const getChartData = () => {
    const ratingCounts = [0, 0, 0, 0, 0]; // Đếm số lượng đánh giá cho mỗi sao (1-5 sao)
    reviewList.forEach((review) => {
      if (review.rating) {
        ratingCounts[review.rating - 1] += 1; // Tăng số lượng theo số sao
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

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/review/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setReviewList((prevReviewList) =>
          prevReviewList.map((review) =>
            review.reviewID === id ? { ...review, status: 'Disable' } : review
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa đánh giá.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, reviewData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/review/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(reviewData),
        }
      );

      if (response.ok) {
        const updatedReview = await response.json();
        setReviewList((prevReviewList) =>
          prevReviewList.map((review) =>
            review.reviewID === id ? updatedReview : review
          )
        );
        setEditingReviewId(null);
      } else {
        throw new Error("Không thể cập nhật đánh giá.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const reviewData = {
        comment: newReview.comment,
        rating: newReview.rating,
        status: newReview.status,
        accountID: {
          accountID: newReview.accountID.accountID,
        },
        productID: newReview.productID,
      };
  
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
          status: "Enable",
          accountID: { accountID: "" },
          productID: null,
        });
      } else {
        throw new Error("Không thể tạo đánh giá.");
      }
    } catch (err) {
      setError(err.message);
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
        <label>Đánh Giá: </label>
        {renderStars(newReview.rating || 0, (rating) =>
          setNewReview((prev) => ({ ...prev, rating }))
        )}
        <label>Trạng thái: </label>
        <select
          value={newReview.status}
          onChange={(e) =>
            setNewReview((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {reviewList.length === 0 ? (
        <p>Không có đánh giá nào.</p>
      ) : (
        <div>
          <h3>Thống Kê Đánh Giá</h3>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID Đánh Giá</th>
                <th>ID Tài Khoản</th>
                <th>Tên Tài Khoản</th>
                <th>Bình luận</th>
                <th>Đánh Giá</th>
                <th>Ngày tạo</th>
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
                                ? {
                                    ...r,
                                    accountID: { accountID: e.target.value },
                                  }
                                : r
                            )
                          )
                        }
                      />
                    ) : (
                      review.accountID.accountID
                    )}
                  </td>
                  <td>{review.accountName}</td>
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
                              r.reviewID === review.reviewID ? { ...r, rating } : r
                            )
                          )
                        , true) 
                      : renderStars(review.rating, null, false) 
                    }
                  </td>
                  <td>{review.date ? new Date(review.date).toLocaleDateString("en-GB") : ""}</td>
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
                        <option value="Enable">Enable</option>
                        <option value="Disable">Disable</option>
                      </select>
                    ) : (
                      review.status
                    )}
                  </td>
                  <td>
                    {editingReviewId === review.reviewID ? (
                      <>
                        <button onClick={() => handleSave(review.reviewID, review)}>Lưu</button>
                        <button onClick={() => setEditingReviewId(null)}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingReviewId(review.reviewID)}>Sửa</button>
                        <button onClick={() => handleDelete(review.reviewID)}>Xóa</button>
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
