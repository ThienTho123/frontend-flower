import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png'; 


const AdminCart = () => {
  const [carts, setCarts] = useState([]);
  const [newCart, setNewCart] = useState({
    number: 1,
    productSizeID: { productSizeID: null },
    accountID: { accountID: null },
    status: "Enable",
  });
  const [editingCartId, setEditingCartId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/cart", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách giỏ hàng.");
        }

        const data = await response.json();
        setCarts(data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCarts();
  }, [accesstoken]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/cart/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setCarts((prevCarts) =>
          prevCarts.map((cart) =>
            cart.cartID === id ? { ...cart, status: "Disable" } : cart
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa giỏ hàng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, cart) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/cart/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ 
            number: cart.number, 
            productSizeID: { productSizeID: cart.productSizeID.productSizeID }, 
            accountID: { accountID: cart.accountID.accountID },
            status: cart.status 
          }),
        }
      );

      if (response.ok) {
        const updatedCart = await response.json();
        setCarts((prevCarts) =>
          prevCarts.map((cart) =>
            cart.cartID === id ? updatedCart : cart
          )
        );
        setEditingCartId(null);
      } else {
        throw new Error("Không thể cập nhật giỏ hàng.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    if (!newCart.productSizeID.productSizeID || !newCart.accountID.accountID) {
        setError("Product Size ID and Account ID are required.");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/v1/admin/cart", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accesstoken}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(newCart),
        });

        if (!response.ok) {
            throw new Error("Cannot create cart.");
        }

        const createdCart = await response.json();
        setCarts([...carts, createdCart]);
        setNewCart({
            number: 1,
            productSizeID: { productSizeID: null },
            accountID: { accountID: null },
            status: "Enable",
        });
    } catch (err) {
        setError(err.message);
    }
  };

  const handleInputChange = (e, id, field) => {
    const value =
      field === "number" ? parseInt(e.target.value, 10) : e.target.value;
    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.cartID === id ? { ...cart, [field]: value } : cart
      )
    );
  };

  const handleEditChange = (e, id, field, nestedField) => {
    const value = e.target.value;
    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.cartID === id
          ? {
              ...cart,
              [field]: nestedField
                ? { [nestedField]: parseInt(value, 10) }
                : value,
            }
          : cart
      )
    );
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
<div className="admin-ql-container">
<div className="title-container">
      <img 
        src={returnIcon} 
        alt="Quay Lại" 
        className="return-button" 
        onClick={handleBackToDashboard} 
      />
      <h2>Quản Lý Giỏ Hàng</h2>
    </div>      

      <h3>Thêm Giỏ Hàng Mới</h3>
      <div>
        <label>Số Lượng: </label>
        <input
          type="number"
          value={newCart.number}
          onChange={(e) =>
            setNewCart((prev) => ({ ...prev, number: parseInt(e.target.value, 10) }))
          }
        />
        <label>Product Size ID: </label>
        <input
          type="number"
          value={newCart.productSizeID.productSizeID || ""}
          onChange={(e) =>
            setNewCart((prev) => ({
              ...prev,
              productSizeID: { productSizeID: parseInt(e.target.value, 10) },
            }))
          }
        />
        <label>Account ID: </label>
        <input
          type="number"
          value={newCart.accountID.accountID || ""}
          onChange={(e) =>
            setNewCart((prev) => ({
              ...prev,
              accountID: { accountID: parseInt(e.target.value, 10) },
            }))
          }
        />
        <label>Trạng thái: </label>
        <select
          value={newCart.status}
          onChange={(e) =>
            setNewCart((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>

        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p>{error}</p>}
      {carts.length === 0 ? (
        <p>Không có giỏ hàng nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID Giỏ Hàng</th>
              <th>Số Lượng</th>
              <th>Product Size ID</th>
              <th>Account ID</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {carts.map((cart) => (
              <tr key={cart.cartID}>
                <td>{cart.cartID}</td>
                <td>
                  {editingCartId === cart.cartID ? (
                    <input
                      type="number"
                      value={cart.number}
                      onChange={(e) =>
                        handleInputChange(e, cart.cartID, "number")
                      }
                    />
                  ) : (
                    cart.number
                  )}
                </td>
                <td>
                  {editingCartId === cart.cartID ? (
                    <input
                      type="number"
                      value={cart.productSizeID.productSizeID || ""}
                      onChange={(e) =>
                        handleEditChange(
                          e,
                          cart.cartID,
                          "productSizeID",
                          "productSizeID"
                        )
                      }
                    />
                  ) : (
                    cart.productSizeID.productSizeID
                  )}
                </td>
                <td>
                  {editingCartId === cart.cartID ? (
                    <input
                      type="number"
                      value={cart.accountID.accountID || ""}
                      onChange={(e) =>
                        handleEditChange(
                          e,
                          cart.cartID,
                          "accountID",
                          "accountID"
                        )
                      }
                    />
                  ) : (
                    cart.accountID.accountID
                  )}
                </td>
                <td>
                  {editingCartId === cart.cartID ? (
                    <select
                      value={cart.status}
                      onChange={(e) =>
                        handleInputChange(e, cart.cartID, "status")
                      }
                    >
                      <option value="Enable">Enable</option>
                      <option value="Disable">Disable</option>
                    </select>
                  ) : (
                    cart.status
                  )}
                </td>
                <td>
                  {editingCartId === cart.cartID ? (
                    <button
                      onClick={() => handleSave(cart.cartID, cart)}
                    >
                      Lưu
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingCartId(cart.cartID)}
                    >
                      Chỉnh Sửa
                    </button>
                  )}
                  <button onClick={() => handleDelete(cart.cartID)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCart;
