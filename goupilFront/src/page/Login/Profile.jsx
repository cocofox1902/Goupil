import NavBar from "../Components/NavBar";
import { useEffect, useState } from "react";

function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const [userData, setUserData] = useState(null);

  const [orders, setOrderData] = useState({
    id: "75N158Z",
    status: "Fabrication",
    products: [
      {
        name: "Limus nomus",
        description: "Petite lampe de bureau. 20cm de hauteur",
        price: 180,
        quantity: 2,
        image: "https://via.placeholder.com/50",
      },
      {
        name: "Andrus",
        description: "Petite lampe de bureau. 24cm de hauteur",
        price: 45,
        quantity: 2,
        image: "https://via.placeholder.com/50",
      },
    ],
  });

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:3000/getUser", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserData(userData.user);
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to fetch user info:",
          errorData.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleChangeUser = (event) => {
    const { name, value } = event.target;
    if (name === "streetNumber" || name === "streetName" || name === "zipcode") {
      setUserData((prevData) => ({
        ...prevData,
        address: { ...prevData.address, [name]: value },
      }));
      return;
    }
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const putUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log("User updated successfully");
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const getOrders = async () => {
    const response = await fetch("http://localhost:3000/api/Orders", {
      method: "GET",
      body: JSON.stringify({ Id: userData.Id }),
    });
    const data = await response.json();
    setOrderData(data);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="bg-cream w-full min-h-screen">
      <NavBar />
      <div className="flex max-w-5xl mx-auto mt-10 text-blue">
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
        <div className="w-[75%] bg-white p-6">
          {activeTab === "info" ? (
            <>
              {userData && (
                <>
                  <h1 className="text-2xl font-semibold mb-4">
                    Informations Personnelles
                  </h1>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm text-gray-600">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={userData.firstName}
                        className="w-full p-2 border rounded bg-gray-100"
                        onChange={handleChangeUser}
                        name="firstName"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Nom</label>
                      <input
                        type="text"
                        value={userData.secondName}
                        className="w-full p-2 border rounded bg-gray-100"
                        onChange={handleChangeUser}
                        name="secondName"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        className="w-full p-2 border rounded bg-gray-100"
                        onChange={handleChangeUser}
                        name="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Téléphone
                      </label>
                      <input
                        type="number"
                        value={userData.phone}
                        className="w-full p-2 border rounded bg-gray-100"
                        onChange={handleChangeUser}
                        name="phone"
                      />
                    </div>
                  </div>
                  <h1 className="text-2xl font-semibold mb-4">
                    Informations de livraison
                  </h1>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm text-gray-600">
                        Numéro
                      </label>
                      <input
                        type="number"
                        value={userData.address.streetNumber}
                        className="w-full p-2 border rounded bg-gray-100"
                        onChange={handleChangeUser}
                        name="streetNumber"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600">
                        Voie
                      </label>
                      <input
                        type="text"
                        value={userData.address.streetName}
                        className="w-full p-2 border rounded bg-gray-100"
                        onChange={handleChangeUser}
                        name="streetName"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Code postal
                      </label>
                      <input
                        type="number"
                        value={userData.address.zipcode}
                        className="w-full p-2 border rounded bg-gray-100"
                        onChange={handleChangeUser}
                        name="zipcode"
                      />
                    </div>
                  </div>

                  <h1 className="text-2xl font-semibold mb-4">Mot de passe</h1>
                  <div className="flex items-center justify-between bg-gray-100 p-2 rounded mb-6">
                    <input
                      type="password"
                      placeholder="********"
                      className="w-full p-2 bg-gray-100"
                      onChange={handleChangeUser}
                      name="password"
                    />
                  </div>

                  <button
                    className="mt-4 w-full bg-blue text-white py-2 rounded text-lg"
                    onClick={() => putUser()}
                  >
                    Enregistrer les modifications mes informations
                  </button>
                </>
              )}
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
                  <div className="text-right font-semibold">
                    Total : €{" "}
                    {order.products
                      .reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </div>
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
