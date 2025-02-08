import React, { useState, useEffect } from "react";
import { use } from "react";

function Command() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [products, setProducts] = useState({});

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
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {order._id}
                </p>
                <p className="text-gray-500 text-sm">
                  {new Date(order.date).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="font-semibold">
                  {users[order.user]?.name || "N/A"}
                </p>
                <p className="font-semibold">
                  {users[order.user]?.firstName || "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold">
                  {users[order.user]?.email || "N/A"}
                </p>
                <p className="font-semibold">
                  {users[order.user]?.phone || "N/A"}
                </p>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.shipping === "pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : order.shipping === "shipped"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {order.shipping}
                </span>
              </div>

              {/* Product List */}
              <div className="flex items-center">
                <img
                  src={"default-image.jpg"}
                  alt={"Produit"}
                  className="w-12 h-12 bg-gray-300 rounded-md"
                />
                <p className="ml-2">
                  x{" "}
                  {order.productInformation.reduce((total, item) => {
                    return total + item.quantity;
                  }, 0)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-gray-700 font-semibold"></p>
              </div>

              <div>
                <p className="">
                  {order.productInformation?.reduce((total, item) => {
                    const product = products[item.productId];
                    return total + (product?.productPrice || 0) * item.quantity;
                  }, 0)}{" "}
                  €
                </p>
              </div>
            </div>
            <div>
              {order.productInformation?.length > 0 ? (
                order.productInformation.map((item) => {
                  const product = products[item.productId];
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center space-x-4"
                    >
                      <img
                        src={product?.color?.[0]?.photo?.[0]?.url}
                        alt={product?.photo?.[0]?.altText || "Produit"}
                        className="w-12 h-12 bg-gray-300 rounded-md"
                      />
                      <p className="text-gray-700 font-semibold">
                        {product?.productName || "Produit inconnu"} x{" "}
                        {item.quantity}
                      </p>
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
