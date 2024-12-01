import { BrowserRouter, Routes, Route } from "react-router-dom"; // Assurez-vous d'importer correctement

import Admin from "./page/Admin";
import Home from "./page/Home";
import Product from "./page/Product";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="admin" element={<Admin />} />
        <Route path="product" element={<Product />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
