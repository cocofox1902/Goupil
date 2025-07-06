import React, { useState, useEffect } from "react";
import Admin from "./Admin";
function Command() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [products, setProducts] = useState({});
  const [showProduct, setShowProduct] = useState([]);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:3000/orders");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des commandes");
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Fetch Users
  useEffect(() => {
    const findUser = async () => {
      if (!orders) return;

      const userIds = [...new Set(orders.map((order) => order.user))];

      const usersData = {};
      for (const userId of userIds) {
        try {
          const response = await fetch(
            `http://localhost:3000/user-find?userId=${userId}`
          );
          if (!response.ok) {
            throw new Error(
              `Erreur lors de la récupération de l'utilisateur ${userId}`
            );
          }
          const userData = await response.json();
          usersData[userId] = userData;
        } catch (error) {
          console.error("Erreur:", error);
        }
      }

      setUsers(usersData);
    };

    findUser();
  }, [orders]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!orders) return;

      const productIds = [
        ...new Set(
          orders.flatMap((order) =>
            order.productInformation.map((item) => item.productId)
          )
        ),
      ];

      const productsData = {};
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await fetch(
              `http://localhost:3000/products-find?productId=${productId}`
            );
            if (!response.ok) {
              throw new Error(
                `Erreur lors de la récupération du produit ${productId}`
              );
            }
            const productData = await response.json();
            productsData[productId] = productData[0];
          } catch (error) {
            console.error("Erreur:", error);
          }
        })
      );

      setProducts(productsData);
    };

    fetchProducts();
  }, [orders]);

  const changeStatus = async (orderId, status) => {
    const statusList = [
      "Fabrication",
      "Emballage",
      "En cours de livraison",
      "Livré",
    ];

    const currentIndex = statusList.indexOf(status);
    let newStatus = status;
    if (currentIndex === 3) {
      return;
    } else {
      const nextIndex = (currentIndex + 1) % statusList.length;
      const nextStatus = statusList[nextIndex];
      newStatus = nextStatus;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/orders-update?orderId=${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shipping: newStatus }),
        }
      );
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la mise à jour du statut de la commande"
        );
      }
      const data = await response.json();
      window.location.reload();
      setOrders((orders) =>
        orders.map((order) =>
          order._id === orderId ? { ...order, shipping: status } : order
        )
      );
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Chargement...</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="text-center p-10">Aucune commande trouvée.</div>;
  }

  return (
    <div className="bg-bg-color p-prime h-screen">
      <Admin />
      <div className="py-prime">
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={index} className="bg-white p-prime rounded-second ">
              <div
                className="flex justify-between items-center"
                onClick={(e) => {
                  if (!e.target.closest("button")) {
                    setShowProduct((prevShowProduct) =>
                      prevShowProduct.includes(order._id)
                        ? prevShowProduct.filter((id) => id !== order._id)
                        : [...prevShowProduct, order._id]
                    );
                  }
                }}
              >
                <div className="w-[13%]">
                  <p className="text-lg font-semibold text-gray-900 overflow-hidden">
                    {order._id}
                  </p>
                </div>

                <div className="w-[13%]">
                  <div className="flex">
                    <p className="font-semibold mr-2">
                      {users[order.user]?.firstName || "N/A"}
                    </p>
                    <p className="font-semibold">
                      {users[order.user]?.secondName || "N/A"}
                    </p>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(order.date).toLocaleString()}
                  </p>
                </div>
                <div className="w-[15%]">
                  <p className="font-semibold">
                    {users[order.user]?.email || "N/A"}
                  </p>
                  <p className="font-semibold">
                    {users[order.user]?.phone || "N/A"}
                  </p>
                </div>

                <div className="w-[13%]">
                  <p className="text-gray-500 text-sm">
                    {users[order.user]?.address.streetNumber}{" "}
                    {users[order.user]?.address.streetName}{" "}
                    {users[order.user]?.address.zipcode}
                  </p>
                </div>

                <div className="flex items-center w-[13%]">
                  {order.productInformation.reduce((total, item) => {
                    return total + item.quantity;
                  }, 0)}
                </div>

                <div className="w-[13%]">
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.shipping === "Fabrication"
                        ? "bg-purple-800 text-white"
                        : order.shipping === "Emballage"
                        ? "bg-yellow-800 text-white"
                        : order.shipping === "En cours de livraison"
                        ? "bg-green-800 text-white"
                        : "bg-red-800 text-white"
                    }`}
                    onClick={() => {
                      changeStatus(order._id, order.shipping);
                    }}
                  >
                    {order.shipping}
                  </button>
                </div>

                <div className="w-[5%]">
                  <p>
                    {order.productInformation?.reduce((total, item) => {
                      const product = products[item.productId];
                      return (
                        total + (product?.productPrice || 0) * item.quantity
                      );
                    }, 0)}{" "}
                    €
                  </p>
                </div>
              </div>
              <div
                className={`ml-[64%] ${
                  showProduct.includes(order._id) ? "" : "hidden"
                }`}
              >
                {order.productInformation?.length > 0 ? (
                  order.productInformation.map((item, index) => {
                    const product = products[item.productId];
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-4 mt-2"
                      >
                        <img
                          src={
                            product?.color?.[item.productColorRow]?.photo?.[0]
                              ?.url
                          }
                          alt={product?.productName || "Produit"}
                          className="w-12 h-12 bg-gray-300 rounded-md"
                        />
                        <div>
                          <div className="text-black flex w-32 justify-between">
                            <p className="font-semibold">
                              {product?.productName || "Produit inconnu"}
                            </p>
                            <p>x {item.quantity}</p>
                          </div>

                          <div className="flex items-center">
                            <span
                              className="w-[13px] h-[13px] rounded-full inline-block"
                              style={{
                                background: product?.color?.[
                                  item.productColorRow
                                ]?.second
                                  ? `linear-gradient(to bottom right, ${
                                      product?.color?.[item.productColorRow]
                                        ?.first
                                    } 50%, ${
                                      product?.color?.[item.productColorRow]
                                        ?.second
                                    } 50%)`
                                  : product?.color?.[item.productColorRow]
                                      ?.first,
                              }}
                            ></span>
                            <p className="ml-2">{product?.productPrice} €</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">Aucun produit trouvé</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Command;
