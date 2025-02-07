import { useEffect, useState, useCallback } from "react";

function ProductSheet({ showAddingProduct, modify, setModify, productId }) {
  const blankProduct = {
    productName: "",
    productDescription: "",
    productSlug: "",
    productPrice: "",
    productCost: "",
    photo: [],
    color: [],
    weight: 0,
    packageWeight: 0,
    dimensions: [{ largeur: 0, hauteur: 0, profondeur: 0 }],
    voltage: 0,
    material: "",
    categories: "Desk",
    isOutdoor: false,
    likesNumber: 0,
    unitsSold: 0,
    metaTitle: "",
    metaDescription: "",
  };
  const [formData, setFormData] = useState(blankProduct);

  const [selectedButtonType, setSelectedButtonType] = useState("Desk");
  const [selectedButtonTypeUnder, setSelectedButtonTypeUnder] =
    useState("Intérieur");

  const buttonsType = ["Desk", "Stand Alone", "Applique", "Plafonnier"];
  const buttonsTypeUnder = ["Intérieur", "Extérieur"];
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState({ first: "", second: "" });

  useEffect(() => {
    if (modify && productId) {
      const findProduct = async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/products-find?productId=${productId}`
          );
          if (response.ok) {
            const data = await response.json();
            setFormData(data[0]);

            setSelectedButtonType(data[0].categories);
            setSelectedButtonTypeUnder(
              data[0].isOutdoor ? "Extérieur" : "Intérieur"
            );
          } else {
            alert("Failed to find product");
          }
        } catch (error) {
          console.error("Error finding product:", error);
        }
      };

      findProduct();
    }
  }, [modify, productId]);

  const handleInputChange = (event) => {
    const { name, type, value, checked } = event.target;

    if (name.includes("[")) {
      const nameParts = name.split(/[.\[\]]+/).filter(Boolean);
      const [mainKey, index, subKey] = nameParts;

      setFormData((prevData) => {
        const updatedData = { ...prevData };
        if (index) {
          updatedData[mainKey][index][subKey] =
            type === "checkbox" ? checked : value;
        } else {
          updatedData[mainKey][subKey] = type === "checkbox" ? checked : value;
        }
        return updatedData;
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const addProduct = async (event) => {
    event.preventDefault();

    const formattedSlug = formData.productSlug
      ? formData.productSlug.toLowerCase().replace(/\s+/g, "-")
      : formData.productName.toLowerCase().replace(/\s+/g, "-");

    const updatedFormData = { ...formData, productSlug: formattedSlug };

    try {
      const response = await fetch("http://localhost:3000/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchProducts();
        window.location.reload();
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleClick = (buttonName) => {
    setSelectedButtonType(buttonName);
    setFormData((prevData) => ({
      ...prevData,
      categories: buttonName,
    }));
  };

  const handleClickUnder = (buttonName) => {
    setSelectedButtonTypeUnder(buttonName);
    const isOutdoor = buttonName === "Extérieur";
    setFormData((prevData) => ({
      ...prevData,
      isOutdoor: isOutdoor,
    }));
  };

  const addColor = () => {
    if (currentColor.first) {
      setFormData((prevData) => ({
        ...prevData,
        color: [...prevData.color, currentColor],
      }));
      setCurrentColor({ first: "", second: "" });
      setIsColorPickerOpen(false);
    }
  };

  const handleColorClick = (colorToDelete) => {
    const updatedColors = formData.color.filter(
      (color) =>
        !(
          color.first === colorToDelete.first &&
          color.second === colorToDelete.second
        )
    );

    setFormData((prevState) => ({
      ...prevState,
      color: updatedColors,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        photo: [
          ...(prevState.photo || []),
          ...files.map((file) => ({
            url: URL.createObjectURL(file),
            file,
          })),
        ],
      }));
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    setFormData((prevState) => ({
      ...prevState,
      photo: prevState.photo.filter((_, index) => index !== indexToDelete),
    }));
  };

  const updateProduct = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/modify-product/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`);
      }

      const updatedProduct = await response.json();
      window.location.reload();
      return updatedProduct;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit :", error);
      return null;
    }
  };

  return (
    <div className="bg-white p-prime rounded-second ml-prime overflow-y-auto max-h-[85vh] w-[31vw]">
      <div className="flex justify-between items-center">
        <h2 className="text-second font-semibold">Fiche Produit</h2>
        <button
          onClick={() => {
            setFormData(blankProduct);
            showAddingProduct(false);
          }}
          className="text-gray-500 text-xl"
        >
          &times;
        </button>
      </div>

      <div className="rounded-second p-prime flex flex-col items-center relative">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-20 border-2 rounded-second border-black cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm">Click to upload</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {formData.photo?.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`Uploaded ${index}`}
                className="w-12 h-12 object-cover rounded cursor-pointer"
                onClick={() => handleDeleteImage(index)}
              />
              <div
                className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded-bl opacity-0 group-hover:opacity-100 transition"
                onClick={() => handleDeleteImage(index)}
              >
                ✕
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">Description</h3>
        <input
          className="w-full border p-2 rounded mt-1 text-gray-600"
          placeholder="Nom du Produit"
          type="text"
          name="productName"
          onChange={handleInputChange}
          value={formData.productName}
        />
        <textarea
          className="w-full border p-2 rounded mt-2 text-gray-600"
          placeholder="Description du produit ..."
          name="productDescription"
          onChange={handleInputChange}
          value={formData.productDescription}
        />

        <div className="flex justify-between items-center mt-2">
          <input
            className="border p-2 rounded w-1/2 text-gray-600"
            placeholder="Prix du produit"
            type="number"
            name="productPrice"
            onChange={handleInputChange}
            value={formData.productPrice}
          />
          <input
            className="border p-2 rounded w-1/2 text-gray-600"
            placeholder="Cout de Production"
            type="number"
            name="productCost"
            onChange={handleInputChange}
            value={formData.productCost}
          />
        </div>
        <div className="flex items-center space-x-2">
          {formData.color?.map((color, index) => {
            return color.second === "" ? (
              <div
                key={index}
                className="w-6 h-6 rounded-full"
                style={{
                  background: color.first,
                }}
                onClick={() => handleColorClick(color)}
              ></div>
            ) : (
              <div
                key={index}
                className="w-6 h-6 rounded-full"
                style={{
                  background: `linear-gradient(to bottom right, ${color.first} 50%, ${color.second} 50%)`,
                }}
                onClick={() => handleColorClick(color)}
              ></div>
            );
          })}

          <button
            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
            onClick={() => setIsColorPickerOpen(true)}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-gray-700">Catégories</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {buttonsType.map((buttonName) => (
            <button
              key={buttonName}
              className={`
              px-3 py-1 rounded-full border-2 ${
                selectedButtonType === buttonName ? "border-blue" : ""
              }`}
              onClick={() => handleClick(buttonName)}
            >
              {buttonName}
            </button>
          ))}
        </div>
        <h3 className="font-semibold text-gray-700 mt-2">Sous-catégories</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {buttonsTypeUnder.map((buttonName) => (
            <button
              key={buttonName}
              className={`
              px-3 py-1 rounded-full border-2 ${
                selectedButtonTypeUnder === buttonName ? "border-blue" : ""
              }`}
              onClick={() => handleClickUnder(buttonName)}
            >
              {buttonName}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-gray-700">Meta description</h3>
        <input
          className="w-full border p-2 rounded mt-1 text-gray-600"
          placeholder="Nom du Produit"
          type="text"
          name="metaTitle"
          onChange={handleInputChange}
          value={formData.metaTitle}
        />
        <textarea
          className="w-full border p-2 rounded mt-2 text-gray-600"
          placeholder="Description du produit ..."
          type="text"
          name="metaDescription"
          onChange={handleInputChange}
          value={formData.metaDescription}
        />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-gray-700">Description technique</h3>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div>
            <p className="text-gray-500 text-sm">Poids</p>
            <input
              className="border p-2 rounded w-full text-gray-600"
              placeholder="Poids"
              type="number"
              name="weight"
              onChange={handleInputChange}
              value={formData.weight}
            />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Matériaux</p>
            <input
              className="border p-2 rounded w-full text-gray-600"
              placeholder="Type de Matériaux"
              type="text"
              name="material"
              onChange={handleInputChange}
              value={formData.material}
            />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Puissance</p>
            <input
              className="border p-2 rounded w-full text-gray-600"
              placeholder="Wh"
              type="number"
              name="voltage"
              onChange={handleInputChange}
              value={formData.voltage}
            />
          </div>
        </div>

        <h3 className="font-semibold text-gray-700 mt-2">
          Dimensions (L x l x h)
        </h3>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <input
            className="border p-2 rounded text-gray-600"
            placeholder="Largeur"
            type="number"
            name="dimensions[0].largeur"
            onChange={handleInputChange}
            value={formData.dimensions?.[0]?.largeur || ""}
          />
          <input
            className="border p-2 rounded text-gray-600"
            placeholder="Hauteur"
            type="number"
            name="dimensions[0].hauteur"
            onChange={handleInputChange}
            value={formData.dimensions?.[0]?.hauteur || ""}
          />
          <input
            className="border p-2 rounded text-gray-600"
            placeholder="Profondeur"
            type="number"
            name="dimensions[0].profondeur"
            onChange={handleInputChange}
            value={formData.dimensions?.[0]?.profondeur || ""}
          />
        </div>

        <h3 className="font-semibold text-gray-700 mt-2">Poids du Colis</h3>
        <input
          className="w-full border p-2 rounded text-gray-600"
          placeholder="Poids du Produit"
          type="number"
          name="packageWeight"
          onChange={handleInputChange}
          value={formData.packageWeight}
        />
      </div>

      {isColorPickerOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg z-50">
          <h3 className="font-semibold text-gray-700 mb-2">Select Colors</h3>
          <div className="flex space-x-2">
            <input
              type="color"
              value={currentColor.first}
              onChange={(e) =>
                setCurrentColor({ ...currentColor, first: e.target.value })
              }
            />
            <input
              type="color"
              value={currentColor.second}
              onChange={(e) =>
                setCurrentColor({ ...currentColor, second: e.target.value })
              }
            />
          </div>
          <div className="mt-2">
            <button
              onClick={addColor}
              className="bg-blue text-white py-2 px-4 rounded"
            >
              Add Color
            </button>
            <button
              onClick={() => setIsColorPickerOpen(false)}
              className="ml-2 bg-red-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={(e) => {
          if (modify === true) {
            updateProduct(formData._id);
          } else {
            addProduct(e);
          }
          setFormData(blankProduct);
          showAddingProduct(false);
          setModify(false);
        }}
        className="w-full bg-blue text-white py-2 rounded-second mt-prime flex items-center justify-center"
      >
        <span>💾</span> <span className="ml-2">Sauvegarder</span>
      </button>
    </div>
  );
}

