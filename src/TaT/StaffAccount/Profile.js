import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import phonenumberImg from "./Image/telephone.png";
import emailImg from "./Image/mail.png";
import addressImg from "./Image/location.png";
import nameImg from "./Image/id-card.png";
import roleImg from "./Image/group-chat.png";

const ProfileStaff = () => {
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({});
  const [error, setError] = useState({});
  const [isEditable, SetIsEditable] = useState(false);
  const [image, setImage] = useState(null); // State to store the uploaded image
  const accountID = localStorage.getItem("accountID");
  const access_token = localStorage.getItem("access_token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleEdit = () => {
    SetIsEditable(!isEditable);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formError = validate();

    if (Object.keys(formError).length > 0) {
      setError(formError);
      return;
    }

    // Upload image if it's new
    let avatarLink = profileForm.avatar;
    if (image) {
      const link = await uploadImage(image); // Upload image and get the link
      avatarLink = link;
    }

    // Update account info with avatar link
    updateAccount(avatarLink);

    SetIsEditable(!isEditable);
    setError({});
  };

  const validate = () => {
    let formError = {};
    if (!profileForm.name) {
      formError.name = "Vui lòng nhập họ tên!";
    }
    if (!profileForm.email) {
      formError.email = "Vui lòng nhập email!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      formError.email = "Email không hợp lệ!";
    }
    if (!profileForm.phonenumber) {
      formError.phonenumber = "Vui lòng nhập số điện thoại!";
    } else if (
      profileForm.phonenumber.length !== 10 ||
      !/^(0)+([0-9]{9})$/.test(profileForm.phonenumber)
    ) {
      formError.phonenumber = "Số điện thoại không hợp lệ!";
    }
    if (!profileForm.address) {
      formError.address = "Vui lòng nhập địa chỉ!";
    }
    return formError;
  };

  const getUserInfor = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/auth/account",
        {
          params: {
            accountID: accountID,
          },
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setProfileForm(response.data);
    } catch (error) {
      console.log("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    if (accountID && access_token) {
      getUserInfor();
    } else {
      navigate("/login");
    }
  }, []);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8080/api/v1/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.EM === "success") {
        return response.data.DT; // Return the image link
      } else {
        console.log("Image upload failed:", response.data.EM);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const updateAccount = async (avatarLink) => {
    console.log("avatarLink"+avatarLink);
    try {
      const response = await axios.put(
        "http://localhost:8080/staffaccount/updateinfo",
        {
          name: profileForm.name,
          email: profileForm.email,
          phonenumber: profileForm.phonenumber,
          address: profileForm.address,
          avatar: avatarLink, 
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      alert(response.data);

    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  return (
    <div className="profile-container">
      <h2 style={{ margin: '0 8px' }}>Thông tin cá nhân</h2>
      <div>
        <form onSubmit={handleSubmit} className="profile-form">
          <section className="profile-form-section">
            {/* Họ tên */}
            <div className="profile-form-group">
              <div className="form-icon">
                <img src={nameImg} alt="name" />
              </div>
              <div className="form-input">
                <label htmlFor="name">Họ tên</label>
                <input
                  id="name"
                  type="text"
                  defaultValue={profileForm.name}
                  name="name"
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                {error.name && <span className="form-error">{error.name}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="profile-form-group">
              <div className="form-icon">
                <img src={emailImg} alt="email" />
              </div>
              <div className="form-input">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  defaultValue={profileForm.email}
                  name="email"
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                {error.email && <span className="form-error">{error.email}</span>}
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="profile-form-group">
              <div className="form-icon">
                <img src={phonenumberImg} alt="phone number" />
              </div>
              <div className="form-input">
                <label htmlFor="phonenumber">Số điện thoại</label>
                <input
                  id="phonenumber"
                  type="tel"
                  defaultValue={profileForm.phonenumber}
                  name="phonenumber"
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                {error.phonenumber && <span className="form-error">{error.phonenumber}</span>}
              </div>
            </div>
          </section>

          <section className="profile-form-section">
            {/* Địa chỉ */}
            <div className="profile-form-group">
              <div className="form-icon">
                <img src={addressImg} alt="address" />
              </div>
              <div className="form-input">
                <label htmlFor="address">Địa chỉ</label>
                <input
                  id="address"
                  type="text"
                  defaultValue={profileForm.address}
                  name="address"
                  onChange={handleChange}
                  disabled={!isEditable}
                />
                {error.address && <span className="form-error">{error.address}</span>}
              </div>
            </div>

            {/* Role */}
            <div className="profile-form-group">
              <div className="form-icon">
                <img src={roleImg} alt="role" />
              </div>
              <div className="form-input">
                <label htmlFor="role">Người dùng</label>
                <input
                  id="role"
                  type="text"
                  defaultValue={profileForm.role}
                  name="role"
                  disabled
                />
              </div>
            </div>
          </section>

          {/* Avatar upload */}
          {isEditable && (
            <section className="profile-form-section">
              <div className="profile-form-group">
                <div className="form-icon">
                  <img src={roleImg} alt="avatar" />
                </div>
                <div className="form-input">
                  <label htmlFor="avatar">Avatar</label>
                  <input
                    id="avatar"
                    type="file"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </section>
          )}

          <div>
            {!isEditable && (
              <button type="button" onClick={handleEdit}>
                Edit
              </button>
            )}
            {isEditable && <button type="submit">Lưu</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileStaff;
