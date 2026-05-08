const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ================= GET ALL USERS =================
router.get('/', async (req, res) => {
  try {
    const users = await db.sequelize.models.User.findAll();

    return res.status(200).json(users);

  } catch (error) {
    console.error("Erreur GET users :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des utilisateurs",
      error: error.message
    });
  }
});

module.exports = router;