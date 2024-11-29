import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FaStar } from "react-icons/fa";
import './PurchaseHistory.css';

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

      console.log("Dữ liệu nhận được từ API:", response.data);

      const { billInfo: rawBillInfo, review } = response.data;
      setReviews(review);

      const updatedBillInfo = rawBillInfo.map((item) => {
        const formattedDate = dayjs(item.date).format("YYYY-MM-DD HH:mm:ss");

        const relatedReview = review.find(
          (rev) => rev.flower && rev.flower.flowerID === item.productID
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

  const handleSubmitReview = async (comment, rating, image) => {
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      await axios.post(
        "http://localhost:8080/review",
        {
          flower: { flowerID: selectedProductId },
          comment,
          rating,
          image: imageUrl,
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

  const handleUpdateReview = async (comment, rating, image) => {
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      await axios.post(
        "http://localhost:8080/review",
        {
          flower: { flowerID: selectedProductId },
          comment,
          rating,
          image: imageUrl,
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

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.EM === "success") {
        return response.data.DT;
      } else {
        console.log("Image upload failed:", response.data.EM);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  useEffect(() => {
    getPurchaseHistory();
  }, []);

  const handleReviewClick = (item) => {
    setSelectedReview(item);
    setSelectedProductId(item.flower.flowerID);
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
    <div className="purchase-history-container">
    <h3>Sản phẩm đã mua</h3>
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

const ModalEditReview = ({ isVisible, onClose, review, onSubmit, onDelete }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (review) {
      setComment(review.comment);
      setRating(review.rating);
    }
  }, [review]);

  const handleStarClick = (value) => {
    setRating(value);
    setError("");
  };

  const handleSubmit = () => {
    if (comment.trim() === "") {
      setError("Đánh giá không được để trống");
      return;
    }
    onSubmit(comment, rating, image);
    setComment("");
    setRating(0);
    setError("");
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Chỉnh sửa đánh giá sản phẩm</h3>
        <div className="rating-input">
          <label>Đánh giá: </label>
          <div>
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <FaStar
                  key={index}
                  size={24}
                  color={starValue <= rating ? "#ffc107" : "#e4e5e9"}
                  onClick={() => handleStarClick(starValue)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}
          </div>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập đánh giá của bạn..."
        ></textarea>
        <div>
          <label>Upload Image: </label>
          <input type="file" onChange={handleImageChange} />
        </div>
        <button onClick={handleSubmit}>Gửi</button>
        <button  style={{
          marginLeft: "10px",
          backgroundColor: "#b0a9a9", /* Màu đỏ */
          color: "#fff", /* Chữ trắng */
          border: "none",
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "background-color 0.3s ease"
        }} onClick={onClose}>
          Đóng
        </button>
        <button className="buttonDelete" onClick={() => onDelete(review.reviewID)}>
          Xóa
        </button>
      </div>
    </div>
  );
};

const ModalAddReview = ({ isVisible, onClose, onSubmit }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);

  const handleStarClick = (value) => {
    setRating(value);
    setError("");
  };

  const handleSubmit = () => {
    if (comment.trim() === "") {
      setError("Đánh giá không được để trống");
      return;
    }
    onSubmit(comment, rating, image);
    setComment("");
    setRating(0);
    setError("");
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Đánh giá sản phẩm</h3>
        <div className="rating-input">
          <label>Đánh giá: </label>
          <div>
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <FaStar
                  key={index}
                  size={24}
                  color={starValue <= rating ? "#ffc107" : "#e4e5e9"}
                  onClick={() => handleStarClick(starValue)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}
          </div>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập đánh giá của bạn..."
        ></textarea>
        <div>
          <label>Upload Image: </label>
          <input type="file" onChange={handleImageChange} />
        </div>
        <button onClick={handleSubmit}>Gửi</button>
        <button style={{ marginLeft: "10px" }} onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default PurchaseHistory;
