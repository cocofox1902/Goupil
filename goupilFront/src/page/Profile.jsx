import NavBar from "./Components/NavBar";
import { useState } from "react";

function Profile() {
  const [activeTab, setActiveTab] = useState("info");

  const userData = {
    firstName: "Colas",
    lastName: "RENARD",
    email: "colas.renard@gmail.com",
    phone: "+33 7 82 70 09 18",
    address: {
      number: "365",
      street: "Rue des Pyrénées",
      postalCode: "75020",
    },
    password: "***************",
  };

  const orders = [
    {
      id: "75N158Z",
      status: "Fabrication",
      products: [
        {
          name: "Limus nomus",
          description: "Petite lampe de bureau. 20cm de hauteur",
          price: 180,
          quantity: 2,
          image: "https://via.placeholder.com/50", // Replace with actual image
        },
        {
          name: "Andrus",
          description: "Petite lampe de bureau. 24cm de hauteur",
          price: 45,
          quantity: 2,
          image: "https://via.placeholder.com/50", // Replace with actual image
        },
      ],
    },
  ];

  return (
    <div className="bg-cream w-full min-h-screen">
      <NavBar />
      <div className="flex max-w-5xl mx-auto mt-10 text-blue">
        {/* Sidebar */}
        <div className="flex flex-col w-[25%] bg-white p-6 items-start space-y-2">
          <button
            onClick={() => setActiveTab("info")}
            className={`w-full py-2 text-left ${
              activeTab === "info" ? "bg-gray-200" : ""
            }`}
          >
            Mes informations
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full py-2 text-left ${
              activeTab === "orders" ? "bg-gray-200" : ""
            }`}
          >
            Mes commandes
          </button>
        </div>

        {/* Content Section */}
        <div className="w-[75%] bg-white p-6">
          {activeTab === "info" ? (
            <>
              {/* Personal Information */}
              <h1 className="text-2xl font-semibold mb-4">
                Informations Personnelles
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600">Prénom</label>
                  <input
                    type="text"
                    value={userData.firstName}
                    className="w-full p-2 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Nom</label>
                  <input
                    type="text"
                    value={userData.lastName}
                    className="w-full p-2 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">E-mail</label>
                  <input
                    type="email"
                    value={userData.email}
                    className="w-full p-2 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={userData.phone}
                    className="w-full p-2 border rounded bg-gray-100"
                    disabled
                  />
                </div>
              </div>

              {/* Delivery Information */}
              <h1 className="text-2xl font-semibold mb-4">
                Informations de livraison
              </h1>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600">Numéro</label>
                  <input
                    type="text"
                    value={userData.address.number}
                    className="w-full p-2 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600">Voie</label>
                  <input
                    type="text"
                    value={userData.address.street}
                    className="w-full p-2 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={userData.address.postalCode}
                    className="w-full p-2 border rounded bg-gray-100"
                    disabled
                  />
                </div>
              </div>

              {/* Password Section */}
              <h1 className="text-2xl font-semibold mb-4">Mot de passe</h1>
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded mb-6">
                <input
                  type="password"
                  value={userData.password}
                  className="w-full p-2 bg-gray-100"
                  disabled
                />
                <button className="text-blue underline ml-4">
                  Modifier mot de passe
                </button>
              </div>

              {/* Modify Button */}
              <button className="mt-4 w-full bg-blue text-white py-2 rounded text-lg">
                Modifier mes informations
              </button>
            </>
          ) : activeTab === "orders" ? (
            <div>
              <h1 className="text-2xl font-semibold mb-4">Mes commandes</h1>

              {orders.map((order) => (
                <div key={order.id} className="border p-6 rounded-md shadow-sm">
                  <h2 className="font-semibold text-lg mb-4">
                    Commande # {order.id}
                  </h2>

                  <table className="w-full mb-4">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 w-[50%] text-left">Produit</th>
                        <th className="pb-2 w-[16.5%] text-left">Prix</th>
                        <th className="pb-2 w-[16.5%] text-left">Qté.</th>
                        <th className="pb-2 w-[16.5%] text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((product, index) => (
                        <tr key={index} className="border-b py-2">
                          <td className="flex gap-4 items-center py-2">
                            <img
                              src={product.image}
                              alt="product"
                              className="w-12 h-12 rounded"
                            />
                            <div>
                              <p className="font-bold">{product.name}</p>
                              <p className="text-gray-500 text-sm">
                                {product.description}
                              </p>
                            </div>
                          </td>
                          <td>€ {product.price.toFixed(2)}</td>
                          <td>{product.quantity}</td>
                          <td>
                            € {(product.price * product.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Total Price */}
                  <div className="text-right font-semibold">
                    Total : €{" "}
                    {order.products
                      .reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </div>

                  {/* Order Status */}
                  <div className="mt-4">
                    <p className="font-semibold">Statut</p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-md ${
                          order.status === "Fabrication"
                            ? "bg-yellow-200 text-yellow-800"
                            : order.status === "Emballage"
                            ? "bg-gray-200 text-gray-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-200 text-gray-800">
                        Emballage
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-200 text-gray-800">
                        Expédié
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Profile;
