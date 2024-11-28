import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import returnIcon from './ImageDashboard/return-button.png';

const AdminFlower = () => {
  const [flowerList, setFlowerList] = useState([]);
  const [newFlower, setNewFlower] = useState({
    name: "",
    description: "",
    image: "",
    languageOfFlowers: "",
    category: { categoryID: null },
    purpose: { purposeID: null },
    status: "ENABLE",
  });
  const [editingFlowerId, setEditingFlowerId] = useState(null);
  const [error, setError] = useState(null);
  const accesstoken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0); 

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/admin/flower", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        setFlowerList(data || []);
      } catch (err) {
        console.error("Error fetching flowers:", err.message);
        setError(err.message);
      }
    };

    fetchFlowers();
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
        setNewFlower((prev) => ({
          ...prev,
          image: imageUrl,
        }));
        console.log("Upload successful:", imageUrl);
      } else {
        console.error("Upload error:", data.EM);
      }
    } catch (err) {
      console.error("Upload error:", err.message);
    }
  };

  const handleDeleteSoft = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flower/softdelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setFlowerList((prev) =>
          prev.map((flower) =>
            flower.flowerID === id ? { ...flower, status: "DISABLE" } : flower
          )
        );
      } else {
        throw new Error("Unable to disable flower.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHard = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flower/harddelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setFlowerList((prev) => prev.filter((flower) => flower.flowerID !== id));
      } else {
        throw new Error("Unable to delete flower.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (id, flowerData) => {
    try {
      const formattedData = {
        ...flowerData,
      };
      console.log("Data to be saved (Edit):", JSON.stringify(formattedData));

      const response = await fetch(
        `http://localhost:8080/api/v1/admin/flower/${id}`,
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
        const updatedFlower = await response.json();
        setFlowerList((prev) =>
          prev.map((flower) => (flower.flowerID === id ? updatedFlower : flower))
        );
        setEditingFlowerId(null);
        window.scrollTo(0, scrollPosition);  // Ensure scrollPosition is a valid number

      } else {
        throw new Error("Unable to update flower.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const formattedData = {
        ...newFlower,
      };
      console.log("Data to be created (New Flower):", JSON.stringify(formattedData));

      const response = await fetch("http://localhost:8080/api/v1/admin/flower", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        const createdFlower = await response.json();
        setFlowerList([...flowerList, createdFlower]);
        setNewFlower({
          name: "",
          description: "",
          image: "",
          languageOfFlowers: "",
          category: { categoryID: null },
          purpose: { purposeID: null },
          status: "ENABLE",
        });
      } else {
        throw new Error("Unable to create flower.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  
  const handleEdit = (flower) => {
    setScrollPosition(window.scrollY);
    setEditingFlowerId(flower.flowerID);
    setNewFlower({ ...flower });
    window.scrollTo(0, 0);

  };

  return (
    <div className="admin-ql-container">
      <div className="title-container">
        <img
          src={returnIcon}
          alt="Return"
          className="return-button"
          onClick={handleBackToDashboard}
        />
        <h2>Quản lý hoa</h2>
      </div>

      <h3>{editingFlowerId ? "Chỉnh sửa hoa" : "Thêm mới hoa"}</h3>
      <div>
        <label>Tên Hoa:</label>
        <input
          type="text"
          value={newFlower.name}
          onChange={(e) =>
            setNewFlower((prev) => ({ ...prev, name: e.target.value }))
          }
        />

        <label>Mô tả:</label>
        <textarea
          value={newFlower.description}
          onChange={(e) =>
            setNewFlower((prev) => ({ ...prev, description: e.target.value }))
          }
        ></textarea>

        <label>Ngôn Ngữ Hoa:</label>
        <textarea
          value={newFlower.languageOfFlowers}
          onChange={(e) =>
            setNewFlower((prev) => ({ ...prev, languageOfFlowers: e.target.value }))
          }
        ></textarea>

        <label>Danh Mục:</label>
        <input
          type="number"
          value={newFlower.category.categoryID || ""}
          onChange={(e) =>
            setNewFlower((prev) => ({
              ...prev,
              category: { categoryID: e.target.value },
            }))
          }
        />

        <label>Mục Đích:</label>
        <input
          type="number"
          value={newFlower.purpose.purposeID || ""}
          onChange={(e) =>
            setNewFlower((prev) => ({
              ...prev,
              purpose: { purposeID: e.target.value },
            }))
          }
        />

        <label>Image:</label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadImage}>Upload Image</button>
        {imageUrl && <img src={imageUrl} alt="Flower" style={{ width: 100 }} />}

        <label>Trạng Thái:</label>
        <select
          value={newFlower.status}
          onChange={(e) =>
            setNewFlower((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <option value="ENABLE">Enable</option>
          <option value="DISABLE">Disable</option>
        </select>

        <button onClick={editingFlowerId ? () => handleSave(editingFlowerId, newFlower) : handleCreate}>
          {editingFlowerId ? "Save Changes" : "Create Flower"}
        </button>
      </div>

      <h3>Danh sách hoa</h3>
      {flowerList.length === 0 ? (
        <p>No flowers available.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Language of Flowers</th>
              <th>Category</th>
              <th>Purpose</th>
              <th>Image</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flowerList.map((flower) => (
              <tr key={flower.flowerID}>
                <td>{flower.flowerID}</td>
                <td>{flower.name}</td>
                <td>{flower.description}</td>
                <td>{flower.languageOfFlowers}</td>
                <td>{flower.category.categoryName}</td>
                <td>{flower.purpose.purposeName}</td>
                <td>
                  <img
                    src={flower.image}
                    alt="Flower"
                    style={{ width: 100 }}
                  />
                </td>
                <td>{flower.status}</td>
                <td>
                  <button onClick={() => handleEdit(flower)}>Sửa</button>
                  <button onClick={() => handleDeleteSoft(flower.flowerID)}>
                    Vô hiệu hóa
                  </button>
                  <button onClick={() => handleDeleteHard(flower.flowerID)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default AdminFlower;
