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
  const [category, setCategory] = useState([]);
  const [productType, setProductType] = useState([]);
  const [brand, setBrand] = useState([]);
  const [origin, setOrigin] = useState([]);
  const [size, setSize] = useState([]);
  const [visibleCount, setVisibleCount] = useState(sizePage);
  const [sortParams, setSortParams] = useState({
    origin: "",
    size: "",
    category: "",
    productType: "",
    brand: "",
  });

  const filteredProductTypes = useMemo(
    () =>
      sortParams.category
        ? productType.filter(
            (pt) => pt.categoryID.categoryID === parseInt(sortParams.category)
          )
        : productType,
    [sortParams.category, productType]
  );

  const handleSortParamChange = (param, value) => {
    const newSortParams = {
      ...sortParams,
      [param]: value,
      ...(param === "category" ? { productType: "" } : {}),
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
      const response = await axios.get("http://localhost:8080/product");
      const { products, category, productType, brand, origin, size } =
        response.data;
      setCategory(category);
      setProductType(productType);
      setBrand(brand);
      setOrigin(origin);
      setSize(size);
      console.log();
      if (initialSortParams) {
        setSortParams(initialSortParams);
      } else {
        setAllProducts(products);
        setProducts(products.slice(0, visibleCount));
      }
      console.log(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      origin: searchParams.get("origin") || "",
      size: searchParams.get("size") || "",
      category: searchParams.get("category") || "",
      productType: searchParams.get("productType") || "",
      brand: searchParams.get("brand") || "",
    };
  };

  const sortProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/product/sort", {
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
    if (Object.values(sortParams).some((val) => val !== "")) {
      sortProducts();
    } else {
      fetchProducts();
    }
  }, [sortParams]);

  useEffect(() => {
    setProducts(allProducts.slice(0, visibleCount));
  }, [allProducts, visibleCount]);

  useEffect(() => {
    const initialSortParams = getQueryParams();
    fetchProducts(initialSortParams);
    console.log("sort params:", sortParams);
  }, [location.search]);

  useEffect(() => {
    if (Object.keys(sortParams).some((key) => sortParams[key] !== "")) {
      sortProducts();
    }
    console.log("sort params:", sortParams);
  }, [sortParams]);

  useEffect(() => {
    setProducts(allProducts.slice(0, visibleCount));
    console.log("visible:", visibleCount);
  }, [allProducts, visibleCount]);
  return (
    <>
      <div className="product-list-container">
        <h1>Sản phẩm</h1>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="category">Danh mục:</label>
            <select
              id="category"
              value={sortParams.category}
              onChange={(e) =>
                handleSortParamChange("category", e.target.value)
              }
            >
              <option value="">Tất cả</option>
              {category.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="productType">Loại sản phẩm:</label>
            <select
              id="productType"
              value={sortParams.productType}
              onChange={(e) =>
                handleSortParamChange("productType", e.target.value)
              }
            >
              <option value="">Tất cả</option>
              {filteredProductTypes.map((pt) => (
                <option key={pt.productTypeID} value={pt.productTypeID}>
                  {pt.typeName}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="brand">Thương hiệu:</label>
            <select
              id="brand"
              value={sortParams.brand}
              onChange={(e) => handleSortParamChange("brand", e.target.value)}
            >
              <option value="">Tất cả</option>
              {brand.map((b) => (
                <option key={b.brandID} value={b.brandID}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="origin">Xuất xứ:</label>
            <select
              id="origin"
              value={sortParams.origin}
              onChange={(e) => handleSortParamChange("origin", e.target.value)}
            >
              <option value="">Tất cả</option>
              {origin.map((o) => (
                <option key={o.originID} value={o.originID}>
                  {o.country}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="size">Size:</label>
            <select
              id="size"
              value={sortParams.size}
              onChange={(e) => handleSortParamChange("size", e.target.value)}
            >
              <option value="">Tất cả</option>
              {size.map((s) => (
                <option key={s.sizeID} value={s.sizeID}>
                  {s.sizeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="product-grid">
          {products.length > 0 &&
            products.map((product) => (
              <div key={product.productID} className="product-card">
                <Link
                  to={`/detail/${product.productID}`}
                  style={{
                    textDecoration: "none", 
                    color: "inherit", 
                    outline: "none",
                    cursor: "pointer", 
                  }}
                >
                  <div className="img-wrapper">
                    <img src={product.avatar} alt={product.title} />
                  </div>
                  <h2>{product.title}</h2>
                  <p>Giá: {product.price.toLocaleString('vi-VN')} VNĐ</p>
                  <p>Thương hiệu: {product.brandID.brandName}</p>
                  <p>Xuất xứ: {product.originID.country}</p>
                </Link>{" "}
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
