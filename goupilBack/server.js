require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/mydatabase")
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB:", err);
    process.exit(1);
  });

const Product = mongoose.model("Product", {
  productName: String,
  productSlug: String,
  productDescription: String,
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
  secondName: String,
  firstName: String,
  phone: String,
  address: {
    streetNumber: Number,
    streetName: String,
    zipcode: Number,
  },
  cart: [
    {
      colorRow: Number,
      productId: String,
      quantity: Number,
    },
  ],
  role: {
    type: String,
    enum: ["admin", "user"],
  },
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
  shipping: {
    type: String,
    enum: ["Fabrication", "Emballage", "En cours de livraison", "Livré"],
  },
  date: { type: Date, default: Date.now },
});

const JWT_SECRET = process.env.JWT_SECRET || "SuperSecretKey";

app.post("/register", async (req, res) => {
  const { email, password, secondName, firstName, phone, address } = req.body;
  const cart = [];
  const role = "user";

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
      secondName,
      firstName,
      phone,
      address,
      cart,
      role,
    });
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }
  email = email.toLowerCase();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(200).json({ message: "Connexion réussie", token });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.get("/getUser", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Accès refusé. Aucun token fourni." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) {
      return res.status(403).json({ error: "Token invalide." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.post("/updateUser", async (req, res) => {
  try {
    const { secondName, firstName, phone, address, cart } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Accès refusé. Aucun token fourni." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) {
      return res.status(403).json({ error: "Token invalide." });
    }

    if (!secondName && !firstName && !phone && !address && !cart) {
      return res.status(400).json({ error: "Aucune donnée à mettre à jour." });
    }

    const updatedFields = {
      ...(secondName && { secondName }),
      ...(firstName && { firstName }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(Array.isArray(cart) && { cart }),
    };

    const user = await User.findByIdAndUpdate(decoded.userId, updatedFields, {
      new: true,
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token invalide" });
  }
};

app.get("/protected", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    res.status(405).send("Access denied");
  }
  res.status(200).send("Okay");
});

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
    if (!productName || !productDescription || !productPrice || !productCost) {
      return res
        .status(400)
        .json({ error: "Les champs obligatoires sont manquants." });
    }
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Accès non autorisé" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ error: "Token invalide ou expiré" });
    }

    const userId = decoded.userId;

    const { products } = req.body;
    console.log("userId", userId);
    console.log("products", products);

    if (!products || !Array.isArray(products) || products.length === 0) {
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
      shipping: "Fabrication",
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
    res.status(200).json(orders);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.put("/orders-update", async (req, res) => {
  const { orderId } = req.query;
  const { shipping } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }
  console.log("orderId", orderId);

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("order", order);

    order.shipping = shipping;
    await order.save();

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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

app.get("/mail", async (req, res) => {
  const { email } = req.query;
  async function main() {
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 587,
      secure: false,
      auth: {
        user: "cd2bf050fea7b7",
        pass: "9df2abbe8011a6",
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #F7F3ED; padding: 20px;">
        <h2 style="color: #05134A;">goupil</h2>
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px;">
            <p>Bonjour !</p>
            <p>Vous avez récemment demandé à réinitialiser votre mot de passe.</p>
            <a href="http://localhost:5174/reset-password?id=anIdToTestOnPasswordChange style="display: inline-block; background: #05134A; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
              Réinitialiser le mot de passe
            </a>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: "info@mailtrap.io",
      to: email,
      subject: "Réinitialisation de mot de passe",
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
  }

  main().catch(console.error);
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution : http://localhost:${port}`);
});
