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
        setBannerList(data || []);
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

      <h3>Thêm Banner Mới</h3>
      <div>
        <label>Hình Ảnh Banner: </label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Tải ảnh lên</button>
        {imageUrl && <img src={imageUrl} alt="Banner Avatar" style={{ width: 100 }} />}

        <label>Chọn Flower ID:</label>
        <input
          type="number"
          value={newBanner.flower.flowerID || ""}
          onChange={(e) =>
            setNewBanner((prev) => ({
              ...prev,
              flower: { flowerID: e.target.value },
            }))
          }
        />

        <label>Chọn News ID:</label>
        <input
          type="number"
          value={newBanner.news.newsID || ""}
          onChange={(e) =>
            setNewBanner((prev) => ({
              ...prev,
              news: { newsID: e.target.value },
            }))
          }
        />

        <label>Chọn Category ID:</label>
        <input
          type="number"
          value={newBanner.category.categoryID || ""}
          onChange={(e) =>
            setNewBanner((prev) => ({
              ...prev,
              category: { categoryID: e.target.value },
            }))
          }
        />

        <label>Chọn Purpose ID:</label>
        <input
          type="number"
          value={newBanner.purpose.purposeID || ""}
          onChange={(e) =>
            setNewBanner((prev) => ({
              ...prev,
              purpose: { purposeID: e.target.value },
            }))
          }
        />
                <label>Trạng Thái: </label>
        <select
          value={newBanner.status}
          onChange={(e) =>
            setNewBanner((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>

        <button onClick={handleCreate}>Tạo Banner</button>
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
              <th>Flower ID</th>
              <th>News ID</th>
              <th>Category ID</th>
              <th>Purpose ID</th>
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
                <td>{banner.flower ? banner.flower.flowerID : "N/A"}</td>
                <td>{banner.news ? banner.news.newsID : "N/A"}</td>
                <td>{banner.category ? banner.category.categoryID : "N/A"}</td>
                <td>{banner.purpose ? banner.purpose.purposeID : "N/A"}</td>
                <td>{banner.status}</td>
                <td>
                  {editingBannerId === banner.bannerID ? (
                    <>
                      <button onClick={() => handleSave(banner.bannerID, newBanner)}>Lưu</button>
                      <button onClick={() => setEditingBannerId(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
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
                      <button onClick={() => handleDeleteSoft(banner.bannerID)}>Xóa Mềm</button>
                      <button onClick={() => handleDeleteHard(banner.bannerID)}>Xóa Cứng</button>
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
