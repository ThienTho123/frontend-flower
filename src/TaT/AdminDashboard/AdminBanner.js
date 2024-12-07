import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminBanner = () => {
  const [bannerList, setBannerList] = useState([]);
  const [newBanner, setNewBanner] = useState({
    image: "",
    flower: { flowerID: null },
    news: { newsID: null },
    category: { categoryID: null },
    purpose: { purposeID: null },
    status: "ENABLE",
  });
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purposes, setPurposes] = useState([]);
  
  useEffect(() => {
      const fetchBanners = async () => {
          try {
              const response = await fetch("http://localhost:8080/api/v1/admin/banner", {
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
              setBannerList(data.banners || []);
              setFlowers(data.flowers || []);
              setCategories(data.categories || []);
              setPurposes(data.purposes || []);
          } catch (err) {
              console.error("Lỗi khi lấy banner:", err.message);
              setError(err.message);
          }
      };
  
      fetchBanners();
  }, [accesstoken]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadImage = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/v1/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const imageUrl = data.DT;
        setImageUrl(imageUrl);
        setNewBanner((prevBanner) => ({
          ...prevBanner,
          image: imageUrl,
        }));
        console.log("Tải lên thành công:", imageUrl);
      } else {
        console.error("Lỗi khi tải lên:", data.EM);
      }
    } catch (err) {
      console.error("Lỗi khi tải lên:", err.message);
    }
  };

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/banner/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setBannerList((prevBannerList) =>
          prevBannerList.map((banner) =>
            banner.bannerID === id ? { ...banner, status: "DISABLE" } : banner
          )
        );
      } else {
        throw new Error("Không thể vô hiệu hóa banner.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/banner/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setBannerList((prevBannerList) =>
          prevBannerList.filter((banner) => banner.bannerID !== id)
        );
      } else {
        throw new Error("Không thể xóa banner.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, bannerData) => {
    try {
      const bannerToUpdate = bannerList.find((banner) => banner.bannerID === id);

      const updatedBannerData = {
        ...bannerToUpdate,
        ...bannerData,
        flower: bannerData.flower.flowerID ? bannerData.flower : null,
        news: bannerData.news.newsID ? bannerData.news : null,
        category: bannerData.category.categoryID ? bannerData.category : null,
        purpose: bannerData.purpose.purposeID ? bannerData.purpose : null,
      };

      const response = await fetch(
        `http://localhost:8080/api/v1/admin/banner/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedBannerData),
        }
      );

      if (response.ok) {
        const updatedBanner = await response.json();
        setBannerList((prevBannerList) =>
          prevBannerList.map((banner) =>
            banner.bannerID === id ? updatedBanner : banner
          )
        );
        setEditingBannerId(null);
      } else {
        throw new Error("Không thể cập nhật banner.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const { flower, news, category, purpose } = newBanner;

      const filteredBanner = {
        image: newBanner.image,
        status: newBanner.status,
        ...(flower.flowerID && { flower: flower }),
        ...(news.newsID && { news: news }),
        ...(category.categoryID && { category: category }),
        ...(purpose.purposeID && { purpose: purpose }),
      };

      const response = await fetch("http://localhost:8080/api/v1/admin/banner", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(filteredBanner),
      });

      if (response.ok) {
        const createdBanner = await response.json();
        setBannerList([...bannerList, createdBanner]);
        setNewBanner({
          image: "",
          flower: { flowerID: null },
          news: { newsID: null },
          category: { categoryID: null },
          purpose: { purposeID: null },
          status: "ENABLE",
        });
      } else {
        throw new Error("Không thể tạo banner.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };
  const handleSelectChange = (type, value) => {
    setNewBanner((prev) => ({
      ...prev,
      flower: type === "flower" ? { flowerID: value || null } : { flowerID: null },
      category: type === "category" ? { categoryID: value || null } : { categoryID: null },
      purpose: type === "purpose" ? { purposeID: value || null } : { purposeID: null },
    }));
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
      <h2>Quản Lý Banner</h2>
    </div>
  
    <h3>{editingBannerId ? "Chỉnh Sửa Banner" : "Thêm Banner Mới"}</h3>
    <div>
      <label>Hình Ảnh Banner: </label>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUploadImage}>Tải ảnh lên</button>
      {imageUrl && <img src={imageUrl} alt="Banner Avatar" style={{ width: 100 }} />}
      <br />
  
      <label>Chọn Flower:</label>
<select
  value={newBanner.flower?.flowerID || ""}
  onChange={(e) => handleSelectChange("flower", e.target.value)}
  disabled={newBanner.category?.categoryID || newBanner.purpose?.purposeID}
>
  <option value="">Chọn Flower</option>
  {flowers.map((flower) => (
    <option key={flower.flowerID} value={flower.flowerID}>
      {flower.name}
    </option>
  ))}
</select>

<label>Chọn Category:</label>
<select
  value={newBanner.category?.categoryID || ""}
  onChange={(e) => handleSelectChange("category", e.target.value)}
  disabled={newBanner.flower?.flowerID || newBanner.purpose?.purposeID}
>
  <option value="">Chọn Category</option>
  {categories.map((category) => (
    <option key={category.categoryID} value={category.categoryID}>
      {category.categoryName}
    </option>
  ))}
</select>

<label>Chọn Purpose:</label>
<select
  value={newBanner.purpose?.purposeID || ""}
  onChange={(e) => handleSelectChange("purpose", e.target.value)}
  disabled={newBanner.flower?.flowerID || newBanner.category?.categoryID}
>
  <option value="">Chọn Purpose</option>
  {purposes.map((purpose) => (
    <option key={purpose.purposeID} value={purpose.purposeID}>
      {purpose.purposeName}
    </option>
  ))}
</select>

  
      <label>Trạng Thái: </label>
      <select
        value={newBanner.status || "ENABLE"}
        onChange={(e) =>
          setNewBanner((prev) => ({ ...prev, status: e.target.value }))
        }
      >
        <option value="ENABLE">Enable</option>
        <option value="DISABLE">Disable</option>
      </select>
  
      {editingBannerId ? (
    // Nếu đang chỉnh sửa banner, truyền bannerID và newBanner để lưu
      <button onClick={() => handleSave(editingBannerId, newBanner)}>Lưu</button>
      ) : (
        // Nếu không chỉnh sửa, giữ nút "Tạo Banner"
        <button onClick={handleCreate}>Tạo Banner</button>
      )}
    </div>
  
    <h3>Danh Sách Banner</h3>
    {bannerList.length === 0 ? (
      <p>Không có banner nào.</p>
    ) : (
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>ID Banner</th>
            <th>Hình Ảnh</th>
            <th>Flower</th>
            <th>News</th>
            <th>Category</th>
            <th>Purpose</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {bannerList.map((banner) => (
            <tr key={banner.bannerID}>
              <td>{banner.bannerID}</td>
              <td>
                <img
                  src={banner.image}
                  alt="Banner"
                  style={{ width: "100px", height: "auto" }}
                />
              </td>
              <td>{banner.flower?.name || ""}</td>
              <td>{banner.news?.name || ""}</td>
              <td>{banner.category?.categoryName || ""}</td>
              <td>{banner.purpose?.purposeName || ""}</td>
              <td>{banner.status}</td>
              <td>
                {editingBannerId === banner.bannerID ? (
                  <>
                    <button onClick={() => handleSave(banner.bannerID, newBanner)}>
                      Lưu
                    </button>
                    <button onClick={() => setEditingBannerId(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setEditingBannerId(banner.bannerID);
                        setNewBanner({
                          image: banner.image,
                          flower: banner.flower || { flowerID: null },
                          news: banner.news || { newsID: null },
                          category: banner.category || { categoryID: null },
                          purpose: banner.purpose || { purposeID: null },
                          status: banner.status,
                        });
                      }}
                    >
                      Chỉnh Sửa
                    </button>
                    <button onClick={() => handleDeleteSoft(banner.bannerID)}>
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

export default AdminBanner;
