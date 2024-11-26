import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import phonenumberImg from "./Image/telephone.png";
import emailImg from "./Image/mail.png";
import addressImg from "./Image/location.png";
import nameImg from "./Image/id-card.png";
import roleImg from "./Image/group-chat.png";
const Profile = () => {
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({});
  const [error, setError] = useState({});
  const [isEditable, SetIsEditable] = useState(false);
  const accountID = localStorage.getItem("accountID");
  const access_token = localStorage.getItem("access_token");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const handleEdit = () => {
    SetIsEditable(!isEditable);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const formError = validate();

    if (Object.keys(formError).length > 0) {
      setError(formError);
      return;
    }

    updateAccount();

    SetIsEditable(!isEditable);
    console.log("profile form data: ", JSON.stringify(profileForm));
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
          // withCredentials: true,  // Include cookies in the request

        }
      );
      console.log("data of user infor: ", response.data);
      setProfileForm(response.data);
    } catch (error) {
      if (error.response) {
        console.log("Error response: ");
        console.log("Respone data: ",error.response.data);
        console.log("Respone data: ", error.response.status);
        console.log("Respone data: ", error.response.headers);
      } else if (error.request) {
        console.log("Error request: ",error.request);
      } else {
        console.log("Error message:", error.message);
      }
      console.log("Error config:", error.config);
    }
  };

  useEffect(() => {
    if(accountID && access_token) {
      //TODO check token expire if it expired navigate to login page
      getUserInfor();
    } else {
      navigate("/login"); // Redirect to login page if not authenticated
    }
  },[]);
  
  const updateAccount = async () => {
    try {
      const response = await axios.put(
        "http://localhost:8080/account/updateinfo",
        {
          name: profileForm.name,
          email: profileForm.email,
          phonenumber: profileForm.phonenumber,
          address: profileForm.address,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          // withCredentials: true,  // Optional: Use this if your API requires sending cookies
        }
      );
      console.log("data of user infor after update: ", response.data);
      alert(response.data);
    } catch (error) {
      if (error.response) {
        console.log("Error response: ");
        console.log("Respone data: ",error.response.data);
        console.log("Respone data: ", error.response.status);
        console.log("Respone data: ", error.response.headers);
      } else if (error.request) {
        console.log("Error request: ",error.request);
      } else {
        console.log("Error message:", error.message);
      }
      console.log("Error config:", error.config);
    }
  }
    return (
      <div className="profile-container">
          <h2 style={{margin:'0 8px'}}>Thông tin cá nhân</h2>
        <div>
          <form onSubmit={handleSubmit} className="profile-form">
            <section className="profile-form-section">

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
                  {error.name && <span classname="form-error">{error.name}</span>}
                </div>
              </div>

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
                  {error.email && <span classname="form-error">{error.email}</span>}
                </div>
              </div>

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
                  {error.phonenumber && <span classname="form-error">{error.phonenumber}</span>}
                </div>
              </div>

            </section>

            <section className="profile-form-section">

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
                  {error.address && <span classname="form-error">{error.address}</span>}
                </div>
              </div>

              <div className="profile-form-group">
                <div className="form-icon">
                  <img src={roleImg} alt="role" />
                </div>
                <div className="form-ipnput">
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

            <div>
              {!isEditable && (
                <button type="button" onClick={handleEdit}>
                  edit
                </button>
              )}
              {isEditable && <button type="submit">Lưu</button>}
            </div>
          </form>
        </div>
      </div>
    );
  };
export default Profile;
