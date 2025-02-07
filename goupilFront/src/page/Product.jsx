import React, { useState, useEffect } from "react";
import isConnected from "./TokenValidator";
import NavBar from "./Components/NavBar";

function Product() {
  const baseUrl = "http://localhost:5173/product";
  const [products, setProducts] = useState([]);

  const changeWindow = (link) => {
    window.location.href = `${baseUrl}/${link}`;
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const [typeOfProduct, setTypeOfProduct] = useState([]);

  const showProduct = (productType) => {
    setTypeOfProduct((prevProducts) =>
      prevProducts.includes(productType)
        ? prevProducts.filter((item) => item !== productType)
        : [...prevProducts, productType]
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-cream w-full p-second h-min-[100vh] h-screen">
      <NavBar />
      <div className="mx-[10vw] mt-[100px] flex">
        <div className="text-blue mr-[5vw]">
          <button
            className={`block ${
              typeOfProduct.includes("Desk") ? "underline" : ""
            }`}
            onClick={() => showProduct("Desk")}
          >
            Lampe de bureau
          </button>
          <button
            className={`block ${
              typeOfProduct.includes("Stand Alone") ? "underline" : ""
            }`}
            onClick={() => showProduct("Stand Alone")}
          >
            Lampe sur pied
          </button>
          <button
            className={`block ${
              typeOfProduct.includes("Applique") ? "underline" : ""
            }`}
            onClick={() => showProduct("Applique")}
          >
            Applique
          </button>
          <button
            className={`block ${
              typeOfProduct.includes("Plafonnier") ? "underline" : ""
            }`}
            onClick={() => showProduct("Plafonnier")}
          >
            Plafonnier
          </button>
        </div>
        <div className="text-prime">
          <div className="grid grid-cols-3 gap-x-14">
            {products.map((product) => {
              if (product.isVisible === false) return null;
              if (
                typeOfProduct.length > 0 &&
                !typeOfProduct.includes(product.categories)
              ) {
                return null;
              }
              return (
                <div key={product.productSlug}>
                  <div
                    className="bg-red-900 w-64 h-[19rem] cursor-pointer"
                    onClick={() => changeWindow(product.productSlug)}
                  ></div>
                  <div>
                    <p className="font-bold">{product.productName}</p>
                    <p>{product.productPrice} €</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
