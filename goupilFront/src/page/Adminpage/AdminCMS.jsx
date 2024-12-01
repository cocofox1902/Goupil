import { useEffect, useState } from "react";

function AdminCMS() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
  });

  // Fetch products from the server
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/products"); // Updated to match the backend URL
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Add a new product
  const addProduct = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/add-product", {
        // Updated URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          productName: "",
          productDescription: "",
          productPrice: "",
        });
        fetchProducts(); // Refresh the product list
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Delete a product
  const deleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Are you sure about that?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/delete-product/${productId}`,
        {
          // Updated URL to pass the product ID
          method: "DELETE",
        }
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

  // Update form data
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Product Management</h1>

      <form onSubmit={addProduct}>
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="productName"
          value={formData.productName}
          onChange={handleInputChange}
          placeholder="Enter product name"
          required
        />

        <label htmlFor="description">Product Description:</label>
        <input
          type="text"
          id="description"
          name="productDescription"
          value={formData.productDescription}
          onChange={handleInputChange}
          placeholder="Enter product description"
          required
        />

        <label htmlFor="price">Product Price:</label>
        <input
          type="text"
          id="price"
          name="productPrice"
          value={formData.productPrice}
          onChange={handleInputChange}
          placeholder="Enter product price"
          required
        />

        <button type="submit">Add Product</button>
      </form>

      <div className="Table">
        <h2>Product List</h2>
        <table className="tableauProduits">
          <thead>
            <tr>
              <th>Product</th>
              <th>Description</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.productName}</td>
                <td>{product.productDescription}</td>
                <td>{product.productPrice}</td>
                <td>
                  <button onClick={() => deleteProduct(product._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCMS;
