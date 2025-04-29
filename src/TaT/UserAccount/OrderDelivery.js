import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderDelivery.css"; 
import vnpay from "./Image/vnpay.jpg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OrderDelivery = () => {
  const navigate = useNavigate();
  const [flowers, setFlowers] = useState([]);
  const [deliveryTypesList, setDeliveryTypesList] = useState([]);
  const [selectedDeliveryTypeId, setSelectedDeliveryTypeId] = useState("");
  const [deliveryInterval, setDeliveryInterval] = useState("1"); // 1, 2, 3 for days
  const [intervalValue, setIntervalValue] = useState("every_day"); // every_day, two_day, three_day
  const [startDate, setStartDate] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState("9:00"); // Default delivery time
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const accesstoken = localStorage.getItem("access_token");
  const [account, setAccount] = useState(null);

  const [buyInfo, setBuyInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Calculate minimum start date (1 week from today)
  const calculateMinDate = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek;
  };

  useEffect(() => {
    const accesstoken = localStorage.getItem("access_token");
    
    if (!accesstoken) {
      alert("Vui lòng đăng nhập để sử dụng chức năng này");
      navigate("/login");
      return;
    }
  
    // Log để kiểm tra token
    console.log("Access token:", accesstoken);
    
    setLoading(true);
    fetch("http://localhost:8080/orderdelivery", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accesstoken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch order delivery data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data);
  
        // Check if flower data exists and map it
        if (data.allFlowers) {
          const mappedFlowers = data.allFlowers.map(flower => {
            const defaultSize = flower.flowerSizeDTOS.length > 0 ? flower.flowerSizeDTOS[0] : null;
            return {
              productID: flower.id,
              productTitle: flower.name,
              avatar: flower.image,
              sizes: flower.flowerSizeDTOS.map(size => ({
                id: size.flowerSizeID,
                name: size.sizeName,
                price: size.price,
              })),
              selected: false,
              quantity: 0,
              selectedSizeId: defaultSize ? defaultSize.flowerSizeID : null,
              selectedSize: defaultSize ? defaultSize.sizeName : "",
              selectedPrice: defaultSize ? defaultSize.price : 0
            };
          });
          setFlowers(mappedFlowers);
        }
  
        // Set delivery types
        if (data.orderDeliveryTypeList) {
          setDeliveryTypesList(data.orderDeliveryTypeList);
          if (data.orderDeliveryTypeList.length > 0) {
            setSelectedDeliveryTypeId(data.orderDeliveryTypeList[0].id);
          }
        }
  
        // Set account data if available
        if (data.account) {
          setAccount(data.account);
          setBuyInfo({
            name: data.account.name || "",
            phone: data.account.phoneNumber || "",
            address: data.account.address || "",
            note: "",
          });
        }
  
        setLoading(false);
      })
      .catch((error) => {
        setError("Error loading products. Please try again later.");
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [accesstoken, navigate]);

  // Tự động đặt giá trị intervalValue khi chọn deliveryInterval
  useEffect(() => {
    if (deliveryInterval === "1") {
      setIntervalValue("every_day");
    }
  }, [deliveryInterval]);

  const validateInput = (field, value) => {
    let error = "";

    switch (field) {
      case "name":
        if (value.trim().length <= 2) {
          error = "Vui lòng nhập tên nhiều hơn 2 ký tự.";
        }
        break;

      case "phone":
        if (!/^\d{8,}$/.test(value)) {
          error = "Vui lòng nhập số điện thoại có ít nhất 8 chữ số.";
        }
        break;

      case "address":
        if (value.trim().length <= 2) {
          error = "Vui lòng nhập đúng địa chỉ";
        }
        break;

      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));

    return error;
  };

  const handleInputChange = (field, value) => {
    validateInput(field, value);

    setBuyInfo((prevInfo) => ({
      ...prevInfo,
      [field]: value,
    }));
  };

  const handleProductSelection = (productID) => {
    setFlowers(flowers.map(flower => 
      flower.productID === productID 
        ? { 
            ...flower, 
            selected: !flower.selected,
            quantity: !flower.selected ? 1 : flower.quantity
          } 
        : flower
    ));
  };
  
  const handleQuantityChange = (productID, quantity) => {
    const newQuantity = Math.max(0, parseInt(quantity) || 0);
    
    setFlowers(flowers.map(flower => 
      flower.productID === productID 
        ? { ...flower, quantity: newQuantity } 
        : flower
    ));
  };

  const handleSizeChange = (productID, sizeId) => {
    setFlowers((prevFlowers) =>
      prevFlowers.map((flower) => {
        if (flower.productID === productID) {
          const selectedSizeObj = flower.sizes.find(
            (size) => size.id === parseInt(sizeId)
          );
          return {
            ...flower,
            selectedSizeId: parseInt(sizeId),
            selectedSize: selectedSizeObj?.name || "",
            selectedPrice: selectedSizeObj?.price || 0,
          };
        }
        return flower;
      })
    );
  };

  const calculateTotalPrice = () => {
    return flowers.reduce((total, flower) => {
      if (flower.selected && flower.quantity > 0) {
        return total + flower.selectedPrice * flower.quantity;
      }
      return total;
    }, 0);
  };

  const handleOrder = () => {
    console.log("Access token:", accesstoken);
    console.log("Current user role:", localStorage.getItem("user_role"));

    // Validate delivery date
    if (!startDate) {
      setError("Vui lòng chọn ngày bắt đầu giao hàng.");
      return;
    }

    // Validate time
    if (!deliveryTime) {
      setError("Vui lòng chọn thời gian giao hàng.");
      return;
    }

    // Validate user info
    if (!buyInfo.name || buyInfo.name.trim().length < 3) {
      setError("Vui lòng nhập tên người nhận hợp lệ (tối thiểu 3 ký tự).");
      return;
    }

    if (!buyInfo.phone || !/^\d{8,}$/.test(buyInfo.phone)) {
      setError("Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8 chữ số).");
      return;
    }

    if (!buyInfo.address || buyInfo.address.trim().length < 3) {
      setError("Vui lòng nhập địa chỉ giao hàng hợp lệ (tối thiểu 3 ký tự).");
      return;
    }

    // Validate products
    const selectedFlowersWithQty = flowers.filter(flower => 
      flower.selected && flower.quantity > 0
    );

    if (selectedFlowersWithQty.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm và nhập số lượng.");
      return;
    }

    // Format the date as yyyy-MM-dd'T'HH:mm:ss (ISO format)
    const dateObj = new Date(startDate);
    // Extract time parts from deliveryTime (assuming format like "9:00")
    const [hours, minutes] = deliveryTime.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    
    const formattedDate = dateObj.toISOString();
    const accountId = account?.id || 0;

    // Prepare order data with correct enum value
    const orderData = {
      name: buyInfo.name,
      phone: buyInfo.phone,
      address: buyInfo.address,
      note: buyInfo.note,
      orderDeliveryTypeID: parseInt(selectedDeliveryTypeId),
      dateStart: formattedDate,
      deliverper: intervalValue,  // Using the exact enum value: every_day, two_day, three_day
      flowerChooses: selectedFlowersWithQty.map(flower => ({
        flowersizeid: flower.selectedSizeId,
        quantity: flower.quantity
      })),
      accountId: accountId,

    };

    console.log("Order Data:", orderData);

    const totalPayment = calculateTotalPrice();

    // Send to API
    fetch(`http://localhost:8080/setOrderDelivery?price=${totalPayment}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accesstoken}`,
      },
      body: JSON.stringify(orderData),
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Không có quyền truy cập. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.");
        }
        return response.text().then(text => {
          throw new Error(`Lỗi (${response.status}): ${text || response.statusText}`);
        });
      }
      return response.text();
    })
    .then(data => {
      console.log("Order set successfully:", data);
      return fetch(`http://localhost:8080/pay?totalPayment=${totalPayment}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accesstoken}`,
        }
      });
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to initiate payment");
      }
      return response.text();
    })
    .then(vnpayUrl => {
      console.log("VNPay URL:", vnpayUrl);
      // Chuyển hướng đến trang thanh toán VNPay
      window.location.href = vnpayUrl;
    })
    .catch(error => {
      setError("Có lỗi xảy ra khi đặt lịch giao hoa: " + error.message);
      console.error("Order error:", error);
    });
  };

  if (loading) {
    return <div className="od-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="od-container">
      <h2 className="od-heading">Đặt Hoa Theo Lịch</h2>
      
      <div className="od-sections">
        <div className="od-products">
          <h3>Chọn Sản Phẩm</h3>
          <div className="od-product-scroll">
            <div className="od-product-grid">
              {flowers.map((flower) => (
                <div 
                  key={flower.productID} 
                  className={`od-product-card ${flower.selected ? 'selected' : ''}`}
                >
                  <div className="od-product-select">
                    <input
                      type="checkbox"
                      checked={flower.selected}
                      onChange={() => handleProductSelection(flower.productID)}
                      className="od-custom-checkbox"
                    />
                  </div>
                  <div className="od-product-image">
                    <img src={flower.avatar} alt={flower.productTitle} />
                  </div>
                  <div className="od-product-info">
                      <h3>{flower.productTitle}</h3>

                      <div className="od-product-price">
                      {flower.selected && flower.quantity > 0 
                        ? (flower.selectedPrice * flower.quantity).toLocaleString("vi-VN") 
                        : flower.selectedPrice ? flower.selectedPrice.toLocaleString("vi-VN") : "0"} VND
                      </div>

                      <div className="od-product-options">
                          <div className="od-size-select">
                          <label>Kích thước:</label>
                          <select
                              value={flower.selectedSizeId}
                              onChange={(e) => handleSizeChange(flower.productID, e.target.value)}
                              disabled={!flower.selected}
                          >
                              {flower.sizes && flower.sizes.map((size) => (
                              <option key={size.id} value={size.id}>
                                  {size.name} - {size.price.toLocaleString("vi-VN")} VND
                              </option>
                              ))}
                          </select>
                          </div>
                      
                      <div className="od-quantity-select">
                        <label>Số lượng:</label>
                        <div className="od-quantity-container">
                          <button
                            type="button"
                            className="od-quantity-btn"
                            onClick={() => handleQuantityChange(flower.productID, flower.quantity - 1)}
                            disabled={!flower.selected || flower.quantity <= 0}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={flower.quantity}
                            onChange={(e) => handleQuantityChange(flower.productID, e.target.value)}
                            disabled={!flower.selected}
                            className="od-quantity-input"
                          />
                          <button
                            type="button"
                            className="od-quantity-btn"
                            onClick={() => handleQuantityChange(flower.productID, flower.quantity + 1)}
                            disabled={!flower.selected}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="od-options">
          <div className="od-delivery-schedule">
            <h3>Lịch Giao Hàng</h3>
            
            <div className="od-schedule-option">
              <label>Loại lịch giao:</label>
              <select 
                value={deliveryInterval} 
                onChange={(e) => setDeliveryInterval(e.target.value)}
              >
                <option value="1">Theo ngày</option>
                <option value="2">Theo tuần</option>
                <option value="4">Nửa tháng</option>
                <option value="3">Theo tháng</option>
              </select>
            </div>
            
            {deliveryInterval !== "1" && (
              <div className="od-schedule-option">
                <label>Khoảng cách giao hàng:</label>
                <select 
                  value={intervalValue} 
                  onChange={(e) => setIntervalValue(e.target.value)}
                >
                  <option value="every_day">Mỗi ngày</option>
                  <option value="two_day">Mỗi 2 ngày</option>
                  <option value="three_day">Mỗi 3 ngày</option>
                </select>
              </div>
            )}
            
            <div className="od-schedule-option">
              <label>Ngày bắt đầu giao:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                minDate={calculateMinDate()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày"
                className="od-date-picker"
              />
            </div>
            
            <div className="od-schedule-option">
              <label>Thời gian giao hàng:</label>
              <select 
                value={deliveryTime} 
                onChange={(e) => setDeliveryTime(e.target.value)}
              >
                <option value="9:00">9:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
            </div>
          </div>

          <div className="od-user-info">
            <h3>Thông tin khách hàng</h3>
            <label>
              Tên:
              <input
                type="text"
                value={buyInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
            </label>
            <label>
              Số điện thoại:
              <input
                type="text"
                value={buyInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
              {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}
            </label>
            <label>
              Địa chỉ:
              <input
                type="text"
                value={buyInfo.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
              {errors.address && <p style={{ color: "red" }}>{errors.address}</p>}
            </label>
            <label>
              Ghi chú:
              <textarea
                value={buyInfo.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
              ></textarea>
            </label>
          </div>

          <div className="od-price-summary">
            <h3 className="od-total-payment">
              Tổng thanh toán: {calculateTotalPrice().toLocaleString("vi-VN")} VND
            </h3>
          </div>

          <div className="od-payment-options">
            <h3>Phương thức thanh toán</h3>
            <label className="od-payment-option">
              <input
                type="radio"
                value="vnpay"
                checked={true}
                readOnly
              />
              <img src={vnpay} alt="VNPay" className="od-payment-icon" />
              VNPay
            </label>

            <div className="od-button-container">
              <button onClick={handleOrder} className="od-payment-button">
                Đặt lịch và thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="custom-error-container">
          <div className="custom-error-popup">
            <span className="custom-error-message">{error}</span>
            <span className="custom-close-btn" onClick={() => setError(null)}>
              &times;
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDelivery;