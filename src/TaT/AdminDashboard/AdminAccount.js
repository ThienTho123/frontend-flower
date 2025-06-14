import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from "./ImageDashboard/return-button.png";

const AdminAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [newAccount, setNewAccount] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
    address: "",
    status: "ENABLE",
    role: "user",
  });
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [createError, setCreateError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(
          "https://deploybackend-1ta9.onrender.com/api/v1/admin/account",
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Không thể lấy danh sách tài khoản.");
        }

        const data = await response.json();
        setAccounts(data.accounts);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAccounts();
  }, [accesstoken]);

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/account/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setAccounts((prevAccounts) =>
          prevAccounts.map((account) =>
            account.accountID === id
              ? { ...account, status: "DISABLE" }
              : account
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa tài khoản.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/account/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account.accountID !== id)
        );
      } else {
        throw new Error("Không thể xóa tài khoản.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (accountID, account) => {
    if (account.phoneNumber.length < 8 || account.phoneNumber.length > 10) {
      setPhoneError("Số điện thoại phải có độ dài từ 8 đến 10 số.");
      return;
    } else {
      setPhoneError("");
    }

    try {
      const response = await fetch(
        `https://deploybackend-1ta9.onrender.com/api/v1/admin/account/${accountID}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(account),
        }
      );

      if (response.ok) {
        const updatedAccount = await response.json();
        setAccounts(
          accounts.map((a) => (a.accountID === accountID ? updatedAccount : a))
        );
        setEditingAccountId(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật tài khoản.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    setCreateError(null);
    let errorMessage = "";

    if (newAccount.name.length < 2) {
      errorMessage += "Tên phải có ít nhất 2 ký tự.\n";
    }
    if (newAccount.username.length < 2 || newAccount.username.length > 45) {
      errorMessage += "Tên người dùng phải có từ 2 đến 45 ký tự.\n";
    }
    if (newAccount.password.length < 8) {
      errorMessage += "Mật khẩu phải có ít nhất 8 ký tự.\n";
    }
    if (
      newAccount.email.length < 2 ||
      !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(newAccount.email)
    ) {
      errorMessage += "Email không hợp lệ.\n";
    }
    if (
      newAccount.phoneNumber.length < 8 ||
      newAccount.phoneNumber.length > 10
    ) {
      errorMessage += "Số điện thoại phải có độ dài từ 8 đến 10 số.\n";
    }
    if (newAccount.address.length < 2) {
      errorMessage += "Địa chỉ phải có ít nhất 2 ký tự.\n";
    }

    if (errorMessage) {
      setCreateError(errorMessage);
      return;
    }

    try {
      const response = await fetch(
        "https://deploybackend-1ta9.onrender.com/api/v1/admin/account",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newAccount),
        }
      );

      if (response.ok) {
        const createdAccount = await response.json();
        setAccounts([...accounts, createdAccount]);
        setNewAccount({
          name: "",
          username: "",
          password: "",
          email: "",
          phoneNumber: "",
          address: "",
          status: "ENABLE",
          role: "user",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo tài khoản.");
      }
    } catch (err) {
      setCreateError(err.message);
    }
  };

  const handleInputChange = (e, accountID, field) => {
    const value = field === "email" ? e.target.value.trim() : e.target.value;
    if (accountID) {
      setAccounts(
        accounts.map((account) =>
          account.accountID === accountID
            ? { ...account, [field]: value }
            : account
        )
      );
    } else {
      setNewAccount((prev) => ({
        ...prev,
        [field]: value,
      }));
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
        <h2>Quản Lý Tài Khoản</h2>
      </div>
      <h3>Tạo Tài Khoản Mới</h3>
      <div>
        <label>Tên: </label>
        <input
          value={newAccount.name}
          onChange={(e) => handleInputChange(e, null, "name")}
        />
        <br />
        <label>Tên Đăng Nhập: </label>
        <input
          value={newAccount.username}
          onChange={(e) => handleInputChange(e, null, "username")}
        />
        <br />
        <label>Mật Khẩu: </label>
        <input
          type="password"
          value={newAccount.password}
          onChange={(e) => handleInputChange(e, null, "password")}
        />
        <br />
        <label>Email: </label>
        <input
          value={newAccount.email}
          onChange={(e) => handleInputChange(e, null, "email")}
        />
        <br />
        <label>Số Điện Thoại: </label>
        <input
          value={newAccount.phoneNumber}
          onChange={(e) => handleInputChange(e, null, "phoneNumber")}
        />
        <br />
        {phoneError && <p style={{ color: "red" }}>{phoneError}</p>}
        <label>Địa Chỉ: </label>
        <input
          value={newAccount.address}
          onChange={(e) => handleInputChange(e, null, "address")}
        />
        <br />
        <div>
          <label>Vai Trò: </label>
          <select
            value={newAccount.role}
            onChange={(e) => handleInputChange(e, null, "role")}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="shipper">Shipper</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <button onClick={handleCreate}>Tạo Tài Khoản</button>
      </div>

      {createError && <p style={{ color: "red" }}>{createError}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {accounts.length === 0 ? (
        <p>Không có tài khoản nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Avatar</th>
              <th>Tên</th>
              <th>Tên Đăng Nhập</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Địa Chỉ</th>
              <th>Tiêu Dùng</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.accountID}>
                <td>{account.accountID}</td>
                <td>
                  {/* Display Avatar */}
                  <img
                    src={account.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                  />
                </td>
                <td>
                  {editingAccountId === account.accountID ? (
                    <input
                      value={account.name}
                      onChange={(e) =>
                        handleInputChange(e, account.accountID, "name")
                      }
                    />
                  ) : (
                    account.name
                  )}
                </td>
                <td>
                  {editingAccountId === account.accountID ? (
                    <input
                      value={account.username}
                      onChange={(e) =>
                        handleInputChange(e, account.accountID, "username")
                      }
                      disabled
                    />
                  ) : (
                    account.username
                  )}
                </td>
                <td>
                  {editingAccountId === account.accountID ? (
                    <input
                      value={account.email}
                      onChange={(e) =>
                        handleInputChange(e, account.accountID, "email")
                      }
                    />
                  ) : (
                    account.email
                  )}
                </td>
                <td>
                  {editingAccountId === account.accountID ? (
                    <input
                      value={account.phoneNumber}
                      onChange={(e) =>
                        handleInputChange(e, account.accountID, "phoneNumber")
                      }
                    />
                  ) : (
                    account.phoneNumber
                  )}
                </td>
                <td>
                  {editingAccountId === account.accountID ? (
                    <input
                      value={account.address}
                      onChange={(e) =>
                        handleInputChange(e, account.accountID, "address")
                      }
                    />
                  ) : (
                    account.address
                  )}
                </td>
                <td>{account.consume ? account.consume.toFixed(2) : "N/A"}</td>{" "}
                {/* Displaying the consume value */}
                <td>
                  {editingAccountId === account.accountID ? (
                    <select
                      value={account.role}
                      onChange={(e) =>
                        handleInputChange(e, account.accountID, "role")
                      }
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="shipper">Shipper</option>
                      <option value="staff">Staff</option>
                    </select>
                  ) : (
                    account.role
                  )}
                </td>
                <td>
                  {editingAccountId === account.accountID ? (
                    <select
                      value={account.status}
                      onChange={(e) =>
                        handleInputChange(e, account.accountID, "status")
                      }
                    >
                      <option value="ENABLE">Enable</option>
                      <option value="DISABLE">Disable</option>
                    </select>
                  ) : (
                    account.status
                  )}
                </td>
                <td>
                  {editingAccountId === account.accountID ? (
                    <>
                      <button
                        onClick={() => handleSave(account.accountID, account)}
                      >
                        Lưu
                      </button>
                      <button onClick={() => setEditingAccountId(null)}>
                        Hủy
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingAccountId(account.accountID)}
                    >
                      Chỉnh Sửa
                    </button>
                  )}
                  <button onClick={() => handleDeleteSoft(account.accountID)}>
                    Vô hiệu hóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAccount;
