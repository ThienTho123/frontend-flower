import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminDiscount = () => {
  const [discountList, setDiscountList] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    categoryID: { categoryID: null },
    type: { typeID: null },
    purpose: { purposeID: null },
    discountPercent: "",
    startDate: "",
    endDate: "",
    status: "ENABLE",
  });
  
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [activeField, setActiveField] = useState(""); 

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/discount", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Lỗi: ${response.status} - ${errorMessage}`);
        }
  
        const data = await response.json();
        setDiscountList(data.discounts || []);
        setCategories(data.categories || []);
        setTypes(data.types || []);
        setPurposes(data.purposes || []);
      } catch (err) {
        console.error("Lỗi khi lấy giảm giá:", err.message);
        setError(err.message);
      }
    };
  
    fetchDiscounts();
  }, [accesstoken]);
  
  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/discount/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setDiscountList((prev) =>
          prev.map((discount) =>
            discount.discountID === id ? { ...discount, status: "DISABLE" } : discount
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa giảm giá.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  const handleFieldChangeAdd = (field, value) => {
    setNewDiscount((prev) => {
      const newDiscount = { ...prev };
      
      // Xử lý khóa các trường còn lại
      if (field === 'categoryID') {
        newDiscount.categoryID.categoryID = value;
        newDiscount.type.typeID = null;
        newDiscount.purpose.purposeID = null;
      } else if (field === 'type') {
        newDiscount.type.typeID = value;
        newDiscount.categoryID.categoryID = null;
        newDiscount.purpose.purposeID = null;
      } else if (field === 'purpose') {
        newDiscount.purpose.purposeID = value;
        newDiscount.categoryID.categoryID = null;
        newDiscount.type.typeID = null;
      }

      return newDiscount;
    });
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/discount/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setDiscountList((prev) => prev.filter((discount) => discount.discountID !== id));
      } else {
        throw new Error("Không thể xóa giảm giá.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, discountData) => {
    try {
      // Format the data before sending
      const formattedData = {
        discountID: discountData.discountID,
        categories: discountData.categories && discountData.categories.categoryID
            ? [{ categoryID: discountData.categories.categoryID }] // Nếu có categoryID, đặt categoryID
            : [{ categoryID: 3 }], // Nếu không có categoryID, gán mặc định categoryID: 3
        type: discountData.type?.typeID
            ? { typeID: discountData.type.typeID }
            : null, // Nếu không có typeID, gán null
        purpose: discountData.purpose?.purposeID
            ? { purposeID: discountData.purpose.purposeID }
            : null, // Nếu không có purposeID, gán null
        discountPercent: parseFloat(discountData.discountPercent), // Đảm bảo là số thực
        startDate: discountData.startDate.split("-").map(Number).concat([0, 0]), // Chuyển startDate thành đúng định dạng
        endDate: discountData.endDate.split("-").map(Number).concat([0, 0]), // Chuyển endDate thành đúng định dạng
        status: discountData.status || "DISABLE", // Mặc định "DISABLE" nếu không có trạng thái
    };
    
  
      console.log(`JSON gửi đi khi cập nhật giảm giá ID ${id}:`, JSON.stringify(formattedData, null, 2));
  
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/discount/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formattedData),
        }
      );
  
      if (response.ok) {
        const updatedDiscount = await response.json();
        setDiscountList((prev) =>
          prev.map((discount) =>
            discount.discountID === id ? updatedDiscount : discount
          )
        );
        setEditingDiscountId(null);
        window.location.reload();
      } else {
        throw new Error("Không thể cập nhật giảm giá.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  

  const handleEditRow = (id) => {
    setEditingDiscountId(id); // Bắt đầu chế độ chỉnh sửa
  };

  const handleCancelEdit = () => {
    setEditingDiscountId(null); // Hủy chế độ chỉnh sửa
  };

  const handleFieldChange = (id, field, value) => {
    setDiscountList((prev) =>
      prev.map((discount) =>
        discount.discountID === id
          ? { 
              ...discount, 
              [field]: value,
              // Nếu là các trường danh mục, loại, mục đích thì cập nhật đầy đủ vào đối tượng
              categoryID: field === "categoryID" ? { categoryID: value } : discount.categoryID,
              type: field === "type" ? { typeID: value } : discount.type,
              purpose: field === "purpose" ? { purposeID: value } : discount.purpose
            }
          : discount
      )
    );
  };
  
  
  const handleCreate = async () => {
    try {
        // Chuyển đổi dữ liệu thành đúng định dạng
        const formattedData = {
            categoryID: newDiscount.categoryID.categoryID
                ? { categoryID: parseInt(newDiscount.categoryID.categoryID, 10) }
                : null,
            type: newDiscount.type.typeID
                ? { typeID: parseInt(newDiscount.type.typeID, 10) }
                : null,
            purpose: newDiscount.purpose.purposeID
                ? { purposeID: parseInt(newDiscount.purpose.purposeID, 10) }
                : null,
            discountPercent: parseFloat(newDiscount.discountPercent), // Đảm bảo là số thực
            startDate: newDiscount.startDate.split("-").map(Number).concat([0, 0]), // Chuyển "YYYY-MM-DD" thành [YYYY, MM, DD, 0, 0]
            endDate: newDiscount.endDate.split("-").map(Number).concat([0, 0]), // Tương tự cho endDate
            status: "DISABLE", // Trạng thái mặc định khi tạo
        };

        console.log(
            "JSON gửi đi khi tạo giảm giá mới:",
            JSON.stringify(formattedData, null, 2)
        );

        const response = await fetch(
            "http://localhost:8080/api/v1/admin/discount",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accesstoken}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formattedData),
            }
        );

        if (response.ok) {
            const createdDiscount = await response.json();
            setDiscountList([...discountList, createdDiscount]);

            // Reset form
            setNewDiscount({
                categoryID: { categoryID: null },
                type: { typeID: null },
                purpose: { purposeID: null },
                discountPercent: "",
                startDate: "",
                endDate: "",
                status: "ENABLE",
            });
            window.location.reload();

        } else {
            throw new Error("Không thể tạo giảm giá.");
        }
    } catch (err) {
        setError(err.message);
    }
};



  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

    const formatDate = (date) => {
      if (!date) return ""; 

      if (Array.isArray(date)) {
        const [year, month, day] = date;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }

      if (typeof date === "string" && date.includes("-")) {
        const [year, month, day] = date.split("-");
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }

      if (date instanceof Date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }

      return date; 
    };

    
  return (
    <div className="admin-ql-container">
      <div className="title-container">
        <img
          src={returnIcon}
          alt="Quay lại"
          className="return-button"
          onClick={handleBackToDashboard}
        />
        <h2>Quản Lý Giảm Giá</h2>
      </div>

      <h3>Thêm Giảm Giá Mới</h3>
      <div>

      {/* Chọn Danh Mục */}
      <label>Chọn Danh Mục:</label>
      <select
        value={newDiscount.categoryID.categoryID || ""}
        onChange={(e) => handleFieldChangeAdd('categoryID', e.target.value)}
        disabled={newDiscount.type.typeID || newDiscount.purpose.purposeID}
      >
        <option value="">Chọn Danh Mục</option>
        {categories.map((category) => (
          <option key={category.categoryID} value={category.categoryID}>
            {category.categoryName}
          </option>
        ))}
      </select>

      {/* Chọn Loại */}
      <label>Chọn Loại:</label>
      <select
        value={newDiscount.type.typeID || ""}
        onChange={(e) => handleFieldChangeAdd('type', e.target.value)}
        disabled={newDiscount.categoryID.categoryID || newDiscount.purpose.purposeID}
      >
        <option value="">Chọn Loại</option>
        {types.map((type) => (
          <option key={type.typeID} value={type.typeID}>
            {type.typeName}
          </option>
        ))}
      </select>

      {/* Chọn Mục Đích */}
      <label>Chọn Mục Đích:</label>
      <select
        value={newDiscount.purpose.purposeID || ""}
        onChange={(e) => handleFieldChangeAdd('purpose', e.target.value)}
        disabled={newDiscount.categoryID.categoryID || newDiscount.type.typeID}
      >
        <option value="">Chọn Mục Đích</option>
        {purposes.map((purpose) => (
          <option key={purpose.purposeID} value={purpose.purposeID}>
            {purpose.purposeName}
          </option>
        ))}
      </select>

        <label>Phần Trăm Giảm Giá:</label>
        <input
          type="number"
          value={newDiscount.discountPercent}
          onChange={(e) =>
            setNewDiscount((prev) => ({ ...prev, discountPercent: e.target.value }))
          }
        />

        <label>Ngày Bắt Đầu:</label>
        <input
          type="date"
          value={newDiscount.startDate}
          onChange={(e) =>
            setNewDiscount((prev) => ({ ...prev, startDate: e.target.value }))
          }
        />

        <label>Ngày Kết Thúc:</label>
        <input
          type="date"
          value={newDiscount.endDate}
          onChange={(e) =>
            setNewDiscount((prev) => ({ ...prev, endDate: e.target.value }))
          }
        />

        <label>Trạng Thái:</label>
        <select
          value={newDiscount.status}
          onChange={(e) =>
            setNewDiscount((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">ENABLE</option>
          <option value="DISABLE">DISABLE</option>
        </select>

        <button onClick={handleCreate}>Tạo Giảm Giá</button>
      </div>

      <h3>Danh Sách Giảm Giá</h3>
      {discountList.length === 0 ? (
        <p>Không có giảm giá nào.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Danh Mục</th>
              <th>Loại</th>
              <th>Mục Đích</th>
              <th>Giảm Giá (%)</th>
              <th>Ngày Bắt Đầu</th>
              <th>Ngày Kết Thúc</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
          {discountList.map((discount) => (
  <tr key={discount.discountID}>
    <td>{discount.discountID}</td>

    {/* Chỉnh sửa Danh Mục */}
    <td>
      {editingDiscountId === discount.discountID ? (
        <select
          value={discount.categoryID?.categoryID || ""}
          onChange={(e) =>
            handleFieldChange(discount.discountID, "categoryID", e.target.value)
          }
          disabled={discount.type?.typeID || discount.purpose?.purposeID} // Khoá khi có dữ liệu trong Loại hoặc Mục Đích
        >
          <option value="">Chọn Danh Mục</option>
          {categories.map((category) => (
            <option key={category.categoryID} value={category.categoryID}>
              {category.categoryName}
            </option>
          ))}
        </select>
      ) : (
        discount.categoryID?.categoryName || "N/A"
      )}
    </td>

    {/* Chỉnh sửa Loại */}
    <td>
      {editingDiscountId === discount.discountID ? (
        <select
          value={discount.type?.typeID || ""}
          onChange={(e) =>
            handleFieldChange(discount.discountID, "type", e.target.value)
          }
          disabled={discount.categoryID?.categoryID || discount.purpose?.purposeID} // Khoá khi có dữ liệu trong Danh Mục hoặc Mục Đích
        >
          <option value="">Chọn Loại</option>
          {types.map((type) => (
            <option key={type.typeID} value={type.typeID}>
              {type.typeName}
            </option>
          ))}
        </select>
      ) : (
        discount.type?.typeName || "N/A"
      )}
    </td>

    {/* Chỉnh sửa Mục Đích */}
    <td>
      {editingDiscountId === discount.discountID ? (
        <select
          value={discount.purpose?.purposeID || ""}
          onChange={(e) =>
            handleFieldChange(discount.discountID, "purpose", e.target.value)
          }
          disabled={discount.categoryID?.categoryID || discount.type?.typeID} // Khoá khi có dữ liệu trong Danh Mục hoặc Loại
        >
          <option value="">Chọn Mục Đích</option>
          {purposes.map((purpose) => (
            <option key={purpose.purposeID} value={purpose.purposeID}>
              {purpose.purposeName}
            </option>
          ))}
        </select>
      ) : (
        discount.purpose?.purposeName || "N/A"
      )}
    </td>

    {/* Chỉnh sửa Giảm Giá (%) */}
    <td>
      {editingDiscountId === discount.discountID ? (
        <input
          type="number"
          value={discount.discountPercent}
          onChange={(e) =>
            handleFieldChange(discount.discountID, "discountPercent", e.target.value)
          }
        />
      ) : (
        discount.discountPercent
      )}
    </td>

    {/* Chỉnh sửa Ngày Bắt Đầu */}
    <td>
      {editingDiscountId === discount.discountID ? (
        <input
          type="date"
          value={discount.startDate}
          onChange={(e) =>
            handleFieldChange(discount.discountID, "startDate", e.target.value)
          }
        />
      ) : (
        formatDate(discount.startDate) // Gọi hàm formatDate để chuyển đổi ngày
      )}
    </td>

    {/* Chỉnh sửa Ngày Kết Thúc */}
    <td>
      {editingDiscountId === discount.discountID ? (
        <input
          type="date"
          value={discount.endDate}
          onChange={(e) =>
            handleFieldChange(discount.discountID, "endDate", e.target.value)
          }
        />
      ) : (
        formatDate(discount.endDate) // Gọi hàm formatDate để chuyển đổi ngày
      )}
    </td>

    {/* Chỉnh sửa Trạng Thái */}
    <td>
      {editingDiscountId === discount.discountID ? (
        <select
          value={discount.status}
          onChange={(e) =>
            handleFieldChange(discount.discountID, "status", e.target.value)
          }
        >
          <option value="ENABLE">ENABLE</option>
          <option value="DISABLE">DISABLE</option>
        </select>
      ) : (
        discount.status
      )}
    </td>

    {/* Các nút hành động */}
    <td>
      {editingDiscountId === discount.discountID ? (
        <>
          <button onClick={() => handleSave(discount.discountID, discount)}>Lưu</button>
          <button onClick={handleCancelEdit}>Hủy</button>
        </>
      ) : (
        <>
          <button onClick={() => handleEditRow(discount.discountID)}>Chỉnh sửa</button>
          <button onClick={() => handleDeleteSoft(discount.discountID)}>Vô hiệu</button>
          <button onClick={() => handleDeleteHard(discount.discountID)}>Xóa</button>
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

export default AdminDiscount;
