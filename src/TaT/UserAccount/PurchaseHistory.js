import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const PurchaseHistory = () => {
  const access_token = localStorage.getItem("access_token");
  const [billInfo, setBillInfo] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [isAddReviewVisible, setAddReviewVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const getPurchaseHistory = async () => {
    try {
      const response = await axios.get("http://localhost:8080/account/bought", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const { billInfo: rawBillInfo, review } = response.data;
      setReviews(review);

      const updatedBillInfo = rawBillInfo.map((item) => {
        const formattedDate = dayjs(item.date).format("YYYY-MM-DD HH:mm:ss");

        const relatedReview = review.find(
          (rev) => rev.productID && rev.productID.productID === item.productID
        );

        return {
          title: item.productTitle,
          price: item.cost,
          productID: item.productID,
          date: formattedDate,
          number: item.number,
          review: relatedReview ? relatedReview : false,
        };
      });

      setBillInfo(updatedBillInfo);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  const handleSubmitReview = async (comment, rating) => {
    try {
      await axios.post(
        "http://localhost:8080/review",
        {
          productID: { productID: selectedProductId },
          comment,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      getPurchaseHistory();
      handleAddReviewClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleUpdateReview = async (comment, rating) => {
    try {
      await axios.post(
        "http://localhost:8080/review",
        {
          productID: selectedProductId,
          comment,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      getPurchaseHistory();
      handleModalClose();
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  useEffect(() => {
    getPurchaseHistory();
  }, []);

  const handleReviewClick = (item) => {
    setSelectedReview(item);
    setSelectedProductId(item.productID);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedReview(null);
    setSelectedProductId(null);
  };

  const handleAddReviewClick = (productId) => {
    setSelectedProductId(productId);
    setAddReviewVisible(true);
  };

  const handleAddReviewClose = () => {
    setAddReviewVisible(false);
    setSelectedProductId(null);
  };
  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`http://localhost:8080/review/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      getPurchaseHistory(); 
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };
  return (
    <div>
      <h3>Lịch sử mua hàng</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn Giá</th>
            <th>Thời gian</th>
            <th>Đánh giá</th>
          </tr>
        </thead>
        <tbody>
          {billInfo.map((bill, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <a href={`/detail/${bill.productID}`} className="linkToProduct">
                  {bill.title}
                </a>
              </td>
              <td>{bill.number}</td>
              <td>{bill.price}</td>
              <td>{bill.date}</td>
              <td>
                {bill.review ? (
                  <button onClick={() => handleReviewClick(bill.review)}>
                    Chỉnh sửa
                  </button>
                ) : (
                  <button onClick={() => handleAddReviewClick(bill.productID)}>
                    Đánh giá
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ModalEditReview
        isVisible={isModalVisible}
        onClose={handleModalClose}
        review={selectedReview}
        onSubmit={handleUpdateReview}
        onDelete={handleDeleteReview}
      />
      <ModalAddReview
        isVisible={isAddReviewVisible}
        onClose={handleAddReviewClose}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};

const ModalEditReview = ({
  isVisible,
  onClose,
  review,
  onSubmit,
  onDelete,
}) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("0");
  const [error, setError] = useState("");

  useEffect(() => {
    if (review) {
      setComment(review.comment);
      setRating(review.rating.toString());
    }
  }, [review]);

  const handleRatingChange = (e) => {
    const value = Number(e.target.value);
    if (value < 0 || value > 5) {
      setError("Điểm đánh giá phải nằm trong khoảng từ 0 đến 5");
    } else {
      setError("");
      setRating(value);
    }
  };

  const handleSubmit = () => {
    if (!error) {
      if (comment.trim() === "") {
        setError("Đánh giá không được để trống");
        return;
      }
      onSubmit(comment, rating);
      setComment("");
      setRating("0");
      setError("");
    }
  };

  const handleDelete = () => {
    console.log("Deleting review with ID:", review.reviewID);
    if (review && review.reviewID) {
      onDelete(review.reviewID);
      onClose(); 
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Chỉnh sửa đánh giá sản phẩm</h3>
        <div className="rating-input">
          <label>Rating (0 - 5): </label>
          <input
            type="number"
            value={rating}
            onChange={handleRatingChange}
            min="0"
            max="5"
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập đánh giá của bạn..."
        ></textarea>
        <button onClick={handleSubmit}>Gửi</button>
        <button style={{marginLeft:"10px"}} onClick={onClose}>Đóng</button>
        <button className="buttonDelete" onClick={handleDelete}>Xóa</button> 

      </div>
    </div>
  );
};

const ModalAddReview = ({ isVisible, onClose, onSubmit }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("0");
  const [error, setError] = useState("");

  const handleRatingChange = (e) => {
    const value = Number(e.target.value);
    if (value < 0 || value > 5) {
      setError("Điểm đánh giá phải nằm trong khoảng từ 0 đến 5");
    } else {
      setError("");
      setRating(value);
    }
  };

  const handleSubmit = () => {
    if (!error) {
      if (comment.trim() === "") {
        setError("Đánh giá không được để trống");
        return;
      }
      onSubmit(comment, rating);
      setComment("");
      setRating("0");
      setError("");
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Thêm đánh giá sản phẩm</h3>
        <div className="rating-input">
          <label>Rating (0 - 5): </label>
          <input
            type="number"
            value={rating}
            onChange={handleRatingChange}
            min="0"
            max="5"
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập đánh giá của bạn..."
        ></textarea>
        <button onClick={handleSubmit}>Gửi</button>
        <button style={{marginLeft:"10px"}} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default PurchaseHistory;
