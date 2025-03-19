import React, { useState, useEffect } from "react";
import { use } from "react";

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
    try {
      const response = await fetch(
        `http://localhost:3000/orders-update?orderId=${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shipping: status }),
        }
      );
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la mise à jour du statut de la commande"
        );
      }
      const data = await response.json();
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
    <div className="py-prime">
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-prime rounded-second ">
            <div
              className="flex justify-between items-center"
              onClick={() => {
                setShowProduct(
                  showProduct.includes(order._id)
                    ? showProduct.filter((id) => id !== order._id)
                    : [...showProduct, order._id]
                );
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
                    {users[order.user]?.name || "N/A"}
                  </p>
                  <p className="font-semibold">
                    {users[order.user]?.firstName || "N/A"}
                  </p>
                </div>
                <p className="text-gray-500 text-sm">
                  {new Date(order.date).toLocaleString()}
                </p>
              </div>
              <div className="w-[13%]">
                <p className="font-semibold">
                  {users[order.user]?.email || "N/A"}
                </p>
                <p className="font-semibold">
                  {users[order.user]?.phone || "N/A"}
                </p>
              </div>

              <div className="w-[13%]">
                <p className="text-gray-500 text-sm">
                  {users[order.user]?.address || "N/A"}
                </p>
              </div>

              <div className="flex items-center w-[13%]">
                {order.productInformation.reduce((total, item) => {
                  return total + item.quantity;
                }, 0)}
              </div>

              <div className="w-[13%]">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.shipping === "pending"
                      ? "bg-purple-800 text-white"
                      : order.shipping === "wrapping"
                      ? "bg-yellow-800 text-white"
                      : "bg-green-800 text-white"
                  }`}
                >
                  {order.shipping}
                </span>
              </div>

              <div className="w-[13%]">
                <p>
                  {order.productInformation?.reduce((total, item) => {
                    const product = products[item.productId];
                    return total + (product?.productPrice || 0) * item.quantity;
                  }, 0)}{" "}
                  €
                </p>
              </div>
              <div>
                {order.shipping === "fabrication" ? (
                  <button onClick={() => changeStatus(order._id, "embalage")}>
                    📦
                  </button>
                ) : (
                  <button onClick={() => changeStatus(order._id, "expédié")}>
                    🚚
                  </button>
                )}
              </div>
            </div>
            <div
              className={`ml-[57%] ${
                showProduct.includes(order._id) ? "" : "hidden"
              }`}
            >
              {order.productInformation?.length > 0 ? (
                order.productInformation.map((item) => {
                  const product = products[item.productId];
                  console.log(item, product);
                  return (
                    <div
                      key={item.productId}
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
                              background: product?.color?.[item.productColorRow]
                                ?.second
                                ? `linear-gradient(to bottom right, ${
                                    product?.color?.[item.productColorRow]
                                      ?.first
                                  } 50%, ${
                                    product?.color?.[item.productColorRow]
                                      ?.second
                                  } 50%)`
                                : product?.color?.[item.productColorRow]?.first,
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
  );
}

export default Command;
