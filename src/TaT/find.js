import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./find.css"; // Đảm bảo import file CSS của bạn

const ITEMS_PER_PAGE = 40; // 4 items x 5 hàng

const Find = () => {
  const location = useLocation();
  const searchResults = location.state?.results || [];

  // In dữ liệu JSON ra console
  console.log("Dữ liệu sản phẩm:", searchResults);

  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán các sản phẩm trên trang hiện tại
  const ITEMS_PER_PAGE = 16;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = searchResults.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);

  return (
    <div>
      <h1 className="KQ-title">Kết quả tìm kiếm</h1>
      <h4 className="KQ-count">
        Tìm thấy{" "}
        <span style={{ color: "red", padding: "0 5px" }}>
          {currentItems.length}
        </span>{" "}
        sản phẩm
      </h4>
      <div className="container" style={{ maxWidth: "1250px" }}>
        {currentItems.length > 0 ? (
          <>
            <div className="product-grid">
              {currentItems.map((product) => (
                <div key={product.flowerID} className="product">
                  <a href={`/detail/${product.flowerID}`}>
                    <img
                      style={{
                        height: "300px",
                        width: "250px",
                        objectFit: "cover",
                      }}
                      src={product.image}
                      alt={product.name}
                    />
                    <h3>{product.name}</h3>
                    <p>
                      Giá:{" "}
                      {product.priceEvent !== null ? (
                        <>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "gray",
                              marginRight: "8px",
                              fontSize: "1rem",
                            }}
                          >
                            {product.price.toLocaleString("vi-VN")} đ
                          </span>
                          <span
                            style={{
                              color: "red",
                              fontWeight: "bold",
                              fontSize: "1.2rem",
                            }}
                          >
                            {product.priceEvent.toLocaleString("vi-VN")} đ
                          </span>
                        </>
                      ) : (
                        <span>{product.price.toLocaleString("vi-VN")} đ</span>
                      )}
                    </p>
                    <p className="category">
                      Danh mục:{" "}
                      {product.category?.categoryName || "Không xác định"}
                    </p>
                    <p className="purpose">
                      Mục đích:{" "}
                      {product.purpose?.purposeName || "Không xác định"}
                    </p>
                  </a>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Trang trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Trang sau
              </button>
            </div>
          </>
        ) : (
          <p>Không tìm thấy sản phẩm nào.</p>
        )}
      </div>
    </div>
  );
};

export default Find;
