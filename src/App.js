import './App.css';
import Footer from './Component/Footer/footer';
import Header from './Component/Header/header';
import HomePage from './Component/Home/Home';
import SignUp from "./TaT/SignUp";
import Login from "./TaT/login";
import VerifyOtp from './TaT/VerifyOtp';
import Forgot from "./TaT/Forgot";
import ProductList from "./Component/ProductList/ProductList";
import PreBuy from "./TaT/UserAccount/PreBuy";

import { BrowserRouter, Routes, Route } from 'react-router-dom';  

function App() {
  return (
    <BrowserRouter> 
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} /> 
          <Route path="/signup" element={<SignUp />} /> 
          <Route path="/verify-otp" element={<VerifyOtp />} /> 
          <Route path="/product" element={<ProductList />} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/prebuy" element={<PreBuy/>} /> 
          <Route path="/forgot" element={<Forgot/>} /> 
          <Route path="/verify-otp" element={<VerifyOtp/>} /> 

        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