function ProductPage() {
  const [add, setAdd] = useState(false);
  const [products, setProducts] = useState([]);
  const [productVisibility, setProductVisibility] = useState([]);

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

  useEffect(() => {
    isVisibility();
  }, [products]);

  const showAddingProduct = (bool) => {
    setAdd(bool);
  };

  const deleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Are you sure about that?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/delete-product/${productId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setProducts(products.filter((product) => product._id !== productId));
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const [modify, setModify] = useState(false);
  const [productId, setProductId] = useState(null);

  const modifyProduct = (product) => {
    setModify(true);
    setProductId(product);
    setAdd(true);
  };

  const isVisibility = useCallback(() => {
    if (products.length > 0) {
      const visibleProductIds = products
        .filter((product) => product.isVisible)
        .map((product) => product._id);

      setProductVisibility(visibleProductIds);
    }
  }, [products]);

  const visibleProduct = async (productid) => {
    setProductVisibility((prevVisibility) => {
      return prevVisibility.includes(productid)
        ? prevVisibility.filter((id) => id !== productid)
        : [...prevVisibility, productid];
    });

    const formData = products.find((product) => product._id === productid);

    const updatedFormData = { ...formData, isVisible: !formData.isVisible };

    try {
      const response = await fetch(
        `http://localhost:3000/modify-product/${productid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFormData),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`);
      }

      const updatedProduct = await response.json();
      return updatedProduct;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit :", error);
      return null;
    }
  };

  return (
    <div className="py-prime flex">
      <div className="w-full">
        <div className="flex w-full gap-prime">
          <div className="flex-1 bg-white rounded-second font-bold p-prime">
            <p className="text-second">Produits actifs</p>
            <p className="text-blue text-third">{products.length}</p>
          </div>
          <div className="flex-1 bg-white rounded-second p-prime">
            <p className="text-second font-bold">Le + vendu</p>
            <div className="flex">
              <div className="bg-bg-color w-16 h-16 rounded-second"></div>
              <div className="text-[15px] p-[10px]">
                <p className="font-bold">Limus Nomus</p>
                <div className="flex">
                  <p>Note :</p>
                  <p className="font-bold">X</p>
                  <p>svg start</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-second font-bold p-prime">
            <p className="text-second">Satisfaction</p>
          </div>
          {!add && (
            <button
              className="flex-1 bg-white rounded-second font-bold flex text-center items-center justify-center p-prime"
              onClick={() => {
                setProductId(null);
                setModify(false);
                showAddingProduct(true);
              }}
            >
              <p className="text-second">Ajouter un Produit</p>
            </button>
          )}
        </div>
        <div className="bg-white rounded-second my-prime">
          {products.map((product) => (
            <div className="flex items-center p-4 w-full">
              <div className="flex items-center space-x-6 text-sm">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>

                <div className="ml-4 flex-grow">
                  <p className="font-bold text-[15px]">{product.productName}</p>
                  <div className="flex items-center space-x-1 text-sm">
                    <p>Note :</p>
                    <p className="font-bold">x</p>
                    <p>⭐</p>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <p className="pr-1">Performance:</p>
                    <p className="text-green-500 font-semibold">Excellente</p>
                  </div>
                  <div className="flex">
                    <div className="flex">
                      <p>img</p>
                      <p>994</p>
                    </div>
                    <div className="flex">
                      <p>img</p>
                      <p>12,4 k</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p>Prix</p>
                  <p className="font-semibold">{product.productPrice} €</p>
                </div>
                <div>
                  <p>Catégorie</p>
                  <div className="justify-self-center">
                    {product.categories === "Desk" ? (
                      <p>🖥️</p>
                    ) : product.categories === "Stand Alone" ? (
                      <p>🪑</p>
                    ) : product.categories === "Applique" ? (
                      <p>🛋️</p>
                    ) : product.categories === "Plafonnier" ? (
                      <p>💡</p>
                    ) : (
                      "❓"
                    )}
                  </div>
                </div>
                <div>
                  <p>Visibilité</p>
                  <div
                    onClick={() => visibleProduct(product._id)}
                    className={`w-16 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${
                      productVisibility.includes(product._id)
                        ? "bg-blue"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        productVisibility.includes(product._id)
                          ? "translate-x-8"
                          : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 text-gray-600 ml-auto">
                <button
                  onClick={() => {
                    modifyProduct(product._id);
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => {
                    window.open(
                      `http://localhost:5173/product/${product.productSlug}`,
                      "_blank"
                    );
                  }}
                >
                  👁️
                </button>
                <button
                  onClick={() => {
                    deleteProduct(product._id);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {add && (
        <ProductSheet
          showAddingProduct={showAddingProduct}
          modify={modify}
          setModify={setModify}
          productId={productId}
        />
      )}
    </div>
  );
}

export default ProductPage;
