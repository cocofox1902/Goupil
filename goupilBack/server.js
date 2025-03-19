require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// use Argon2
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000; // Port du serveur API

// Middleware pour analyser les données JSON et activer CORS
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
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
  productSlug: String,
  productDescription: String,
  productPrice: Number,
  productPrice: Number,
  productCost: Number,
  color: [
    {
      first: String,
      second: String,
      photo: [
        {
          url: String,
          altText: String,
        },
      ],
    },
  ],
  weight: Number,
  packageWeight: Number,
  dimensions: [
    {
      largeur: Number,
      hauteur: Number,
      profondeur: Number,
    },
  ],
  categories: String,
  voltage: Number,
  material: String,
  isOutdoor: Boolean,
  unitsSold: Number,
  isVisible: Boolean,
  metaTitle: String,
  metaDescription: String,
});

const User = mongoose.model("User", {
  email: { type: String, unique: true },
  password: String,
  name: String,
  firstName: String,
  phone: String,
  address: String,
  cart: [
    {
      colorRow: Number,
      productId: String,
      quantity: Number,
    },
  ],
});

const Order = mongoose.model("Order", {
  productInformation: [
    {
      productId: String,
      productColorRow: Number,
      quantity: Number,
    },
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  shipping: String,
  date: { type: Date, default: Date.now },
});

const JWT_SECRET = process.env.JWT_SECRET || "SuperSecretKey";

// 🔹 ROUTE D'INSCRIPTION
app.post("/register", async (req, res) => {
  const { email, password, name, firstName, phone, address } = req.body;
  const cart = [];

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      firstName,
      phone,
      address,
      cart,
    });
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// 🔹 ROUTE DE CONNEXION AVEC JWT
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.status(200).json({ message: "Connexion réussie", token });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.post("/updateUser", async (req, res) => {
  try {
    const { token, name, firstName, phone, address, cart } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Accès refusé. Aucun token fourni." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) {
      return res.status(403).json({ error: "Token invalide." });
    }

    const user = await User.findByIdAndUpdate(decoded.userId, {
      ...(name && { name }),
      ...(firstName && { firstName }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(cart && { cart }),
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res
      .status(200)
      .json({ message: "Utilisateur mis à jour avec succès", user });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Accès refusé" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(403).json({ error: "Utilisateur non trouvé" });
    }

    req.user = user; // Attach user to request object
    next(); // Move to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ error: "Token invalide" });
  }
};

app.get("/protected", authenticateToken, (req, res) => {
  if (req.user.email !== "adress@gmail.com") {
    res.json({ user: req.user, access: false });
  }
  res.json({ user: req.user, access: true });
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

app.get("/products-find", async (req, res) => {
  const { productId } = req.query;
  try {
    const filter = { _id: productId };
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.post("/add-product", async (req, res) => {
  try {
    let {
      productName,
      productSlug,
      productDescription,
      metaTitle,
      metaDescription,
      productPrice,
      productCost,
      color,
      weight,
      packageWeight,
      dimensions,
      voltage,
      material,
      isOutdoor,
      unitsSold,
      categories,
    } = req.body;

    // Vérifier les champs obligatoires
    if (!productName || !productDescription || !productPrice || !productCost) {
      return res
        .status(400)
        .json({ error: "Les champs obligatoires sont manquants." });
    }

    // Si le slug est vide ou incorrect, on le génère à partir du nom
    if (!productSlug || typeof productSlug !== "string") {
      productSlug = productName.toLowerCase().replace(/\s+/g, "-");
    }

    const product = new Product({
      productName,
      productSlug,
      productDescription,
      metaTitle,
      metaDescription,
      productPrice: Number(productPrice),
      productCost: Number(productCost),
      color,
      weight: Number(weight),
      packageWeight: Number(packageWeight),
      dimensions,
      voltage: Number(voltage),
      material,
      categories,
      isOutdoor: Boolean(isOutdoor),
      unitsSold: Number(unitsSold),
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
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

app.put("/modify-product/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const {
      productName,
      productSlug,
      productDescription,
      metaTitle,
      metaDescription,
      productPrice,
      productCost,
      quantity,
      isDimmable,
      isOutdoor,
      voltage,
      color,
      dimensions,
      weight,
      packageWeight,
      unitsSold,
      material,
      categories,
      isVisible,
    } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        productSlug,
        productDescription,
        metaTitle,
        metaDescription,
        productPrice: Number(productPrice),
        productCost: Number(productCost),
        quantity: Number(quantity),
        isDimmable: Boolean(isDimmable),
        isOutdoor: Boolean(isOutdoor),
        voltage: Number(voltage),
        color,
        dimensions,
        weight,
        packageWeight,
        unitsSold,
        material,
        categories,
        isVisible,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).send("Produit introuvable");
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Erreur lors de la modification du produit:", error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.post("/pay", async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (
      !userId ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({ error: "Données invalides" });
    }

    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    const productDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Produit non trouvé: ${item.productId}`);
        }

        return {
          productId: product._id,
          productColorRow: item.productColorRow,
          quantity: item.quantity,
        };
      })
    );

    const newOrder = new Order({
      user: userFound._id,
      productInformation: productDetails,
      shipping: "pending",
      date: Date.now(),
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Commande créée avec succès", order: newOrder });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    // await Order.deleteMany();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.get("/user-find", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "L'ID utilisateur est requis" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).send("Erreur interne du serveur");
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution : http://localhost:${port}`);
});
