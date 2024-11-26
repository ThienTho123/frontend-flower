import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./ProductList.css";

export default function ProductList() {
  const sizePage = 20;
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [visibleCount, setVisibleCount] = useState(sizePage);
  const [filterParams, setFilterParams] = useState({
    category: "",
    purpose: "",
  });

  const handleFilterParamChange = (param, value) => {
    const newFilterParams = { ...filterParams, [param]: value };
    setFilterParams(newFilterParams);

    const filteredParams = Object.fromEntries(
      Object.entries(newFilterParams).filter(([_, val]) => val !== "")
    );

    navigate({
      pathname: location.pathname,
      search: `?${new URLSearchParams(filteredParams).toString()}`,
    });
  };

  const fetchProducts = async (initialFilterParams) => {
    try {
      const response = await axios.get("http://localhost:8080/flower");
      const { flowers, category, purpose } = response.data;
      console.log(response.data); 

      setCategories(category);
      setPurposes(purpose);
      setAllProducts(flowers);
      setProducts(flowers.slice(0, visibleCount));

      if (initialFilterParams) {
        setFilterParams(initialFilterParams);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get("category") || "",
      purpose: searchParams.get("purpose") || "",
    };
  };

  const filterProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/flower/sort", {
        params: filterParams,
      });
      setAllProducts(response.data);
      setProducts(response.data.slice(0, visibleCount));
    } catch (error) {
      console.error("Error filtering products:", error);
    }
  };

  useEffect(() => {
    const initialFilterParams = getQueryParams();
    fetchProducts(initialFilterParams);
  }, [location.search]);

  useEffect(() => {
    if (Object.values(filterParams).some((val) => val !== "")) {
      filterProducts();
    } else {
      fetchProducts();
    }
  }, [filterParams]);

  useEffect(() => {
    setProducts(allProducts.slice(0, visibleCount));
  }, [allProducts, visibleCount]);

  return (
    <div className="product-list-container">
      <div className="flower-title">Thế giới của sắc màu</div>

      {/* Filter Components */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="category">Danh Mục:</label>
          <select
            id="category"
            value={filterParams.category}
            onChange={(e) => handleFilterParamChange("category", e.target.value)}
          >
            <option value="">Tất cả</option>
            {categories.map((cat) => (
              <option key={cat.categoryID} value={cat.categoryID}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="purpose">Mục Đích:</label>
          <select
            id="purpose"
            value={filterParams.purpose}
            onChange={(e) => handleFilterParamChange("purpose", e.target.value)}
          >
            <option value="">Tất cả</option>
            {purposes.map((purp) => (
              <option key={purp.purposeID} value={purp.purposeID}>
                {purp.purposeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Display */}
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.flowerID} className="product-card">
              <Link to={`/detail/${product.flowerID}`} className="product-link">
                <div className="img-wrapper">
                  <img src={product.image} alt={product.name} />
                </div>
                <h2>{product.name}</h2>
                <p>Giá: {product.price ? product.price.toLocaleString('vi-VN') : 'Giá không có'}</p>
                <p>Danh mục: {product.category.categoryName}</p>
                <p>Mục đích: {product.purpose.purposeName}</p>
              </Link>
            </div>
          ))
        ) : (
          <p>Không có sản phẩm nào.</p>
        )}
      </div>

      {/* Load More Button */}
      <div className="load-button">
        <button onClick={() => setVisibleCount(visibleCount + sizePage)}>
          Tải thêm
        </button>
      </div>
    </div>
  );
}
