import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PreBuy.css";
import payment from "./Image/payment.png";
import vnpay from "./Image/vnpay.jpg";
import deleteicon from "./Image/deleteicon.png";

const PreBuy = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [errorMessages, setErrorMessages] = useState({});
  const [sizeChoose, setSizeChoose] = useState("");
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (accesstoken) {
      fetch("http://localhost:8080/prebuy", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Could not fetch cart items.");
          }
          return response.json();
        })
        .then((data) => {
          if (data.account) {
            setAccount(data.account);
            setBuyInfo({
              name: data.account.name || "",
              phone: data.account.phoneNumber || "",
              address: data.account.address || "",
              note: "",
            });
          }
          const itemsWithSelectedSize = data.cart.map((item) => {
            const savedItems =
              JSON.parse(localStorage.getItem("cartItems")) || [];
            const savedItem = savedItems.find(
              (saved) => saved.cartID === item.cartID
            );
            return {
              ...item,
              selectedSize: savedItem
                ? savedItem.selectedSize
                : item.selectedSize || item.sizes[0],
              selected: false,
            };
          });

          setCartItems(itemsWithSelectedSize);
          setDiscounts(data.discount || []);
          console.log(discounts);

          localStorage.setItem(
            "cartItems",
            JSON.stringify(itemsWithSelectedSize)
          );
          localStorage.setItem(
            "discounts",
            JSON.stringify(data.discount || [])
          );
        })
        .catch((error) => {
          setError("Có lỗi xảy ra khi lấy giỏ hàng hoặc dữ liệu giảm giá.");
          console.error(error);
        });
    } else {
      navigate("/login");
    }
  }, [accesstoken, navigate]);

  useEffect(() => {
    if (accesstoken) {
      fetch("http://localhost:8080/prebuy", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Could not fetch discounts.");
          }
          return response.json();
        })
        .then((data) => {
          if (data.discount && Array.isArray(data.discount)) {
            setDiscounts(
              data.discount.filter((discount) => discount.status === "ENABLE")
            );
          } else {
            setDiscounts([]);
          }
        })
        .catch((error) => {
          setError("Có lỗi xảy ra khi lấy dữ liệu giảm giá.");
          console.error(error);
        });
    }
  }, [accesstoken]);

  const handleSizeChange = (cartID, selectedSize) => {
    const updatedItems = cartItems.map((item) => {
      if (item.cartID === cartID) {
        const stockForSelectedSize =
          item.stock[item.sizes.indexOf(selectedSize)]; // Lấy tồn kho theo kích thước mới

        let updatedNumber = item.number;
        let errorMessage = null;

        // Kiểm tra số lượng hiện tại so với tồn kho mới
        if (updatedNumber > stockForSelectedSize) {
          updatedNumber = 1; // Đặt số lượng về 0 nếu vượt quá tồn kho
        }

        // Cập nhật item
        return {
          ...item,
          sizeChoose: selectedSize, // Cập nhật kích thước được chọn
          selectedSize, // Đồng nhất giá trị selectedSize
          currentStock: stockForSelectedSize, // Tồn kho theo kích thước mới
          number: updatedNumber, // Cập nhật số lượng
        };
      }
      return item;
    });

    setCartItems(updatedItems); // Cập nhật state giỏ hàng
    localStorage.setItem("cartItems", JSON.stringify(updatedItems)); // Lưu vào localStorage

    // Cập nhật thông báo lỗi
    const errorMessages = updatedItems.reduce((errors, item) => {
      if (item.errorMessage) {
        errors[item.cartID] = item.errorMessage;
      }
      return errors;
    }, {});
    setErrorMessages(errorMessages);

    // Gọi API cập nhật giỏ hàng
    const updatedItem = updatedItems.find((item) => item.cartID === cartID);
    updateCart(cartID, updatedItem.number, selectedSize);
  };

  const handleQuantityChange = (cartID, quantity) => {
    const newQuantity = parseInt(quantity, 10) || 1;
    const cartItem = cartItems.find((item) => item.cartID === cartID);

    if (
      cartItem &&
      newQuantity >
        cartItem.stock[cartItem.sizes.indexOf(cartItem.selectedSize)]
    ) {
      setErrorMessages((prevErrors) => ({
        ...prevErrors,
        [cartID]: `Số lượng nhập vào không được lớn hơn ${
          cartItem.stock[cartItem.sizes.indexOf(cartItem.selectedSize)]
        }.`,
      }));
      return;
    } else {
      setErrorMessages((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[cartID];
        return newErrors;
      });
    }
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.cartID === cartID ? { ...item, number: newQuantity } : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      return updatedItems;
    });

    if (cartItem) {
      updateCart(cartID, newQuantity, cartItem.selectedSize);
    }
  };

  const updateCart = (cartID, number, size) => {
    const requestBody = {
      number: parseInt(number, 10),
      size: size.trim(),
    };

    fetch(`http://localhost:8080/prebuy/${cartID}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accesstoken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not update cart.");
        }
        return response.json();
      })
      .then((updatedCart) => {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.cartID === cartID ? { ...item, ...updatedCart } : item
          )
        );
      })
      .catch((error) => {
        setError("Có lỗi xảy ra khi cập nhật giỏ hàng.");
        console.error(error);
      });
  };

  const handleDelete = (cartID) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
    );
    if (confirmDelete) {
      fetch(`http://localhost:8080/prebuy/${cartID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Could not delete cart item.");
          }
          const updatedCartItems = cartItems.filter(
            (item) => item.cartID !== cartID
          );
          setCartItems(updatedCartItems);
          localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
        })
        .catch((error) => {
          setError("Có lỗi xảy ra khi xóa sản phẩm.");
          console.error(error);
        });
    }
  };

  const calculateTotalPrice = () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    if (selectedItems.length === 0) return 0;

    return selectedItems.reduce(
      (total, item) => total + item.productPrice * item.number,
      0
    );
  };

  const calculateDiscountAmount = (totalPrice) => {
    return appliedDiscount; // Sử dụng giá trị giảm giá đã áp dụng
  };
  const deleteDiscount = (discountID) => {
    fetch(`http://localhost:8080/api/v1/admin/discount/${discountID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accesstoken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not delete discount.");
        }
        console.log("Discount deleted successfully");
        // Cập nhật lại danh sách discount nếu cần thiết
        setDiscounts((prevDiscounts) =>
          prevDiscounts.filter((discount) => discount.discountID !== discountID)
        );
      })
      .catch((error) => {
        console.error(error);
        setError("Có lỗi xảy ra khi xóa mã giảm giá.");
      });
  };
  const [buyInfo, setBuyInfo] = useState({
    address: "",
    phone: "",
    name: "",
    note: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });
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
  const handleBuy = () => {
    if (Object.keys(errorMessages).length > 0) {
      setError(
        "Không thể thanh toán vì có sản phẩm vượt quá số lượng tồn kho."
      );
      return;
    }

    const selectedItems = cartItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để mua.");
      return;
    }

    const selectedDiscountObj = discounts.find(
      (discount) => discount.discountID === selectedDiscount
    );
    const discountPercent = selectedDiscountObj?.discountPercent || 0;

    const cartIDs = selectedItems.map((item) => item.cartID);
    const quantities = selectedItems.map((item) => item.number);
    const prices = selectedItems.map((item) => {
      const totalPrice = item.productPrice * item.number;
      const discountedPrice = totalPrice * (1 - discountPercent / 100); // Áp dụng giảm giá phần trăm
      return Math.max(discountedPrice, 0);
    });

    const params = new URLSearchParams();
    cartIDs.forEach((id, index) => {
      params.append("cartID", id);
      params.append("quantities", quantities[index]);
      params.append("price", prices[index]);
    });

    const buyInfoBody = {
      name: buyInfo.name,
      address: buyInfo.address,
      phone: buyInfo.phone,
      note: buyInfo.note,
    };

    const url = `http://localhost:8080/prebuy/buy?${params.toString()}`;

    console.log("POST URL:", url);
    console.log("Body JSON gửi đến API:", buyInfoBody);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accesstoken}`,
      },
      body: JSON.stringify(buyInfoBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not complete the purchase.");
        }
        return response.text();
      })
      .then(() => {
        if (selectedDiscount) {
          deleteDiscount(selectedDiscount);
        }
        const updatedCartItems = cartItems.filter((item) => !item.selected);
        setCartItems(updatedCartItems);
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
        navigate("/PaymentSuccess");
      })
      .catch((error) => {
        setError("Có lỗi xảy ra khi thực hiện giao dịch.");
        console.error(error);
      });
  };

  const handleBuyVNPay = () => {
    if (Object.keys(errorMessages).length > 0) {
      setError(
        "Không thể thanh toán vì có sản phẩm vượt quá số lượng tồn kho."
      );
      return;
    }

    const selectedItems = cartItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    const selectedDiscountObj = discounts.find(
      (discount) => discount.discountID === selectedDiscount
    );
    const discountPercent = selectedDiscountObj?.discountPercent || 0;

    const cartIDs = selectedItems.map((item) => item.cartID);
    const quantities = selectedItems.map((item) => item.number);
    const prices = selectedItems.map((item) => {
      const totalPrice = item.productPrice * item.number;
      const discountedPrice = totalPrice * (1 - discountPercent / 100); // Áp dụng giảm giá phần trăm
      return Math.max(discountedPrice, 0);
    });

    const queryParams = cartIDs
      .map(
        (id, index) =>
          `cartID=${id}&quantities=${quantities[index]}&price=${prices[index]}`
      )
      .join("&");

    const buyInfoBody = {
      name: buyInfo.name,
      address: buyInfo.address,
      phone: buyInfo.phone,
      note: buyInfo.note,
    };

    console.log("Query Parameters:", queryParams);
    console.log("Body JSON gửi đến API /setCart:", buyInfoBody);

    fetch(`http://localhost:8080/setCart?${queryParams}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accesstoken}`,
      },
      body: JSON.stringify(buyInfoBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể cập nhật giỏ hàng.");
        }
        return response.text();
      })
      .then(() => {
        const totalPayment = prices.reduce((sum, price) => sum + price, 0);
        console.log("Tổng thanh toán (đã giảm giá):", totalPayment);
        return fetch(`http://localhost:8080/pay?totalPayment=${totalPayment}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể khởi tạo thanh toán.");
        }
        return response.text();
      })
      .then((vnpayUrl) => {
        console.log("VNPay URL:", vnpayUrl);
        window.location.href = vnpayUrl;
      })
      .catch((error) => {
        setError("Có lỗi xảy ra khi thực hiện thanh toán qua VNPay.");
        console.error(error);
      });
  };

  const handleCheckboxChange = (cartID) => {
    const updatedItems = cartItems.map((item) =>
      item.cartID === cartID ? { ...item, selected: !item.selected } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
  };

  const handleApplyDiscount = () => {
    if (!selectedDiscount) {
      setError("Vui lòng chọn mã giảm giá.");
      return;
    }

    const selectedDiscountObj = discounts.find(
      (discount) => discount.discountID === selectedDiscount
    );

    if (!selectedDiscountObj) {
      setError("Mã giảm giá không hợp lệ.");
      return;
    }

    console.log("Selected Discount Details:", selectedDiscountObj);

    const selectedItems = cartItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }

    const accountTypeID = account?.type?.typeID; // Lấy typeID từ tài khoản người dùng

    // Kiểm tra toàn bộ sản phẩm và điều kiện typeID
    const allItemsMatch = selectedItems.every((item) => {
      const isCategoryMatch =
        selectedDiscountObj.categoryID &&
        item.categoryID === selectedDiscountObj.categoryID.categoryID;

      const isTypeMatch =
        selectedDiscountObj.type &&
        accountTypeID === selectedDiscountObj.type.typeID; // So sánh typeID

      const isPurposeMatch =
        selectedDiscountObj.purposeID &&
        item.purposeID === selectedDiscountObj.purposeID;

      // Kiểm tra tất cả điều kiện
      return isCategoryMatch || isTypeMatch || isPurposeMatch;
    });

    if (!allItemsMatch) {
      setError(
        "Khuyến mãi không áp dụng vì có sản phẩm hoặc thông tin tài khoản không thỏa mãn điều kiện."
      );
      setAppliedDiscount(0);
      setTimeout(() => {
        setError("");
      }, 5000);
      return;
    }

    const totalPrice = selectedItems.reduce(
      (total, item) => total + item.productPrice * item.number,
      0
    );
    const discountAmount =
      totalPrice * (selectedDiscountObj.discountPercent / 100);

    setAppliedDiscount(discountAmount);
    setError(null);
  };

  const handleDiscountChange = (event) => {
    setSelectedDiscount(Number(event.target.value));
  };
  const calculatePrice = (productPrice, quantity) => {
    return (productPrice * quantity)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const totalPrice = calculateTotalPrice();
  console.log("Tổng giá trị sản phẩm (totalPrice):", totalPrice);

  const discountAmount = calculateDiscountAmount(totalPrice);
  console.log("Tổng giảm giá (discountAmount):", discountAmount);

  const totalPayment = totalPrice - discountAmount;
  console.log("Tổng thanh toán (totalPayment):", totalPayment);
  return (
    <div className="prebuy-container">
      <h2 className="prebuy-h2">
        Giỏ hoa của bạn: <span>({cartItems.length} bó hoa)</span>
      </h2>
      {cartItems.length > 0 ? (
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <ul className="prebuy-cart-list">
              {cartItems.map((item) => (
                <div key={item.cartID} className="prebuy-cart-item">
                  <li style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      className="prebuy-custom-checkbox"
                      checked={item.selected}
                      onChange={() => handleCheckboxChange(item.cartID)}
                    />
                    <a href={`/detail/${item.productID}`}>
                      <img src={item.avatar} alt={item.productTitle} />
                    </a>

                    <div style={{ flex: 1 }}>
                      <p className="prebuy-product-title">
                        <a
                          style={{ textDecoration: "none", color: "#000000" }}
                          href={`/detail/${item.productID}`}
                        >
                          {item.productTitle}
                        </a>
                      </p>
                      <p className="prebuy-product-price">
                        Giá: {calculatePrice(item.productPrice, item.number)}{" "}
                        VNĐ
                      </p>
                      <label className="prebuy-product-size-label">
                        Kích thước:
                        <select
                          value={item.sizeChoose || ""}
                          onChange={(e) => {
                            handleSizeChange(item.cartID, e.target.value);
                            window.location.reload();
                          }}
                          className="prebuy-product-size-select"
                          style={{ marginLeft: "5px" }}
                        >
                          {item.sizes.map((sizeName, index) => (
                            <option key={index} value={sizeName}>
                              {sizeName}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p
                        className="prebuy-product-stock"
                        style={{
                          fontSize: "1em",
                          color: "#999",
                          marginTop: "5px",
                        }}
                      >
                        Tồn kho:{" "}
                        {item.stock[item.sizes.indexOf(item.selectedSize)]}
                      </p>
                      <label className="prebuy-quantity-label">
                        Số lượng:
                        <div className="prebuy-quantity-container">
                          <button
                            type="button"
                            className="prebuy-quantity-btn"
                            onClick={() =>
                              handleQuantityChange(item.cartID, item.number - 1)
                            }
                            disabled={item.number <= 1} // Vô hiệu hóa khi số lượng <= 1
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.number}
                            onChange={(e) => {
                              let inputValue = parseInt(e.target.value, 10);

                              // Loại bỏ dấu âm và kiểm tra giá trị hợp lệ
                              if (isNaN(inputValue) || inputValue < 1) {
                                inputValue = -inputValue;
                              }

                              handleQuantityChange(item.cartID, inputValue);
                            }}
                            className="prebuy-quantity-input"
                          />
                          <button
                            type="button"
                            className="prebuy-quantity-btn"
                            onClick={() =>
                              handleQuantityChange(item.cartID, item.number + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        {errorMessages[item.cartID] && (
                          <p className="prebuy-quantity-error">
                            {errorMessages[item.cartID]}
                          </p>
                        )}
                      </label>
                    </div>
                    <img
                      src={deleteicon}
                      alt="Xóa"
                      onClick={() => handleDelete(item.cartID)}
                      className="prebuy-delete-icon"
                      style={{
                        cursor: "pointer",
                        width: "80px",
                        height: "80px",
                        marginRight: "50px",
                        transition: "transform 0.2s",
                        borderRadius: "40px",
                      }}
                    />
                  </li>
                </div>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1, paddingLeft: "20px" }}>
            <div className="prebuy-user-info">
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
                {errors.address && (
                  <p style={{ color: "red" }}>{errors.address}</p>
                )}
              </label>
              <label>
                Ghi chú:
                <textarea
                  value={buyInfo.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                ></textarea>
              </label>
            </div>

            <div className="prebuy-price-summary">
              <h3 className="prebuy-total-price">
                Tổng tiền: {calculateTotalPrice().toLocaleString("vi-VN")} VND
              </h3>
              <h3 className="prebuy-discount-amount">
                Giảm giá: -{appliedDiscount.toLocaleString("vi-VN")} VND
              </h3>
              <h3 className="prebuy-total-payment">
                Tổng thanh toán:{" "}
                {(calculateTotalPrice() - appliedDiscount).toLocaleString(
                  "vi-VN"
                )}{" "}
                VND
              </h3>
            </div>
            <select
              value={selectedDiscount || ""}
              onChange={handleDiscountChange}
              className="prebuy-discount-select"
            >
              <option value="">Chọn mã giảm giá</option>
              {discounts.map((discount) => (
                <option key={discount.discountID} value={discount.discountID}>
                  {discount.categoryID
                    ? `Giảm ${discount.discountPercent}% cho ${discount.categoryID.categoryName}`
                    : `Giảm ${discount.discountPercent}%`}
                  {discount.type?.typeName && ` (${discount.type.typeName})`}
                  {discount.purpose && ` cho ${discount.purpose.purposeName}`}
                </option>
              ))}
            </select>

            <button onClick={handleApplyDiscount} className="prebuy-button">
              Áp dụng
            </button>
            {error && (
              <div className="custom-error-container">
                <div className="custom-error-popup">
                  <span className="custom-error-message">{error}</span>
                  <span
                    className="custom-close-btn"
                    onClick={() => setError(null)}
                  >
                    &times;
                  </span>
                </div>
              </div>
            )}
            <div className="prebuy-payment-options">
              <h3>Phương thức thanh toán</h3>
              <label className="prebuy-payment-option">
                <input
                  type="radio"
                  value="vnpay"
                  checked={selectedPaymentMethod === "vnpay"}
                  onChange={() => setSelectedPaymentMethod("vnpay")}
                />
                <img src={vnpay} alt="VNPay" className="prebuy-payment-icon" />
                VNPay
              </label>
              <label className="prebuy-payment-option">
                <input
                  type="radio"
                  value="cash"
                  checked={selectedPaymentMethod === "cash"}
                  onChange={() => setSelectedPaymentMethod("cash")}
                />
                <img
                  src={payment}
                  alt="Thanh toán khi nhận hàng"
                  className="prebuy-payment-icon"
                />
                Thanh toán khi nhận hàng
              </label>
              <div className="prebuy-button-container">
                <button
                  onClick={() =>
                    selectedPaymentMethod === "vnpay"
                      ? handleBuyVNPay()
                      : handleBuy()
                  }
                  className="prebuy-payment-button"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Giỏ hàng của bạn đang trống.</p>
      )}
    </div>
  );
};
export default PreBuy;
