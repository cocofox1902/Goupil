import React, { useState, useEffect } from "react";
import isConnected from "../Components/TokenValidator";
import NavBar from "../Components/NavBar";

function Cart() {
  const [connected, setConnected] = useState(null);
  const [deliveryPriceCalculated, setDeliveryPriceCalculated] = useState(0);
  const deliveryPrice = [
    { weight: 0, price: 0 },
    { weight: 750, price: 10 },
    { weight: 2000, price: 13 },
    { weight: 5000, price: 18 },
    { weight: 10000, price: 30 },
  ];

  const [totalPrice, setTotalPrice] = useState(0);
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

  const pay = async () => {
    if (
      localStorage.getItem("token") === null
    ) {
      window.location.href = "/login";
      return;
    }

    const orderData = {
      userId: connected._id,
      products: cartProducts.map((product) => ({
        productId: product.productId,
        productColorRow: product.colorRow,
        quantity: product.quantity,
      })),
    };

    console.log(orderData);

    try {
      const response = await fetch("https://localhost:7126/api/Products/pay", {
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
          body: JSON.stringify({ token, cart: [] }),
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

      command(2);
    } catch (error) {
      console.error("Erreur de paiement:", error);
      alert("Le paiement a échoué. Veuillez réessayer.");
    }
  };

  const changeQuantity = async (id, colorRow, newValue) => {
    let updatedCart;
    if (newValue === 0) {
      updatedCart = cart.filter(
        (item) => !(item.productId === id && item.colorRow === colorRow)
      );
    } else {
      updatedCart = cart.map((item) =>
        item.productId === id && item.colorRow === colorRow
          ? { ...item, quantity: newValue }
          : item
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

      if (updatedCart.reduce((acc, item) => acc + item.quantity, 0) === 0) {
        window.location.reload();
      }

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

  useEffect(() => {
    if (cartProducts.length > 0) {
      const totalWeight = cartProducts.reduce((acc, item) => {
        return acc + item.weight * item.quantity;
      }, 0);

      const closestDelivery =
        deliveryPrice.find((option) => totalWeight <= option.weight) ||
        deliveryPrice[deliveryPrice.length - 1];

      setDeliveryPriceCalculated(closestDelivery.price);
    }
  }, [cartProducts]);

  useEffect(() => {
    setTotalPrice(underTotalPrice + deliveryPriceCalculated);
  }, [underTotalPrice, deliveryPriceCalculated]);

  return (
    <div className="bg-cream w-full min-h-screen">
      <NavBar />
      <ul className="flex justify-center p-second my-prime max-w-3xl min-w-3xl mx-auto text-blue">
        <li className="w-[33%]">
          <div className="mt-3 flex justify-center">
            <span
              className={`block text-sm font-medium text-blue ${
                phase === 1 && "cursor-pointer"
              }`}
              onClick={() => {
                if (phase === 1) command(0);
              }}
            >
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
            <span className="block text-sm font-medium text-blue">
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
            <span className="block text-sm font-medium text-blue">
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
        <div className="max-w-3xl mx-auto bg-white p-6 text-blue">
          <div className="pb-4 mb-4">
            <h2 className="text-xl font-semibold">
              Vous avez {count} articles dans votre panier
            </h2>
          </div>

          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="text-left text-blue">
                <th className="pb-2 w-[50%]"></th>
                <th className="pb-2 w-[16.5%] pl-5">Prix</th>
                <th className="pb-2 w-[16.5%]">Qté.</th>
                <th className="pb-2 w-[16.5%]">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartProducts.map((item) => {
                return (
                  <tr className="py-4 align-top">
                    <td className="flex gap-4">
                      <img
                        src={item.color?.[item.colorRow]?.photo?.[0]?.url}
                        alt="product"
                        className="w-16 h-16"
                        onClick={() =>
                          (window.location.href =
                            "/product/" + item.productSlug)
                        }
                      />
                      <div>
                        <p className="font-bold">{item.productName}</p>
                        <p className="text-blue text-sm">
                          {item.metaDescription}
                        </p>
                      </div>
                    </td>
                    <td className="pl-5">{item.productPrice.toFixed(2)} €</td>
                    <td>
                      <input
                        className="w-[100%]"
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          changeQuantity(
                            item._id,
                            item.colorRow,
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td>{(item.productPrice * item.quantity).toFixed(2)} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <hr className="border-blue mb-8 opacity-50" />

          <div className="ml-[50%]">
            <table className="w-full ml-5">
              <tbody>
                <tr>
                  <td className="w-[66%]">Sous-total</td>
                  <td className="w-[33%]">{underTotalPrice.toFixed(2)} €</td>
                </tr>
                <tr>
                  <td className="w-[66%]">Livraison</td>
                  <td className="w-[33%]">{deliveryPriceCalculated.toFixed(2)} €</td>
                </tr>
                <tr>
                  <td className="w-[66%] pt-second">Total :</td>
                  <td className="w-[33%] pt-second">{totalPrice.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            className="mt-6 w-full bg-blue text-white py-2 rounded text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cart.length === 0}
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
            <p className="text-sm text-blue mb-6">
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
            <p className="text-2xl font-bold text-blue">
              {totalPrice.toFixed(2)} €
            </p>

            <div className="mt-4 space-y-2 text-sm text-blue">
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
