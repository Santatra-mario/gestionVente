const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// ================= SEQUELIZE CONFIG =================
const sequelize = new Sequelize(
  process.env.DB_NAME || 'gestion_produits',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',

    dialect: 'mysql',

    port: 3306, // WAMP MySQL default

    logging: false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    define: {
      freezeTableName: true,
      timestamps: true
    }
  }
);

// ================= CONNECT FUNCTION =================
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connecté avec succès !');

    // optionnel mais recommandé
    await sequelize.sync();
    console.log('📦 Tables synchronisées');

  } catch (err) {
    console.error('❌ Erreur de connexion MySQL :', err.message);

    if (err.message.includes('Unknown database')) {
      console.log("👉 Crée la base 'gestion_produits' dans phpMyAdmin");
    }

    if (err.message.includes('ECONNREFUSED')) {
      console.log("👉 Vérifie que WAMP MySQL est démarré (vert)");
    }

    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };