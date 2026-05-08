const OpenAI = require("openai");
const Product = require("../models/Product");

const client = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

exports.chat = async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message requis" });
  }

  try {
    // Récupérer les produits pour le contexte IA
    const products = await Product.findAll({
      attributes: ["numProduit", "design", "quantity", "price"],
      limit: 50,
    });

    const productContext =
      products.length > 0
        ? products
            .map(
              (p) =>
                `- ${p.design} (ID: ${p.numProduit}) | Quantité: ${p.quantity} | Prix: ${p.price} Ar`,
            )
            .join("\n")
        : "Aucun produit en stock.";

    const systemPrompt = `Tu es GestoBot, un assistant intelligent intégré dans une application de gestion de ventes et de produits.

Tu aides les utilisateurs à :
- Consulter les produits disponibles et leur stock
- Analyser les données de vente
- Donner des conseils sur la gestion des stocks et des prix
- Répondre à toute question liée à la gestion commerciale

Voici la liste actuelle des produits en base de données :
${productContext}

Réponds toujours en français, de manière claire, précise et professionnelle.
Si on te demande des informations sur un produit, base-toi sur les données ci-dessus.`;

    const response = await client.chat.completions.create({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ Erreur Mistral AI :", error.message);

    if (error.message?.includes("API key")) {
      return res
        .status(401)
        .json({
          error:
            "Clé API Mistral invalide ou manquante. Vérifiez votre fichier .env",
        });
    }

    return res.status(500).json({ error: "Erreur IA : " + error.message });
  }
};
