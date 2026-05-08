const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// ================= ROUTES =================

// ➕ Ajouter un produit (AUTO_INCREMENT géré par DB)
router.post('/', createProduct);

// 📋 Lister tous les produits
router.get('/', getProducts);

// 🔍 Voir un produit par ID (numProduit AUTO_INCREMENT)
router.get('/:id', (req, res, next) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  next();
}, getProductById);

// ✏️ Modifier un produit
router.put('/:id', (req, res, next) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  next();
}, updateProduct);

// 🗑️ Supprimer un produit
router.delete('/:id', (req, res, next) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  next();
}, deleteProduct);

module.exports = router;