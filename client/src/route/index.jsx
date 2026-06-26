import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/ResetPassword";
import UserMenuMobile from "../pages/UserMenuMobile";
import Dashboard from "../layouts/Dashboard";
import Profile from "../pages/Profile";
import MyOrders from "../pages/MyOrders";
import Address from "../pages/Address";
import CategoryPage from "../pages/CategoryPage";
import SubCategoryPage from "../pages/SubCategoryPage";
import UploadProduct from "../pages/UploadProduct";
import ProductAdmin from "../pages/ProductAdmin";
import AdminPermision from "../layouts/AdminPermision";
import ProductListPage from "../pages/ProductListPage";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import CartMobile from "../pages/CartMobile";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import Cancel from "../pages/Cancel";

// DesiKit Dashboard additions
import WalletDashboard from "../pages/WalletDashboard";
import SupportDashboard from "../pages/SupportDashboard";
import FarmerStats from "../pages/FarmerStats";
import FarmerProducts from "../pages/FarmerProducts";
import FarmerOrders from "../pages/FarmerOrders";
import DeliveryStats from "../pages/DeliveryStats";
import DeliveryOrders from "../pages/DeliveryOrders";
import AdminStats from "../pages/AdminStats";
import AdminUsers from "../pages/AdminUsers";
import AdminVerifications from "../pages/AdminVerifications";
import AdminCoupons from "../pages/AdminCoupons";
import AdminBanners from "../pages/AdminBanners";
import BusinessHub from "../pages/BusinessHub";

const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : "search",
                element : <SearchPage/>
            },
            {
                path : 'login',
                element : <Login/>
            },
            {
                path : "register",
                element : <Register/>
            },
            {
                path : "forgot-password",
                element : <ForgotPassword/>
            },
            {
                path : "verification-otp",
                element : <OtpVerification/>
            },
            {
                path : "reset-password",
                element : <ResetPassword/>
            },
            {
                path : "user",
                element : <UserMenuMobile/>
            },
            {
                path : "dashboard",
                element : <Dashboard/>,
                children : [
                    {
                        path : "profile",
                        element : <Profile/>
                    },
                    {
                        path : "myorders",
                        element : <MyOrders/>
                    },
                    {
                        path : "address",
                        element : <Address/>
                    },
                    {
                        path : 'category',
                        element : <AdminPermision><CategoryPage/></AdminPermision>
                    },
                    {
                        path : "subcategory",
                        element : <AdminPermision><SubCategoryPage/></AdminPermision>
                    },
                    {
                        path : 'upload-product',
                        element : <AdminPermision><UploadProduct/></AdminPermision>
                    },
                    {
                        path : 'product',
                        element : <AdminPermision><ProductAdmin/></AdminPermision>
                    },
                    // DesiKit Dashboard sub-paths
                    {
                        path : "wallet",
                        element : <WalletDashboard/>
                    },
                    {
                        path : "support",
                        element : <SupportDashboard/>
                    },
                    {
                        path : "farmer-stats",
                        element : <FarmerStats/>
                    },
                    {
                        path : "farmer-products",
                        element : <FarmerProducts/>
                    },
                    {
                        path : "farmer-orders",
                        element : <FarmerOrders/>
                    },
                    {
                        path : "delivery-stats",
                        element : <DeliveryStats/>
                    },
                    {
                        path : "delivery-orders",
                        element : <DeliveryOrders/>
                    },
                    {
                        path : "admin-stats",
                        element : <AdminStats/>
                    },
                    {
                        path : "admin-users",
                        element : <AdminUsers/>
                    },
                    {
                        path : "admin-verifications",
                        element : <AdminVerifications/>
                    },
                    {
                        path : "admin-coupons",
                        element : <AdminCoupons/>
                    },
                    {
                        path : "admin-banners",
                        element : <AdminBanners/>
                    },
                    {
                        path : "business-hub",
                        element : <BusinessHub/>
                    }
                ]
            },
            {
                path : ":category",
                children : [
                    {
                        path : ":subCategory",
                        element : <ProductListPage/>
                    }
                ]
            },
            {
                path : "product/:product",
                element : <ProductDisplayPage/>
            },
            {
                path : 'cart',
                element : <CartMobile/>
            },
            {
                path : "checkout",
                element : <CheckoutPage/>
            },
            {
                path : "success",
                element : <Success/>
            },
            {
                path : 'cancel',
                element : <Cancel/>
            }
        ]
    }
])

export default router