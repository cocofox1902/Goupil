import { BrowserRouter, Routes, Route } from "react-router-dom";

import Admin from "./page/Admin/Admin";
import Home from "./page/Home/Home";
import Product from "./page/Product/Product";
import ProductPage from "./page/Product/ProductPage";
import Cart from "./page/Product/Cart";
import Login from "./page/Login/Login";
import Page404 from "./page/404";
import "./index.css";
import Profile from "./page/Login/Profile";
import PasswordChange from "./page/Login/PasswordChange";
import PasswordChangeur from "./page/Login/PasswordChangeur";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="admin" element={<Admin />} />
        <Route path="product" element={<Product />} />
        <Route path="login" element={<Login />} />
        <Route path="/product/:productSlug" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<PasswordChange />} />
        <Route path="/reset-password" element={<PasswordChangeur />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
