const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 3000; // Port du serveur API

// Middleware pour analyser les données JSON et activer CORS
app.use(express.json());
app.use(cors()); // Enable CORS

// Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/mydatabase")
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB:", err);
    process.exit(1); // Arrêter l'application si MongoDB est inaccessible
  });

// Définition et modèle du schéma
const Product = mongoose.model("Product", {
  productName: String,
  productDescription: String,
  productPrice: String,
});

// Routes API
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.post("/add-product", async (req, res) => {
  const { productName, productDescription, productPrice } = req.body;
  try {
    const product = new Product({
      productName,
      productDescription,
      productPrice,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.delete("/delete-product/:id", async (req, res) => {
  // Fixed to use route parameters
  const { id } = req.params;
  try {
    const result = await Product.findByIdAndDelete(id);
    if (result) {
      res.status(200).send("Produit supprimé avec succès");
    } else {
      res.status(404).send("Produit introuvable");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    res.status(500).send("Erreur interne du serveur");
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution : http://localhost:${port}`);
});
