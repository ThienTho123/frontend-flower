import "./App.css";

import Dashboard from "./TaT/AdminDashboard/giaodien";
import AdminOder from "./TaT/AdminDashboard/AdminOder";
import AdminBanner from "./TaT/AdminDashboard/AdminBanner";
import AdminAccount from "./TaT/AdminDashboard/AdminAccount";
import AdminOrderDetail from "./TaT/AdminDashboard/AdminOrderDetail";
import AdminCategory from "./TaT/AdminDashboard/AdminCategory";
import AdminComment from "./TaT/AdminDashboard/AdminComment";
import AdminCommentType from "./TaT/AdminDashboard/AdminCommentType";
import AdminDiscount from "./TaT/AdminDashboard/AdminDiscount";
import AdminFlower from "./TaT/AdminDashboard/AdminFlower";
import AdminFlowerImage from "./TaT/AdminDashboard/AdminFlowerImage";
import AdminFlowerSize from "./TaT/AdminDashboard/AdminFlowerSize";
import AdminNews from "./TaT/AdminDashboard/AdminNews";
import AdminPurpose from "./TaT/AdminDashboard/AdminPurpose";
import AdminRepcomment from "./TaT/AdminDashboard/AdminRepcomment";
import AdminReview from "./TaT/AdminDashboard/AdminReview";
import AdminShipping from "./TaT/AdminDashboard/AdminShipping";
import NeedShip from "./TaT/ShipperAccount/NeedShip.js";
import AdminType from "./TaT/AdminDashboard/AdminType";
import AdminDelivery from "./TaT/AdminDashboard/AdminDelivery";
import AdminCanceldelivery from "./TaT/AdminDashboard/AdminCanceldelivery";
import RefundOrder from "./TaT/UserAccount/RefundOrder.js";
import StaffDashboard from "./TaT/StaffDashboard/StaffDashboard.js";
import StaffFlower from "./TaT/StaffDashboard/StaffFlower.js";
import StaffFlowerImage from "./TaT/StaffDashboard/StaffFlowerImage.js";
import StaffFlowerSize from "./TaT/StaffDashboard/StaffFlowerSize.js";
import StaffOrder from "./TaT/StaffDashboard/StaffOrder.js";
import StaffOrderDetail from "./TaT/StaffDashboard/StaffOrderDetail.js";
import StaffDelivery from "./TaT/StaffDashboard/StaffDelivery.js";
import StaffCanceldelivery from "./TaT/StaffDashboard/StaffCanceldelivery.js";
import StaffPreorderDetails from "./TaT/StaffDashboard/StaffPreopenDetail.js";
import AccountStaffLayout from "./TaT/StaffAccount/AccountStaffLayout.js";
import ChangeStaffPassword from "./TaT/StaffAccount/ChangePassword.js";
import ProfileStaff from "./TaT/StaffAccount/Profile.js";
import ChangeShipperPassword from "./TaT/ShipperAccount/ChangePassword.js";
import ProfileShipper from "./TaT/ShipperAccount/Profile.js";
import AccountShipperLayout from "./TaT/ShipperAccount/AccountShipperLayout.js";
import CompleteComment from "./TaT/StaffAccount/CompleteComment.js";
import StaffCommentDetail from "./TaT/StaffAccount/SendCommentDetail.js";
import ProcessingComment from "./TaT/StaffAccount/ProcessingComment.js";
import WaitingComment from "./TaT/StaffAccount/WaitingComment.js";
import OrderShipped from "./TaT/ShipperAccount/OrderShipped.js";
import OrderShippedDetail from "./TaT/ShipperAccount/OrderShippedDetail.js";
import AllOrder from "./TaT/ShipperAccount/AllOrder.js";
import Footer from "./Component/Footer/footer";
import Header from "./Component/Header/header";
import BackToTop from "./Component/BackToTop/BackToTop";
import HomePage from "./Component/Home/Home";
import SignUp from "./TaT/SignUp";
import Login from "./TaT/login";
import VerifyOtp from "./TaT/VerifyOtp";
import Forgot from "./TaT/Forgot";
import ProductList from "./Component/ProductList/ProductList";
import ProductDetail from "./TaT/ProductDetail";
import PreBuy from "./TaT/UserAccount/PreBuy";
import NewsList from "./TaT/NewsList";
import NewsDetail from "./TaT/NewsDetail";
import PaymentFailure from "./TaT/UserAccount/PaymentFailure";
import PaymentSuccess from "./TaT/UserAccount/PaymentSuccess";
import HistoryOrderDetail from "./TaT/UserAccount/HistoryOrderDetail.js";
import AccountLayout from "./TaT/UserAccount/AccountLayout";
import HistoryOrder from "./TaT/UserAccount/HistoryOrder";
import SendComment from "./TaT/UserAccount/SendComment.js";
import Profile from "./TaT/UserAccount/Profile";
import ChangePassword from "./TaT/UserAccount/ChangePassword";
import PurchaseHistory from "./TaT/UserAccount/PurchaseHistory";
import PreorderDetail from "./TaT/UserAccount/Preorderdetail.js";
import Wishlist from "./TaT/UserAccount/Wishlist";
import Find from "./TaT/find";
import RefundPreorder from "./TaT/UserAccount/RefundPreorder.js";
import Preorder from "./TaT/UserAccount/Preorder.js";
import SendCommentDetail from "./TaT/UserAccount/SendCommentDetail.js";
import StaffRefund from "./TaT/StaffDashboard/StaffRefund.js";
import AdminRefund from "./TaT/AdminDashboard/AdminRefund.js";
import AdminPreorder from "./TaT/AdminDashboard/AdminPreorder.js";
import AdminPreorderDetails from "./TaT/AdminDashboard/AdminPreorderDetail.js";
import StaffPreorder from "./TaT/StaffDashboard/StaffPreorder.js";
import BlogFeed from "./TaT/Blog.js";
import BlogDetail from "./TaT/BlogID.js";
import BlogPin from "./TaT/UserAccount/Blogpin.js";
import StaffBlog from "./TaT/StaffDashboard/StaffBlog.js";
import CommentPage from "./TaT/CommentPage.js";
import CreateBlogForm from "./TaT/StaffDashboard/NewBlog.js";
import EditBlogForm from "./TaT/StaffDashboard/EditBlog.js";
import AdminEditBlogForm from "./TaT/AdminDashboard/AdminEditBlog.js";
import AdminCreateBlogForm from "./TaT/AdminDashboard/AdminNewBlog.js";
import AdminBlog from "./TaT/AdminDashboard/AdminBlog.js";
import StaffEvent from "./TaT/StaffDashboard/StaffEvent.js";
import AdminEvent from "./TaT/AdminDashboard/AdminEvent.js";
import NewEvent from "./TaT/StaffDashboard/NewEvent.js";
import EditEvent from "./TaT/StaffDashboard/EditEvent.js";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import React, { useEffect } from "react";
import OrderDetail from "./TaT/ShipperAccount/OrderDetail.js";
const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  // List of admin routes where Header and Footer should be hidden
  const adminRoutes = [
    "/dashboard",
    "/AdminOder",
    "/AdminBanner",
    "/AdminAccount",
    "/AdminOrderDetail",
    "/AdminCategory",
    "/AdminComment",
    "/AdminCommentType",
    "/AdminDiscount",
    "/AdminFlower",
    "/AdminFlowerImage",
    "/AdminFlowerSize",
    "/AdminNews",
    "/AdminPurpose",
    "/AdminRepcomment",
    "/AdminReview",
    "/AdminShipping",
    "/AdminType",
    "/AdminDelivery",
    "/AdminCanceldelivery",
    "/StaffFlower",
    "/staff",
    "/StaffFlowerImage",
    "/StaffFlowerSize",
    "/StaffOrder",
    "/StaffOrderDetail",
    "/StaffOrderDetail",
    "/StaffCanceldelivery",
    "/StaffDelivery",
  ];

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
        <Route path="/blog" element={<BlogFeed />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/comment/:id" element={<CommentPage />} />

        {/* Admin routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/AdminOder" element={<AdminOder />} />
        <Route path="/AdminBanner" element={<AdminBanner />} />
        <Route path="/AdminAccount" element={<AdminAccount />} />
        <Route path="/AdminOrderDetail" element={<AdminOrderDetail />} />
        <Route path="/AdminCategory" element={<AdminCategory />} />
        <Route path="/AdminComment" element={<AdminComment />} />
        <Route path="/AdminCommentType" element={<AdminCommentType />} />
        <Route path="/AdminDiscount" element={<AdminDiscount />} />
        <Route path="/AdminFlower" element={<AdminFlower />} />
        <Route path="/AdminFlowerImage" element={<AdminFlowerImage />} />
        <Route path="/AdminFlowerSize" element={<AdminFlowerSize />} />
        <Route path="/AdminNews" element={<AdminNews />} />
        <Route path="/AdminPurpose" element={<AdminPurpose />} />
        <Route path="/AdminRepcomment" element={<AdminRepcomment />} />
        <Route path="/AdminReview" element={<AdminReview />} />
        <Route path="/AdminShipping" element={<AdminShipping />} />
        <Route path="/AdminType" element={<AdminType />} />
        <Route path="/AdminDelivery" element={<AdminDelivery />} />
        <Route path="/AdminCanceldelivery" element={<AdminCanceldelivery />} />
        <Route path="/AdminRefund" element={<AdminRefund />} />
        <Route path="/AdminPreorder" element={<AdminPreorder />} />
        <Route path="/AdminPreorder/:id" element={<AdminPreorderDetails />} />
        <Route path="/AdminBlog/new-blog" element={<AdminCreateBlogForm />} />
        <Route path="/shop-blog/:id" element={<AdminEditBlogForm />} />
        <Route path="/AdminBlog" element={<AdminBlog />} />
        <Route path="/AdminEvent" element={<AdminEvent />} />

        {/* Staff routes */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/StaffFlower" element={<StaffFlower />} />
        <Route path="/StaffFlowerImage" element={<StaffFlowerImage />} />
        <Route path="/StaffFlowerSize" element={<StaffFlowerSize />} />
        <Route path="/StaffOrder" element={<StaffOrder />} />
        <Route path="/StaffOrderDetail" element={<StaffOrderDetail />} />
        <Route path="/StaffDelivery" element={<StaffDelivery />} />
        <Route path="/StaffCanceldelivery" element={<StaffCanceldelivery />} />
        <Route path="/StaffRefund" element={<StaffRefund />} />
        <Route path="/StaffPreOrder" element={<StaffPreorder />} />
        <Route path="/StaffBlog" element={<StaffBlog />} />
        <Route path="/StaffEvent" element={<StaffEvent />} />
        <Route path="/StaffEvent/new-event" element={<NewEvent />} />
        <Route path="/StaffEvent/edit/:id" element={<EditEvent />} />
        <Route path="/StaffPreOrder/:id" element={<StaffPreorderDetails />} />
        <Route path="/StaffBlog/new-blog" element={<CreateBlogForm />} />
        <Route path="/myblog/:id" element={<EditBlogForm />} />

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
          <Route path="history" element={<HistoryOrder />} />
          <Route path="preorder" element={<Preorder />} />
          <Route path="preorder/:id" element={<PreorderDetail />} />
          <Route path="preorder/refund/:id" element={<RefundPreorder />} />
          <Route path="history/:id" element={<HistoryOrderDetail />} />
          <Route path="order/refund/:id" element={<RefundOrder />} />
          <Route path="sendcomment" element={<SendComment />} />
          <Route path="blogpin" element={<BlogPin />} />
          <Route path="sendcomment/:id" element={<SendCommentDetail />} />
        </Route>

        <Route path="/staffaccount" element={<AccountStaffLayout />}>
          <Route index element={<ProfileStaff />} />
          <Route path="changepassword" element={<ChangeStaffPassword />} />
          <Route path="completecomment" element={<CompleteComment />} />
          <Route path="processingcomment" element={<ProcessingComment />} />
          <Route path="waitingcomment" element={<WaitingComment />} />

          <Route path="comment/:id" element={<StaffCommentDetail />} />
        </Route>

        <Route path="/shipperaccount" element={<AccountShipperLayout />}>
          <Route index element={<ProfileShipper />} />
          <Route path="changepassword" element={<ChangeShipperPassword />} />
          <Route path="ordershipped" element={<OrderShipped />} />
          <Route path="allorder" element={<AllOrder />} />
          <Route path="needship" element={<NeedShip />} />

          <Route path="ordershipped/:id" element={<OrderShippedDetail />} />
          <Route path="orderdetail/:id" element={<OrderDetail />} />
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
