import './App.css';
import Footer from './Component/Footer/footer';
import Header from './Component/Header/header';
import HomePage from './Component/Home/Home';
import SignUp from "./TaT/SignUp";
import VerifyOtp from './TaT/VerifyOtp';
function App() {
  return (
    <div>
      <Header/>
      <HomePage/>
      <Footer/>
    </div>
  );
}

export default App;
