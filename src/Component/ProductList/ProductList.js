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
  const [flowerTypes, setFlowerTypes] = useState([]);
  const [flowerColors, setFlowerColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [visibleCount, setVisibleCount] = useState(sizePage);
  const [sortParams, setSortParams] = useState({
    color: "",
    flowerType: "",
    size: "",
    price: "",
  });

  const filteredFlowerTypes = useMemo(
    () =>
      sortParams.flowerType
        ? flowerTypes.filter((ft) => ft.categoryID === parseInt(sortParams.flowerType))
        : flowerTypes,
    [sortParams.flowerType, flowerTypes]
  );

  const handleSortParamChange = (param, value) => {
    const newSortParams = {
      ...sortParams,
      [param]: value,
    };

    setSortParams(newSortParams);

    const filteredParams = Object.fromEntries(
      Object.entries(newSortParams).filter(([key, val]) => val !== "")
    );

    navigate({
      pathname: location.pathname,
      search: `?${new URLSearchParams(filteredParams).toString()}`,
    });
  };

  const fetchProducts = async (initialSortParams) => {
    try {
      const response = await axios.get("http://localhost:8080/flowers");
      const { products, flowerTypes, flowerColors, sizes } = response.data;
      setFlowerTypes(flowerTypes);
      setFlowerColors(flowerColors);
      setSizes(sizes);

      if (initialSortParams) {
        setSortParams(initialSortParams);
      } else {
        setAllProducts(products);
        setProducts(products.slice(0, visibleCount));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      color: searchParams.get("color") || "",
      flowerType: searchParams.get("flowerType") || "",
      size: searchParams.get("size") || "",
      price: searchParams.get("price") || "",
    };
  };

  const sortProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/flowers/sort", {
        params: sortParams,
      });
      const sortedProducts = response.data;
      setAllProducts(sortedProducts);
      setProducts(sortedProducts.slice(0, visibleCount));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    const initialSortParams = getQueryParams();
    fetchProducts(initialSortParams);
  }, [location.search]);

  useEffect(() => {
    if (Object.values(sortParams).some((val) => val !== "")) {
      sortProducts();
    } else {
      fetchProducts();
    }
  }, [sortParams]);

  useEffect(() => {
    setProducts(allProducts.slice(0, visibleCount));
  }, [allProducts, visibleCount]);

  return (
    <>
      <div className="product-list-container">
      <div className="flower-title">
        Hoa
      </div>        
      <div className="filters">
          <div className="filter-group">
            <label htmlFor="flowerType">Loại Hoa:</label>
            <select
              id="flowerType"
              value={sortParams.flowerType}
              onChange={(e) => handleSortParamChange("flowerType", e.target.value)}
            >
              <option value="">Tất cả</option>
              {flowerTypes.map((ft) => (
                <option key={ft.id} value={ft.id}>
                  {ft.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="color">Màu Sắc:</label>
            <select
              id="color"
              value={sortParams.color}
              onChange={(e) => handleSortParamChange("color", e.target.value)}
            >
              <option value="">Tất cả</option>
              {flowerColors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="size">Kích Cỡ:</label>
            <select
              id="size"
              value={sortParams.size}
              onChange={(e) => handleSortParamChange("size", e.target.value)}
            >
              <option value="">Tất cả</option>
              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="price">Giá:</label>
            <select
              id="price"
              value={sortParams.price}
              onChange={(e) => handleSortParamChange("price", e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="low">Giá thấp</option>
              <option value="high">Giá cao</option>
            </select>
          </div>
        </div>

        <div className="product-grid">
          {products.length > 0 &&
            products.map((product) => (
              <div key={product.id} className="product-card">
                <Link
                  to={`/detail/${product.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    outline: "none",
                  }}
                >
                  <div className="img-wrapper">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <h2>{product.name}</h2>
                  <p>Giá: {product.price.toLocaleString('vi-VN')} VNĐ</p>
                  <p>Loại hoa: {product.flowerType.name}</p>
                  <p>Màu sắc: {product.color.name}</p>
                </Link>
              </div>
            ))}
        </div>

        <div className="load-button">
          <button onClick={() => setVisibleCount(visibleCount + sizePage)}>
            Tải thêm
          </button>
        </div>
      </div>
    </>
  );
}
