import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import isConnected from "./TokenValidator";
import NavBar from "./Components/NavBar";

const ProductPage = () => {
  const { productSlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    if (localStorage.getItem("token")) {
      (async () => {
        const result = await isConnected();
        setConnected(result);
      })();
    }
  }, []);

  useEffect(() => {
    if (connected && connected.user && connected.user.cart) {
      setCart(connected.user.cart);
      const totalQuantity = connected.user.cart.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
    }
  }, [connected]);

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [cart, setCart] = useState([]);

  const handleColorClick = (index) => {
    setSelectedColorIndex(index);
    setSelectedPhotoIndex(0);
  };

  if (loading) {
    return <div className="text-center p-10">Chargement...</div>;
  }

  const product = products.find((p) => p.productSlug === productSlug);

  if (!product) {
    window.location.href = "/404";
  }

  const handleAddToCart = (productId) => {
    setCart((prevCart) => {
      let updatedCart;
      const existingProductIndex = prevCart.findIndex(
        (item) =>
          item.productId === productId && item.colorRow === selectedColorIndex
      );

      if (existingProductIndex !== -1) {
        updatedCart = prevCart.map((item, index) =>
          index === existingProductIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [
          ...prevCart,
          { productId, colorRow: selectedColorIndex, quantity: 1 },
        ];
      }

      updateUser({ cart: updatedCart }).then(() => {
        setCart(updatedCart);
      });

      return updatedCart;
    });
  };

  const updateUser = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Aucun token trouvé.");
        return;
      }

      const response = await fetch("http://localhost:3000/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, ...updatedData }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Erreur lors de la mise à jour de l'utilisateur:",
          data.error
        );
        return;
      }

      window.location.reload();

      return data.user;
    } catch (error) {
      console.error("Erreur de connexion avec l'API:", error);
    }
  };

  return (
    <div className="bg-[#f6f0e8] min-h-screen p-second">
      <NavBar />
      <div className="w-full flex justify-center pt-11">
        <div className="col-span-1 flex flex-col items-center p-prime">
          <img
            src={
              product.color[selectedColorIndex].photo[selectedPhotoIndex].url
            }
            alt={
              product.color[selectedColorIndex].photo[selectedPhotoIndex]
                .altText
            }
            className="w-[28vw] h-[30vw] bg-red-500"
          />
          <div className="flex justify-between mt-second w-[28vw]">
            {product.color[selectedColorIndex].photo.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={img.altText}
                onClick={() => setSelectedPhotoIndex(index)}
                className="w-[8vw] h-[8vw] bg-red-500 hover:opacity-80 cursor-pointer"
              />
            ))}
          </div>
        </div>

        <div className="pt-prime p-10 text-blue">
          <h2 className="text-3xl font-bold">{product.productName}</h2>
          <p className="text-2xl mt-2">€ {product.productPrice}</p>

          <div className="mt-4">
            <p className="font-semibold">Couleur</p>
            <div className="flex space-x-2 mt-2">
              {product.color?.map((color, index) => {
                return color.second === "" ? (
                  <button
                    key={index}
                    className={`w-6 h-6 rounded-full ${
                      selectedColorIndex === index ? "border-2 border-blue" : ""
                    }`}
                    style={{
                      background: color.first,
                    }}
                    onClick={() => handleColorClick(index)}
                  ></button>
                ) : (
                  <button
                    key={index}
                    className={`w-6 h-6 rounded-full ${
                      selectedColorIndex === index ? "border-2 border-blue" : ""
                    }`}
                    style={{
                      background: `linear-gradient(to bottom right, ${color.first} 50%, ${color.second} 50%)`,
                    }}
                    onClick={() => handleColorClick(index)}
                  ></button>
                );
              })}
            </div>
          </div>
          <p className="text-sm mt-4 max-w-80 justify-normal">
            {product.productDescription}
          </p>
          <div className="mt-4">
            <button
              disabled={!product.isVisible}
              onClick={() => {
                if (connected) {
                  handleAddToCart(product._id);
                }
              }}
              className={`bg-blue text-white py-2 px-4 rounded-md ${
                !product.isVisible ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Ajouter au panier
            </button>
          </div>
          <div className="mt-10 text-sm">
            <div className="flex">
              <p className="font-regular">Matériau :</p>
              <p className="font-light pl-2"> {product.material}</p>
            </div>
            <div className="flex">
              <p className="font-regular">Voltage :</p>
              <p className="font-light pl-2"> {product.voltage}V</p>
            </div>
            <div className="flex">
              <p className="font-regular">Poids :</p>
              <p className="font-light pl-2"> {product.weight}g</p>
            </div>
            <div className="flex">
              <p className="font-regular">Dimensions :</p>
              <p className="font-light pl-2">
                {product.dimensions[0]?.largeur}cm x{" "}
                {product.dimensions[0]?.hauteur}cm x{" "}
                {product.dimensions[0]?.profondeur}cm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
