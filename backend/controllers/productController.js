const Product = require('../models/Product');

// ================= CREATE =================
exports.createProduct = async (req, res) => {
  try {
    const { design, quantity, price } = req.body;

    const product = await Product.create({
      design,
      quantity,
      price
    });

    return res.status(201).json(product);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    return res.status(500).json({
      message: "Erreur lors de la création du produit",
      error: err.message
    });
  }
};

// ================= GET ALL =================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['numProduit', 'DESC']]
    });

    return res.status(200).json(products);

  } catch (err) {
    console.error("GET ALL ERROR:", err);
    return res.status(500).json({
      message: "Erreur lors de la récupération des produits",
      error: err.message
    });
  }
};

// ================= GET ONE =================
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    // sécurité simple
    if (!id) {
      return res.status(400).json({ message: "ID manquant" });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    return res.status(200).json(product);

  } catch (err) {
    console.error("GET ONE ERROR:", err);
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    });
  }
};

// ================= UPDATE =================
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { design, quantity, price } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID manquant" });
    }

    const [updated] = await Product.update(
      { design, quantity, price },
      {
        where: { numProduit: id }
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    const product = await Product.findByPk(id);

    return res.status(200).json(product);

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return res.status(500).json({
      message: "Erreur lors de la modification",
      error: err.message
    });
  }
};

// ================= DELETE =================
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "ID manquant" });
    }

    const deleted = await Product.destroy({
      where: { numProduit: id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    return res.status(200).json({
      message: "Produit supprimé avec succès"
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({
      message: "Erreur lors de la suppression",
      error: err.message
    });
  }
};