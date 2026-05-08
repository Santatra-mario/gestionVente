const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = "secretkey";

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // vérifier utilisateur
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    // vérifier mot de passe
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // créer token
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });

    res.json({
      message: "Connexion réussie",
      token
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};