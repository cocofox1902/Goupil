import React, { useState, useEffect } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

function Product() {
  const baseUrl = "/product";
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
    <div className="bg-cream w-full h-min-[100vh] h-screen">
      <NavBar />
      <div className="mx-[10vw] mt-[100px] md:flex p-second">
        <div className="text-blue md:mr-[5vw] justify-items-center">
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
          <div className="grid md:grid-cols-3 grid-cols-1 gap-x-14 gap-y-10">
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
                  <img
                    src={product.color[0].photo[0]?.url}
                    className="w-64 h-72 cursor-pointer object-cover object-center"
                    alt="product"
                    onClick={() => changeWindow(product.productSlug)}
                  />
                  <div className="text-blue mt-2">
                    <p className="font-medium leading-5 text-lg">
                      {product.productName}
                    </p>
                    <p className=" text-sm">{product.productPrice.toFixed(2)} €</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Product;
