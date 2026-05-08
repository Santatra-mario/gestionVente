const OpenAI = require('openai');
const Product = require('../models/Product');

const client = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1'
});

exports.chat = async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message requis" });

  try {
    const products = await Product.findAll();
    const context = JSON.stringify(products);

    const response = await client.chat.completions.create({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant pour une application de gestion de produits. Voici les produits : ${context}`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500
    });

    const reply = response.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("❌ Erreur Mistral :", error.message);
    return res.status(500).json({ error: "Erreur IA : " + error.message });
  }
};