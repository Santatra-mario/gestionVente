// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const { connectDB } = require('./config/db'); // ✅ Ajout Sequelize

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Connexion MySQL (pour auth)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_produits'
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur MySQL (auth) :", err.message);
  } else {
    console.log("✅ MySQL (auth) connecté !");
  }
});

// ====================== ROUTES ======================

// Inscription
app.post('/api/auth/register', async (req, res) => {
  const { nom, email, password } = req.body;

  if (!nom || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [nom, email, hashedPassword], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: "Cet email existe déjà" });
        }
        console.error("Erreur register:", err.message);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.status(201).json({ message: "Compte créé avec succès" });
    });
  } catch (err) {
    console.error("Erreur hashage:", err.message);
    res.status(500).json({ message: "Erreur lors du hashage" });
  }
});

// Connexion
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  const sql = "SELECT * FROM login WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Erreur login DB:", err.message);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    try {
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      res.json({
        message: "Connexion réussie",
        user: { id: user.id, name: user.name || user.nom, email: user.email }
      });
    } catch (err) {
      console.error("Erreur bcrypt:", err.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
});

// Autres routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));


// 404
app.use((req, res) => res.status(404).json({ message: "Route non trouvée" }));

// Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error("❌ Erreur non gérée :", err.message);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// ✅ Démarrage APRÈS connexion Sequelize
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
});
