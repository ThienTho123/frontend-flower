import './App.css';

import Dashboard from "./TaT/AdminDashboard/giaodien";
import AdminOder from "./TaT/AdminDashboard/AdminOder";
import AdminBanner from "./TaT/AdminDashboard/AdminBanner";
import AdminAccount from "./TaT/AdminDashboard/AdminAccount";
import AdminOrderDetail from "./TaT/AdminDashboard/AdminOrderDetail";

import Footer from './Component/Footer/footer';
import Header from './Component/Header/header';
import BackToTop from './Component/BackToTop/BackToTop';
import HomePage from './Component/Home/Home';
import SignUp from "./TaT/SignUp";
import Login from "./TaT/login";
import VerifyOtp from './TaT/VerifyOtp';
import Forgot from "./TaT/Forgot";
import ProductList from "./Component/ProductList/ProductList";
import ProductDetail from "./TaT/ProductDetail";
import PreBuy from "./TaT/UserAccount/PreBuy";
import NewsList from "./TaT/NewsList";
import NewsDetail from "./TaT/NewsDetail";
import PaymentFailure from "./TaT/UserAccount/PaymentFailure";
import PaymentSuccess from "./TaT/UserAccount/PaymentSuccess";
import AccountLayout from "./TaT/UserAccount/AccountLayout";
import Profile from "./TaT/UserAccount/Profile";
import ChangePassword from "./TaT/UserAccount/ChangePassword";
import PurchaseHistory from "./TaT/UserAccount/PurchaseHistory";
import Wishlist from "./TaT/UserAccount/Wishlist";
import Find from "./TaT/find";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';  
import React, { useEffect } from "react";

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location
  
  // List of admin routes where Header and Footer should be hidden
  const adminRoutes = ["/dashboard", "/AdminOder", "/AdminBanner", "/AdminAccount", "/AdminOrderDetail"];  

  // Check if the current route is an admin route
  const isAdminRoute = adminRoutes.includes(location.pathname);  

  useEffect(() => {
    const loginTime = localStorage.getItem("loginTime");
    const expirationTime = 86400000; 

    if (loginTime) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - loginTime;

      if (timeElapsed > expirationTime) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("accountID");
        localStorage.removeItem("loginTime");

        navigate("/login");
      }
    }
  }, [navigate]);

  return (
    <>
      {/* Only render Header and Footer if it's not an admin route */}
      {!isAdminRoute && <Header />}
      <BackToTop />  
      <Routes>
        <Route path="/" element={<HomePage />} /> 
        <Route path="/signup" element={<SignUp />} /> 
        <Route path="/verify-otp" element={<VerifyOtp />} /> 
        <Route path="/find" element={<Find />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/forgot" element={<Forgot />} /> 

        {/* Admin routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/AdminOder" element={<AdminOder />} />
        <Route path="/AdminBanner" element={<AdminBanner />} />
        <Route path="/AdminAccount" element={<AdminAccount />} />
        <Route path="/AdminOrderDetail" element={<AdminOrderDetail />} />

        {/* Other Routes */}
        <Route path="/product" element={<ProductList />} />
        <Route path="/detail/:id" element={<ProductDetail />} /> 
        <Route path="/prebuy" element={<PreBuy />} /> 
        <Route path="/news" element={<NewsList />} /> 
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/PaymentFailure" element={<PaymentFailure />} />
        <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Profile />} />
          <Route path="changepassword" element={<ChangePassword />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="orders" element={<PurchaseHistory />} />
        </Route>
      </Routes>
      {/* Only render Footer if it's not an admin route */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
