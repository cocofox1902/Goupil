import { BrowserRouter, Routes, Route } from "react-router-dom";

import Admin from "./page/Admin";
import Home from "./page/Home";
import Product from "./page/Product";
import ProductPage from "./page/ProductPage";
import Cart from "./page/Cart";
import Login from "./page/Login";
import Page404 from "./page/404";
import "./index.css";
import Profile from "./page/Profile";

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
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
