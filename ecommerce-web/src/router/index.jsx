import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import GuestRoute from "./GuestRoute";
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Products from "../pages/Product/Products";
import ProductDetail from "../pages/Product/ProductDetail";
import Categories from "../pages/Category/Categories";
import Cart from "../pages/Cart/Cart";
import Favorites from "../pages/Favorite/Favorites";
import Orders from "../pages/Order/Orders";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import NotFound from "../pages/NotFound/NotFound";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/products", element: <Products /> },
      { path: "/products/:id", element: <ProductDetail /> },
      { path: "/categories", element: <Categories /> },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/cart", element: <Cart /> },
          { path: "/favorites", element: <Favorites /> },
          { path: "/orders", element: <Orders /> },
          { path: "/profile", element: <Profile /> },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ path: "/dashboard", element: <Dashboard /> }],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
