import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Wishlist.css";

const Wishlist = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Thêm trạng thái success để thông báo thành công
  const access_token = localStorage.getItem("access_token");

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    setSuccess(""); // Reset success message trước khi tải lại danh sách
    try {
      const response = await axios.get(
        "https://deploybackend-j61h.onrender.com/wishlist",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setWishlists(response.data.wishlists || []); // Cập nhật danh sách sản phẩm
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a product from wishlist
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      console.log("ID = " + id);
      try {
        // Gửi yêu cầu xóa sản phẩm
        await axios.delete(
          `https://deploybackend-j61h.onrender.com/wishlist/${id}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        // Gọi lại hàm fetchWishlist để làm mới danh sách
        fetchWishlist();

        setSuccess("Sản phẩm đã được xóa thành công.");
      } catch (err) {
        console.error("Error deleting wishlist item:", err);
        setError("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
      }
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
              <Link
                to={`/detail/${item.flower.flowerID}`}
                className="wishlist-link"
              >
                <div className="img-wrapper">
                  <img src={item.flower.image} alt={item.flower.name} />
                </div>
                <h2>{item.flower.name}</h2>
                <p>{item.flower.description}</p>
              </Link>
              <button
                className="delete-button"
                onClick={() => handleDelete(item.wishListID)}
              >
                X
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
      )}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default Wishlist;
