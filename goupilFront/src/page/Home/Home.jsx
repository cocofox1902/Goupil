import { useState, useEffect } from "react";
import background from "../assets/background.png";
import atelierImage from "../assets/atelier.png";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";

function Home() {
  const [products, setProducts] = useState([]);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-cream">
      <NavBar />
      <img
        src={background}
        alt="background"
        className="h-[75vh] w-full absolute top-0 z-10 object-cover"
      />
      <div className="h-[75vh] w-full"></div>
      <div className="md:ml-[25%] ml-[10%] mr-[10%] text-blue">
        <p className="text-5xl font-medium">
          Éclairez votre style,
          <br /> illuminez vos émotions.
        </p>
        <p className="py-prime text-[20px]">En savoir plus</p>
      </div>
      <div className="py-16 px-24">
        <div className="md:flex justify-evenly">
          <h2 className="text-blue text-2xl font-medium">
            Nos meilleures ventes
          </h2>
          <button
            className="text-blue font-light"
            onClick={() => (window.location.href = "/product")}
          >
            Voir tous
          </button>
        </div>
        <div className="flex justify-center mt-20">
          {products.map((product, index) => (
            <div key={index} className="text-center">
              <img
                src={product.color[0].photo[0]?.url}
                alt={product.name}
                className="w-64 h-72 cursor-pointer object-cover object-center"
                onClick={() =>
                  (window.location.href = "/product/" + product.productSlug)
                }
              />
              <div className="text-blue mt-2 text-start">
                <p className="font-medium leading-5 text-lg">
                  {product.productName}
                </p>
                <p className=" text-sm">{product.productPrice.toFixed(2)} €</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#EAE0D5] p-24 flex justify-center space-x-16 font-light">
        <div className="flex flex-col items-center">
          <span className="text-blue text-4xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 85.29 69.19"
              className="w-16"
            >
              <g>
                <g id="Capa_1">
                  <g id="Capa_1-2" data-name="Capa_1">
                    <g id="Grupo_1022">
                      <circle
                        id="Elipse_35"
                        cx="64.02"
                        cy="58.67"
                        r="8.02"
                        fill="none"
                        stroke="#000063"
                        strokeWidth="5"
                      />
                      <circle
                        id="Elipse_36"
                        cx="23.9"
                        cy="58.67"
                        r="8.02"
                        fill="none"
                        stroke="#000063"
                        strokeWidth="5"
                      />
                      <path
                        id="Trazado_104"
                        d="M14.54,58.6c-4.4-.22-7.15-.87-9.1-2.83s-2.61-4.7-2.83-9.1M31.92,58.71h22.77M72.03,58.52c3.67-.28,6.07-.99,7.82-2.75,2.94-2.94,2.94-7.67,2.94-17.13v-8.04h-18.87c-2.99,0-4.48,0-5.69-.39-2.44-.79-4.36-2.71-5.15-5.16-.39-1.21-.39-2.7-.39-5.69,0-4.48,0-6.73-.59-8.54-1.19-3.67-4.07-6.54-7.73-7.73-1.81-.59-4.06-.59-8.54-.59H2.5"
                        fill="none"
                        stroke="#000063"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        id="Trazado_105"
                        d="M2.5,18.56h24.09"
                        fill="none"
                        stroke="#000063"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        id="Trazado_106"
                        d="M2.5,30.6h16.06"
                        fill="none"
                        stroke="#000063"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        id="Trazado_107"
                        d="M52.68,10.53h7.31c5.84,0,8.76,0,11.14,1.42s3.76,3.99,6.53,9.14l5.12,9.52"
                        fill="none"
                        stroke="#000063"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </span>
          <p className="text-blue mt-auto">Politique de livraison</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue text-4xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 73.3 80.89"
              className="w-16"
            >
              <g>
                <g id="Capa_1">
                  <g id="Grupo_1025">
                    <path
                      id="Trazado_114"
                      d="M2.5,52.06V17.68c7.99,2.36,24.95,5.41,45.55,6.84,11.09.77,16.63,1.15,19.69,4.45s3.06,8.62,3.06,19.27v7.64c0,10.96,0,16.44-3.73,19.85s-8.82,2.91-19,1.92c-4.86-.47-10-1.13-15.22-2"
                      fill="none"
                      stroke="#000063"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      id="Trazado_115"
                      d="M58,25.27c1.43-5.4,2.73-15.22-1.13-20.1-2.45-3.09-6.09-2.79-9.66-2.48-13.36,1.04-26.57,3.48-39.42,7.28-3.23,1.09-5.37,4.16-5.29,7.56"
                      fill="none"
                      stroke="#000063"
                      strokeWidth="5"
                      strokeLinejoin="round"
                    />
                    <path
                      id="Trazado_116"
                      d="M48.04,51.83c0,3.14,2.55,5.69,5.69,5.69s5.69-2.55,5.69-5.69-2.55-5.69-5.69-5.69h0c-3.14,0-5.69,2.55-5.69,5.69Z"
                      fill="none"
                      stroke="#000063"
                      strokeWidth="5"
                    />
                    <path
                      id="Trazado_117"
                      d="M2.5,67.01s3.8,0,7.59,7.59c0,0,12.05-18.97,22.77-22.77"
                      fill="none"
                      stroke="#000063"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </span>
          <p className="text-blue mt-4">Remboursements</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue text-4xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 72.02 72.02"
              className="w-16"
            >
              <g>
                <g id="Capa_1">
                  <g id="Grupo_1023">
                    <path
                      id="Trazado_108"
                      d="M67.66,11.81H26.7c-13.82,0-24.2,10-24.2,24.2"
                      fill="none"
                      stroke="#000063"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="5"
                    />
                    <path
                      id="Trazado_109"
                      d="M4.36,60.21h40.96c13.83,0,24.2-10,24.2-24.2"
                      fill="none"
                      stroke="#000063"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="5"
                    />
                    <path
                      id="Trazado_110"
                      d="M60.21,2.5s9.31,6.86,9.31,9.31-9.31,9.31-9.31,9.31"
                      fill="none"
                      stroke="#000063"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="5"
                    />
                    <path
                      id="Trazado_111"
                      d="M11.81,50.91s-9.31,6.86-9.31,9.31,9.31,9.31,9.31,9.31"
                      fill="none"
                      stroke="#000063"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="5"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </span>
          <p className="text-blue mt-auto">Politique de retours</p>
        </div>
      </div>

      <div className="md:flex hidden place-content-center">
        <div className="py-16 flex items-center justify-between w-1/2">
          <div className="w-[50%]">
            <h2 className="text-blue text-4xl font-medium">
              Nous concevons, fabriquons, assemblons et expédions tous nos
              produits sur commande depuis notre petit atelier à Paris.
            </h2>
            <p className="text-blue mt-2 text-lg">En savoir plus</p>
          </div>
          <img
            src={atelierImage}
            alt="Atelier"
            className="w-[360px] h-[360px] object-cover"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
