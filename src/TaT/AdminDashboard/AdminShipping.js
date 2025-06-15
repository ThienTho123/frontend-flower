import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";

const AdminShipping = () => {
  const [shippings, setShippings] = useState([]);
  const [editingShippingId, setEditingShippingId] = useState(null);
  const [newShipping, setNewShipping] = useState({
    startDate: "",
    completeDate: "",
    accountID: "",
    note: "",
    status: "ENABLE",
  });
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchShippings = async () => {
      try {
        const response = await fetch(
          "https://deploybackend-j61h.onrender.com/api/v1/admin/shipping",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách shipping.");
        }

        const data = await response.json();
        if (Array.isArray(data.shippings) && Array.isArray(data.accounts)) {
          setShippings(data.shippings);
          setAccounts(data.accounts);
        } else {
          throw new Error("Dữ liệu shipping không hợp lệ.");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchShippings();
  }, [accesstoken]);

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/shipping/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setShippings((prevShippings) =>
          prevShippings.map((shipping) =>
            shipping.shippingID === id
              ? { ...shipping, status: "DISABLE" }
              : shipping
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa shipping.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/shipping/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setShippings((prevShippings) =>
          prevShippings.filter((shipping) => shipping.shippingID !== id)
        );
      } else {
        throw new Error("Không thể xóa shipping.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, shippingData) => {
    if (!shippingData.accountID.accountID) {
      setError("Account không được trống.");
      return;
    }

    const startDate = shippingData.startDate
      ? new Date(shippingData.startDate)
      : null;
    const completeDate = shippingData.completeDate
      ? new Date(shippingData.completeDate)
      : null;

    if (!startDate || !completeDate) {
      setError("Both Start Date and Complete Date are required.");
      return;
    }

    const updatedShippingData = {
      shippingID: id,
      startDate: shippingData.startDate
        ? new Date(shippingData.startDate).toISOString().slice(0, 19)
        : null,
      completeDate: shippingData.completeDate
        ? new Date(shippingData.completeDate).toISOString().slice(0, 19)
        : null,
      accountID: {
        accountID: parseInt(
          shippingData.accountID.accountID || shippingData.accountID
        ), // Chuyển đổi đúng định dạng
      },
      note: shippingData.note ? shippingData.note : null,
      status: shippingData.status,
    };

    console.log(
      "Saving Shipping:",
      JSON.stringify(updatedShippingData, null, 2)
    );

    try {
      const response = await fetch(
        `https://deploybackend-j61h.onrender.com/api/v1/admin/shipping/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedShippingData),
        }
      );

      if (response.ok) {
        const updatedShipping = await response.json();
        setShippings((prevShippings) =>
          prevShippings.map((shipping) =>
            shipping.shippingID === id ? updatedShipping : shipping
          )
        );
        setEditingShippingId(null); // Đặt lại chế độ chỉnh sửa sau khi lưu
      } else {
        throw new Error("Không thể cập nhật shipping.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    if (!newShipping.accountID) {
      setError("Account không được trống.");
      return;
    }

    const startDate = newShipping.startDate
      ? new Date(newShipping.startDate)
      : null;
    const completeDate = newShipping.completeDate
      ? new Date(newShipping.completeDate)
      : null;

    if (!startDate || !completeDate) {
      setError("Ngày bắt đầu và Ngày hết thúc không được trống.");
      return;
    }

    const shippingData = {
      // Chuyển đổi startDate và completeDate sang định dạng ISO chuẩn
      startDate: newShipping.startDate
        ? new Date(newShipping.startDate).toISOString().slice(0, 19)
        : null, // Chuyển đổi và cắt phần millisecond
      completeDate: newShipping.completeDate
        ? new Date(newShipping.completeDate).toISOString().slice(0, 19)
        : null, // Chuyển đổi và cắt phần millisecond
      accountID: { accountID: parseInt(newShipping.accountID) }, // Đảm bảo accountID là một đối tượng
      note: newShipping.note ? newShipping.note : null, // Nếu không có note, gán null
      status: newShipping.status,
    };

    // In dữ liệu ra console để kiểm tra
    console.log("Creating Shipping:", JSON.stringify(shippingData, null, 2));

    try {
      const response = await fetch(
        "https://deploybackend-j61h.onrender.com/api/v1/admin/shipping",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(shippingData),
        }
      );

      if (response.ok) {
        const createdShipping = await response.json();
        setShippings([...shippings, createdShipping]);
        setNewShipping({
          startDate: "",
          completeDate: "",
          accountID: "",
          note: "",
          status: "ENABLE",
        });
      } else {
        throw new Error("Không thể tạo shipping.");
      }
    } catch (err) {
      setError(err.message);
    }
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
        <h2>Quản Lý Shipping</h2>
      </div>
      <h3>Thêm Shipping Mới</h3>
      <div>
        <label>Start Date: </label>
        <input
          type="datetime-local"
          value={newShipping.startDate}
          onChange={(e) =>
            setNewShipping({ ...newShipping, startDate: e.target.value })
          }
        />
        <label>Complete Date: </label>
        <input
          type="datetime-local"
          value={newShipping.completeDate}
          onChange={(e) =>
            setNewShipping({ ...newShipping, completeDate: e.target.value })
          }
        />
        <label>Account: </label>
        <select
          value={newShipping.accountID}
          onChange={(e) =>
            setNewShipping({ ...newShipping, accountID: e.target.value })
          }
        >
          <option value="">Chọn tài khoản</option>
          {accounts.map((account) => (
            <option key={account.accountID} value={account.accountID}>
              {account.name} ({account.accountID})
            </option>
          ))}
        </select>
        <label>Note: </label>
        <input
          value={newShipping.note}
          onChange={(e) =>
            setNewShipping({ ...newShipping, note: e.target.value })
          }
        />
        <label>Status: </label>
        <select
          value={newShipping.status}
          onChange={(e) =>
            setNewShipping({ ...newShipping, status: e.target.value })
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>
        <button onClick={handleCreate}>Thêm</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {shippings.length === 0 ? (
        <p>Không có shipping nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Start Date</th>
              <th>Complete Date</th>
              <th>Account ID</th>
              <th>Note</th>
              <th>Status</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {shippings.map((shipping) => (
              <tr key={shipping.shippingID}>
                <td>{shipping.shippingID}</td>
                <td>
                  {editingShippingId === shipping.shippingID ? (
                    <input
                      type="datetime-local"
                      value={shipping.startDate}
                      onChange={(e) =>
                        setShippings((prevShippings) =>
                          prevShippings.map((s) =>
                            s.shippingID === shipping.shippingID
                              ? { ...s, startDate: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  ) : (
                    shipping.startDate
                  )}
                </td>
                <td>
                  {editingShippingId === shipping.shippingID ? (
                    <input
                      type="datetime-local"
                      value={shipping.completeDate}
                      onChange={(e) =>
                        setShippings((prevShippings) =>
                          prevShippings.map((s) =>
                            s.shippingID === shipping.shippingID
                              ? { ...s, completeDate: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  ) : (
                    shipping.completeDate
                  )}
                </td>
                <td>
                  {editingShippingId === shipping.shippingID ? (
                    <select
                      value={shipping.accountID.accountID}
                      onChange={(e) =>
                        setShippings((prevShippings) =>
                          prevShippings.map((s) =>
                            s.shippingID === shipping.shippingID
                              ? {
                                  ...s,
                                  accountID: {
                                    accountID: parseInt(e.target.value),
                                  },
                                }
                              : s
                          )
                        )
                      }
                    >
                      {accounts.map((account) => (
                        <option
                          key={account.accountID}
                          value={account.accountID}
                        >
                          {account.name} ({account.accountID})
                        </option>
                      ))}
                    </select>
                  ) : (
                    `${shipping.accountID.name} (${shipping.accountID.accountID})`
                  )}
                </td>

                <td>
                  {editingShippingId === shipping.shippingID ? (
                    <input
                      value={shipping.note}
                      onChange={(e) =>
                        setShippings((prevShippings) =>
                          prevShippings.map((s) =>
                            s.shippingID === shipping.shippingID
                              ? { ...s, note: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  ) : (
                    shipping.note || "N/A"
                  )}
                </td>
                <td>
                  {editingShippingId === shipping.shippingID ? (
                    <select
                      value={shipping.status}
                      onChange={(e) =>
                        setShippings((prevShippings) =>
                          prevShippings.map((s) =>
                            s.shippingID === shipping.shippingID
                              ? { ...s, status: e.target.value }
                              : s
                          )
                        )
                      }
                    >
                      <option value="ENABLE">Enable</option>
                      <option value="DISABLE">Disable</option>
                    </select>
                  ) : (
                    shipping.status
                  )}
                </td>
                <td>
                  {editingShippingId === shipping.shippingID ? (
                    <>
                      <button
                        onClick={() =>
                          handleSave(shipping.shippingID, shipping)
                        }
                      >
                        Lưu
                      </button>
                      <button onClick={() => setEditingShippingId(null)}>
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setEditingShippingId(shipping.shippingID)
                        }
                      >
                        Chỉnh Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteSoft(shipping.shippingID)}
                      >
                        Vô hiệu hóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminShipping;
