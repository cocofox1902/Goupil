import React, { useState, useEffect } from "react";
import isConnected from "./TokenValidator";

function Cart() {
  const [connected, setConnected] = useState(null);

  const deliveryPrice = [
    { weight: 0.75, price: 10 },
    { weight: 2, price: 13 },
    { weight: 5, price: 18 },
    { weight: 10, price: 30 },
  ];

  const [cartProducts, setCartProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const fetchCartProducts = async () => {
    try {
      const updatedCart = await Promise.all(
        cart.map(async (item) => {
          const response = await fetch(
            `http://localhost:3000/products-find?productId=${item.productId}`
          );

          if (!response.ok) {
            console.error(`Failed to fetch product: ${item.productId}`);
            return item;
          }

          const productData = await response.json();
          return { ...item, ...productData[0] };
        })
      );

      setCartProducts(updatedCart);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const [phase, setPhase] = useState(0);

  const command = (index) => {
    setPhase(index);
  };

  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  const underTotalPrice = cartProducts.reduce(
    (acc, item) => acc + item.productPrice * item.quantity,
    0
  );

  const totalPrice = underTotalPrice + deliveryPrice[0].price;

  const pay = async () => {
    if (
      connected.firstName === "" ||
      connected.name === "" ||
      connected.address === "" ||
      connected.email === ""
    ) {
      alert("Veuillez remplir vos coordonnées");
      return;
    }

    const orderData = {
      userId: connected._id,
      products: cartProducts.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      })),
    };
    try {
      const response = await fetch("http://localhost:3000/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du paiement");
      }

      command(2);
    } catch (error) {
      console.error("Erreur de paiement:", error);
      alert("Le paiement a échoué. Veuillez réessayer.");
    }
  };

  const changeQuantity = async (id, newValue) => {
    let updatedCart;
    if (newValue === 0) {
      updatedCart = cart.filter((item) => item.productId !== id);
    } else {
      updatedCart = cart.map((item) =>
        item.productId === id ? { ...item, quantity: newValue } : item
      );
    }

    setCart(updatedCart);

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
        body: JSON.stringify({ token, cart: updatedCart }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Erreur lors de la mise à jour de l'utilisateur:",
          data.error
        );
        return;
      }
    } catch (error) {
      console.error("Erreur de connexion avec l'API:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (localStorage.getItem("token")) {
        const result = await isConnected();

        if (result && result.user) {
          setConnected(result.user);
        }
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (connected && connected.cart) {
      setCart(connected.cart);
    }
  }, [connected]);

  useEffect(() => {
    if (cart.length > 0) {
      fetchCartProducts();
    }
  }, [cart]);

  return (
    <div className="bg-cream w-full p-second min-h-screen">
      <div className="flex">
        <button onClick={() => (window.location.href = "/")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            version="1.1"
            viewBox="0 0 328.62 121"
            className="w-[80px]"
          >
            <g>
              <path
                fill="#060571"
                d="M109.06,36.38c-4.08-2.18-8.56-3.26-13.46-3.26s-9.44,1.09-13.51,3.26c-4.08,2.17-7.3,5.24-9.68,9.2-2.38,3.96-3.57,8.47-3.57,13.54s1.19,9.68,3.57,13.64c2.38,3.96,5.61,7.02,9.68,9.2,4.08,2.18,8.58,3.26,13.51,3.26s9.43-1.09,13.49-3.26c4.06-2.17,7.28-5.24,9.66-9.2,2.38-3.96,3.57-8.5,3.57-13.64s-1.19-9.58-3.57-13.54c-2.38-3.96-5.61-7.02-9.68-9.2ZM104.49,73.57c-.58,3.54-1.58,6.16-2.98,7.83-1.41,1.68-3.37,2.52-5.91,2.52s-4.55-.84-5.96-2.52c-1.41-1.68-2.4-4.29-2.98-7.83-.58-3.54-.87-8.37-.87-14.46s.29-10.87.87-14.41c.58-3.55,1.57-6.15,2.98-7.81,1.4-1.66,3.39-2.49,5.96-2.49s4.5.83,5.91,2.49c1.4,1.66,2.4,4.26,2.98,7.81.58,3.54.87,8.35.87,14.41s-.29,10.92-.87,14.46Z"
              />
              <path
                fill="#060571"
                d="M188.25,83.93v-1.92l-.88-.1-1.75-.21c-1.52-.15-2.56-.57-3.12-1.26-.58-.72-.88-1.87-.88-3.4v-33.29c0-3.71.14-6.82.4-9.24l.12-1.11h-24.78v2.92l.88.1,1.34.16c1.37.09,2.34.35,2.94.76.56.38.93.89,1.12,1.56.23.8.34,1.95.34,3.42v22.28c-.17,1.15-.73,2.98-1.66,5.42-.93,2.46-2.25,4.75-3.9,6.82-1.54,1.93-3.28,2.86-5.31,2.86-1.64,0-3.52-.54-3.52-4.75v-31.13c0-3.5.14-6.63.41-9.3l.11-1.1h-24.76v2.92l.89.1,1.39.16c1.33.09,2.29.35,2.89.76.56.38.92.89,1.12,1.56.23.8.35,1.95.35,3.42v27.18c0,5.2,1.3,9.29,3.88,12.17,2.6,2.92,6.49,4.39,11.56,4.39,4.22,0,7.79-1.39,10.61-4.14,2.72-2.65,4.75-5.56,6.03-8.66.11-.26.21-.52.31-.77-.06,3.05-.15,6.83-.28,11.4l-.03,1.03h24.17v-1Z"
              />
              <path
                fill="#060571"
                d="M238.58,35.7c-3.22-2.18-7.15-3.28-11.68-3.28s-7.93,1.33-10.75,3.94c-1.6,1.49-2.94,3.18-3.99,5.06.04-2.53.11-4.87.22-6.97l.05-1.05h-24.35v2.92l.89.1,1.39.16c1.33.09,2.3.34,2.9.74.55.36.91.86,1.1,1.52.23.8.35,1.97.35,3.47v57.39c0,1.56-.29,2.7-.87,3.39-.56.67-1.66,1.09-3.27,1.27l-1.53.15-.9.09v2.93h30.82v-2.93l-.9-.09-1.54-.15c-1.6-.17-2.7-.6-3.26-1.27-.58-.68-.87-1.82-.87-3.39v-10.38c0-2.07-.03-5.32-.09-9.67.92,1.26,2.08,2.4,3.46,3.41,2.58,1.88,5.93,2.84,9.97,2.84,4.68,0,8.78-1.24,12.19-3.68,3.39-2.43,6.01-5.78,7.79-9.95,1.76-4.13,2.65-8.83,2.65-13.98s-.82-9.6-2.44-13.44c-1.64-3.9-4.11-6.97-7.32-9.15ZM228.69,72.23c-.52,3.04-1.37,5.27-2.55,6.63-1.11,1.29-2.63,1.91-4.64,1.91-2.49,0-4.44-.72-5.95-2.21-1.53-1.5-2.59-3.35-3.17-5.5v-24.75c.81-2.84,2.07-5.27,3.74-7.22,1.61-1.89,3.49-2.81,5.74-2.81,1.97,0,3.45.6,4.51,1.83,1.12,1.31,1.92,3.45,2.39,6.36.49,3.05.73,7.35.73,12.79s-.27,9.79-.81,12.96Z"
              />
              <path
                fill="#060571"
                d="M280.19,81.7c-1.64-.15-2.74-.56-3.29-1.22-.58-.69-.87-1.84-.87-3.44v-28.26c0-6.13.12-10.95.36-14.32l.08-1.07h-24.68v2.92l.88.1,1.33.16c1.37.09,2.34.35,2.94.76.56.38.91.88,1.09,1.54.22.8.33,1.96.33,3.44v34.73c0,1.6-.29,2.75-.87,3.44-.56.66-1.65,1.07-3.26,1.21l-1.58.21-.87.12v2.9h30.87v-2.91l-.87-.11-1.59-.21Z"
              />
              <path
                fill="#060571"
                d="M262.02,24.17c1.5.87,3.2,1.32,5.05,1.32s3.56-.44,5.09-1.31c1.54-.87,2.76-2.06,3.63-3.55.88-1.49,1.32-3.13,1.32-4.87s-.46-3.34-1.35-4.83c-.89-1.48-2.11-2.66-3.63-3.52-1.52-.85-3.22-1.28-5.06-1.28s-3.5.43-5.01,1.28c-1.52.85-2.73,2.03-3.61,3.49-.88,1.47-1.32,3.1-1.32,4.86s.44,3.39,1.32,4.87c.87,1.48,2.08,2.67,3.57,3.54Z"
              />
              <path
                fill="#060571"
                d="M315.46,81.91l-1.54-.21c-1.65-.15-2.74-.56-3.3-1.22-.58-.69-.87-1.84-.87-3.44V19.5c0-5.91.1-10.6.31-13.91l.06-1.06h-26.31v2.98l.9.09,1.95.21c1.65.16,2.88.46,3.66.88.7.38,1.14.86,1.37,1.47.27.73.4,1.76.4,3.07v63.81c0,1.6-.29,2.76-.87,3.44-.56.66-1.65,1.07-3.26,1.21l-1.58.21-.87.12v2.9h30.82v-2.9l-.87-.12Z"
              />
            </g>
            <path
              fill="#060571"
              d="M38.05,72.5c7.93.58,14.18,2.86,18.77,6.82,4.58,3.97,6.87,9,6.87,15.11,0,3.42-.67,6.49-2.02,9.22-1.35,2.73-3.18,5.04-5.51,6.93-2.33,1.89-5.04,3.35-8.13,4.36-3.09,1.02-6.42,1.53-9.98,1.53h-.11c-3.56,0-6.89-.47-9.98-1.42-3.09-.95-5.8-2.22-8.13-3.82-2.33-1.6-4.16-3.47-5.51-5.62-1.35-2.15-2.02-4.46-2.02-6.93s.84-4.46,2.53-6.16c1.68-1.71,3.73-2.56,6.15-2.56s4.46.85,6.15,2.56c1.68,1.71,2.53,3.76,2.53,6.16,0,1.16-.22,2.25-.67,3.27-.45,1.02-1.08,1.93-1.89,2.73-.37.44-.89,1.07-1.56,1.91-.67.84-1,1.84-1,3,0,1.38.49,2.47,1.47,3.27.98.8,2.18,1.42,3.6,1.86,1.42.44,2.91.72,4.47.87,1.56.14,2.89.22,3.98.22,3.27,0,6.02-.44,8.24-1.31,2.22-.87,4.02-2,5.4-3.38,1.38-1.38,2.38-2.93,3-4.64.62-1.71.93-3.44.93-5.18,0-2.47-.75-4.58-2.24-6.33-1.49-1.75-3.37-2.91-5.62-3.49-2.18-.58-4.53-1.02-7.04-1.31-2.51-.29-5.04-.57-7.58-.82-2.55-.26-4.96-.58-7.26-.98-2.29-.4-4.31-.96-6.05-1.69-2.18-.95-3.98-2.42-5.4-4.42-1.42-2-2.13-4.27-2.13-6.82,0-2.98.94-5.56,2.84-7.75,1.89-2.18,4.22-3.56,6.98-4.15-4.07-3.27-6.11-7.45-6.11-12.55,0-2.4.51-4.67,1.53-6.82,1.02-2.14,2.47-4.02,4.36-5.62,1.89-1.6,4.2-2.89,6.93-3.87,2.73-.98,5.84-1.51,9.33-1.58,3.42.07,6.49.6,9.22,1.58,2.73.98,5.05,2.28,6.98,3.87,1.93,1.6,3.4,3.47,4.42,5.62,1.02,2.15,1.53,4.42,1.53,6.82s-.51,4.67-1.53,6.82c-1.02,2.15-2.49,4.02-4.42,5.62-1.93,1.6-4.26,2.89-6.98,3.87-2.73.98-5.8,1.51-9.22,1.58-3.27-.14-6.18-.62-8.73-1.42-2.55-.8-4.76-1.93-6.66-3.38-1.16.58-1.89,1.35-2.18,2.29-.29.95-.11,1.89.55,2.84.44.66,1.25,1.17,2.45,1.53,1.2.36,2.58.65,4.15.87,1.56.22,3.24.38,5.02.49,1.78.11,3.55.24,5.29.38ZM31.83,55.7c0,8.29,2.11,12.44,6.33,12.44s6.33-4.15,6.33-12.44v-9.38c0-8.36-2.11-12.55-6.33-12.55s-6.33,4.18-6.33,12.55v9.38Z"
            />
          </svg>
        </button>
        {connected === null ? (
          <button
            className="ml-auto"
            onClick={() =>
              (window.location.href = "http://localhost:5173/login")
            }
          >
            svg
          </button>
        ) : (
          <button
            className="ml-auto"
            onClick={() =>
              (window.location.href = "http://localhost:5173/cart")
            }
          >
            connected
          </button>
        )}
      </div>
      <ul className="flex justify-center my-prime max-w-3xl min-w-3xl mx-auto">
        <li className="w-[33%]">
          <div className="mt-3 flex justify-center">
            <span className="block text-sm font-medium text-gray-800">
              Panier
            </span>
          </div>
          <div className="w-full inline-flex items-center text-xs align-middle">
            <div className="w-[10%] h-[3px] flex-1 bg-blue rounded-s-full"></div>
            <span className="size-3 flex justify-center items-center shrink-0 bg-blue border border-blue rounded-full"></span>
            <div
              className={`w-[10%] ${
                phase >= 1 ? "h-[3px]" : "h-[1px]"
              } flex-1 bg-blue`}
            ></div>
          </div>
        </li>
        <li className="w-[33%]">
          <div className="mt-3 flex justify-center">
            <span className="block text-sm font-medium text-gray-800">
              Livraison & Paiement
            </span>
          </div>
          <div className="w-full inline-flex items-center text-xs align-middle">
            <div
              className={`w-[10%] ${
                phase >= 1 ? "h-[3px]" : "h-[1px]"
              } flex-1 bg-blue`}
            ></div>
            <span
              className={`size-3 flex justify-center items-center shrink-0 ${
                phase >= 1 ? "bg-blue" : "bg-bg-color"
              } border border-blue rounded-full`}
            ></span>
            <div
              className={`w-[10%] ${
                phase === 2 ? "h-[3px]" : "h-[1px]"
              } flex-1 bg-blue`}
            ></div>
          </div>
        </li>
        <li className="w-[33%]">
          <div className="mt-3 flex justify-center">
            <span className="block text-sm font-medium text-gray-800">
              Confirmation
            </span>
          </div>
          <div className="w-full inline-flex items-center text-xs align-middle">
            <div
              className={`w-[10%] ${
                phase === 2 ? "h-[3px]" : "h-[1px]"
              } flex-1 bg-blue`}
            ></div>
            <span
              className={`size-3 flex justify-center items-center shrink-0 ${
                phase == 2 ? "bg-blue" : "bg-bg-color"
              } border border-blue rounded-full`}
            ></span>
            <div
              className={`w-[10%] ${
                phase === 2 ? "h-[3px]" : "h-[1px]"
              } flex-1 bg-blue rounded-s-full`}
            ></div>
          </div>
        </li>
      </ul>
      {phase === 0 ? (
        <div className="max-w-3xl mx-auto bg-white p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold">
              Vous avez {count} articles dans votre panier
            </h2>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="text-left text-gray-700">
                <th className="pb-2 w-[50%]">Produit</th>
                <th className="pb-2 w-[16.5%]">Prix</th>
                <th className="pb-2 w-[16.5%]">Qté.</th>
                <th className="pb-2 w-[16.5%]">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartProducts.map((item) => {
                return (
                  <tr className="border-b py-4">
                    <td className="flex items-center gap-4">
                      <img
                        src={item.photo[0]?.url}
                        alt="product"
                        className="w-16 h-16 rounded"
                      />
                      <div>
                        <p className="font-bold">{item.productName}</p>
                        <p className="text-gray-500 text-sm">
                          {item.productDescription}
                        </p>
                      </div>
                    </td>
                    <td>{item.productPrice} €</td>
                    <td>
                      <input
                        className="w-[100%]"
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          changeQuantity(item._id, Number(e.target.value))
                        }
                      />
                    </td>
                    <td>{item.productPrice * item.quantity} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="ml-[50%]">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-[66%]">Sous-total</td>
                  <td className="w-[33%]">{underTotalPrice} €</td>
                </tr>
                <tr>
                  <td className="w-[66%]">Livraison</td>
                  <td className="w-[33%]">{deliveryPrice[0].price} €</td>
                </tr>
                <tr>
                  <td className="w-[66%] pt-second">Total :</td>
                  <td className="w-[33%] pt-second">
                    {underTotalPrice + deliveryPrice[0].price} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            className="mt-6 w-full bg-blue text-white py-2 rounded text-lg"
            onClick={() => {
              command(1);
            }}
          >
            Commander
          </button>
        </div>
      ) : phase === 1 ? (
        <div className="max-w-3xl mx-auto flex">
          <div className="flex-1 bg-white p-prime">
            <h2 className="text-lg font-semibold">Dernière étape.</h2>
            <p className="text-sm text-gray-600 mb-6">
              Pour finaliser votre achat, veuillez remplir les informations de
              paiement.
            </p>
            <form>
              <div className="mb-4">
                <p className="text-sm font-semibold mb-1">
                  Informations Personnelles
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Prénom"
                    className="border p-2 w-full rounded"
                    required
                    value={connected && connected.firstName}
                    onChange={(e) =>
                      setConnected({ ...connected, firstName: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    className="border p-2 w-full rounded"
                    required
                    value={connected && connected.name}
                    onChange={(e) =>
                      setConnected({ ...connected, name: e.target.value })
                    }
                  />
                </div>
                <input
                  type="email"
                  placeholder="E-mail"
                  className="border p-2 w-full mt-2 rounded"
                  required
                  value={connected && connected.email}
                  onChange={(e) =>
                    setConnected({ ...connected, email: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Adresse"
                  className="border p-2 w-full mt-2 rounded"
                  required
                  value={connected && connected.address}
                  onChange={(e) =>
                    setConnected({ ...connected, address: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold mb-1">
                  Informations Bancaires
                </p>
                <input
                  type="text"
                  placeholder="Numéro de carte"
                  className="border p-2 w-full rounded mb-2"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Date d'expiration"
                    className="border p-2 w-full rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="border p-2 w-full rounded"
                    required
                  />
                </div>
              </div>
            </form>
            <button
              className="mt-4 w-full bg-blue text-white py-2 rounded-lg hover:bg-blue-800 transition"
              onClick={() => {
                pay();
              }}
            >
              Payer maintenant
            </button>
          </div>
          <div className="w-1/3 bg-[#aea8a2] p-6 ml-prime">
            <h3 className="text-lg font-semibold mb-4">Montant dû</h3>
            <p className="text-2xl font-bold text-blue-700">
              {totalPrice.toFixed(2)} €
            </p>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p className="underline cursor-pointer">Besoin d'une facture ?</p>
            </div>
            <div className="mt-6 text-center text-sm">
              <p className="flex items-center justify-center gap-2">
                <span>🚚</span> Politique de livraison
              </p>
              <p className="flex items-center justify-center gap-2 mt-2">
                <span>🔄</span> Politique de retours
              </p>
              <p className="flex items-center justify-center gap-2 mt-2">
                <span>💳</span> Remboursements
              </p>
            </div>
          </div>
        </div>
      ) : phase === 2 ? (
        <div className="max-w-3xl mx-auto bg-white p-6">
          <div className="text-blue text-center place-items-center font-light">
            <p className="text-6xl font-bold my-prime">
              Merci pour votre commande !
            </p>
            <p className="my-prime">
              Chez Goupil, chaque pièce est fabriquée sur commande, avec soin et
              dans une démarche écoresponsable. En tant qu'atelier artisanal,
              nous ne gérons pas de stock afin de réduire le gaspillage et
              limiter notre impact environnemental.
            </p>
            <p className="mt-prime">
              Votre commande est maintenant en production !
            </p>
            <p className="mb-prime">
              Nos artisans travaillent avec minutie pour créer une pièce unique
              spécialement pour vous. Le délai de fabrication est d'environ 7 à
              10 jours avant l'expédition.
            </p>
            <div className="w-[85%] border-b-2 border-blue"></div>
            <p className="my-prime">
              Vous recevrez un e-mail de confirmation avec les informations de
              suivi dès que votre commande sera prête à être expédiée.
            </p>
            <p className="my-prime">
              Pour toute question, n'hésitez pas à nous contacter à <br />
              goupil.design@gmail.com
            </p>
            <p className="my-prime">
              Merci de soutenir l'artisanat et de faire partie de l'aventure
              Goupil !
            </p>
            <button
              className="text-white bg-blue p-prime rounded-sm font-normal"
              onClick={() => (window.location.href = "/product")}
            >
              Retourner vers la boutique
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Cart;
