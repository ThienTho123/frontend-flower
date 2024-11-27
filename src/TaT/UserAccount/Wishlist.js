import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const access_token = localStorage.getItem("access_token");

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:8080/wishlist", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      setWishlists(response.data.wishlists || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a product from wishlist
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/wishlist/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      setWishlists(wishlists.filter((item) => item.wishlistID !== id)); // Remove locally
    } catch (err) {
      console.error("Error deleting wishlist item:", err);
      setError("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="wishlist-container">
      <h1>Sản phẩm yêu thích</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : wishlists.length > 0 ? (
        <div className="wishlist-grid">
          {wishlists.map((item) => (
            <div key={item.wishlistID} className="wishlist-card">
              <Link to={`/detail/${item.flower.flowerID}`} className="wishlist-link">
                <div className="img-wrapper">
                  <img src={item.flower.image} alt={item.flower.name} />
                </div>
                <h2>{item.flower.name}</h2>
                <p>{item.flower.description}</p>
                <p>
                  Giá:{" "}
                  {item.flower.price
                    ? `${item.flower.price.toLocaleString("vi-VN")} đ`
                    : "Không có giá"}
                </p>
              </Link>
              <button
                className="delete-button"
                onClick={() => handleDelete(item.wishlistID)}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
      )}
    </div>
  );
};

export default Wishlist;
