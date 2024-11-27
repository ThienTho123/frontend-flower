import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./ProductList.css";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

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
    
    fetchProducts(newFilterParams);
  };

  const fetchProducts = async (initialFilterParams) => {
    try {
      const response = await axios.get("http://localhost:8080/flower");
  
      if (response.data) {
        const { flowers, category, purpose } = response.data;
  
        setCategories(category || []);
        setPurposes(purpose || []);
        setAllProducts(flowers || []); 
        const filteredProducts = flowers.filter(product => {
          const matchCategory = initialFilterParams.category
            ? product.category.categoryID === parseInt(initialFilterParams.category)
            : true;
          const matchPurpose = initialFilterParams.purpose
            ? product.purpose.purposeID === parseInt(initialFilterParams.purpose)
            : true;
          return matchCategory && matchPurpose;
        });
        const sortedProducts = filteredProducts.sort((a, b) => {
          return a.name.localeCompare(b.name); 
        });

        setProducts(sortedProducts.slice(0, visibleCount));
        setAllProducts(sortedProducts); 
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
  
  useEffect(() => {
    const initialFilterParams = getQueryParams();
    fetchProducts(initialFilterParams); 
  }, [location.search]); 
  useEffect(() => {
    setProducts(allProducts.slice(0, visibleCount));
  }, [allProducts, visibleCount]); 
  

  return (
    <div className="product-list-container">
      <div className="flower-title">Thế giới của sắc màu</div>

      {/* Filter Components */}
      <div className="filters-modern">
      <FormControl fullWidth>
  <InputLabel id="category-label">Danh Mục</InputLabel>
  <Select
    labelId="category-label"
    id="category"
    value={filterParams.category}
    onChange={(e) => handleFilterParamChange("category", e.target.value)}
  >
    <MenuItem value="">Tất cả</MenuItem>
    {categories.length > 0 ? (
      categories.map((cat) => (
        <MenuItem key={cat.categoryID} value={cat.categoryID}>
          {cat.categoryName}
        </MenuItem>
      ))
    ) : (
      <MenuItem value="">Không có danh mục</MenuItem>
    )}
  </Select>
</FormControl>

<FormControl fullWidth>
  <InputLabel id="purpose-label">Mục Đích</InputLabel>
  <Select
    labelId="purpose-label"
    id="purpose"
    value={filterParams.purpose}
    onChange={(e) => handleFilterParamChange("purpose", e.target.value)}
  >
    <MenuItem value="">Tất cả</MenuItem>
    {purposes.length > 0 ? (
      purposes.map((purp) => (
        <MenuItem key={purp.purposeID} value={purp.purposeID}>
          {purp.purposeName}
        </MenuItem>
      ))
    ) : (
      <MenuItem value="">Không có mục đích</MenuItem>
    )}
  </Select>
</FormControl>
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
                <p>
                  Giá: {product.price ? `${product.price.toLocaleString('vi-VN')} đ` : 'Giá không có'}
                </p>
                <p>Danh mục: {product.category.categoryName}</p>
                <p>Mục đích: {product.purpose.purposeName}</p>
              </Link>
            </div>
          ))
        ) : (
          <p>Không có sản phẩm bạn cần tìm.</p>
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
