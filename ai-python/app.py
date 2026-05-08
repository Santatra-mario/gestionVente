from flask import Flask, request, jsonify
from flask_cors import CORS
from mistralai import Mistral
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3001", "http://localhost:3000", "http://localhost:5000"]}})

# Initialisation du client Mistral
api_key = os.getenv("MISTRAL_API_KEY")
client = Mistral(api_key=api_key) if api_key else None


@app.route('/')
def home():
    status = "✅ connecté" if client else "❌ MISTRAL_API_KEY manquante"
    return jsonify({
        "service": "GestionVente - Python IA Service",
        "status": status,
        "port": 8000
    })


@app.route('/ai', methods=['POST'])
def ai():
    try:
        if not client:
            return jsonify({"error": "MISTRAL_API_KEY non configurée dans le fichier .env"}), 503

        data = request.get_json()

        if not data:
            return jsonify({"error": "Requête JSON requise"}), 400

        messages = data.get("messages")

        if not messages or not isinstance(messages, list):
            return jsonify({"error": "Le champ 'messages' est requis (tableau)"}), 400

        last_message = messages[-1].get("content", "").strip()

        if not last_message:
            return jsonify({"error": "Message vide"}), 400

        # Appel Mistral AI
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Tu es GestoBot, un assistant intelligent pour une application de gestion de ventes. "
                        "Tu aides les utilisateurs avec la gestion de leurs produits, stocks, et ventes. "
                        "Réponds toujours en français, de manière claire et professionnelle."
                    )
                },
                *messages
            ],
            max_tokens=600,
            temperature=0.7
        )

        reply = response.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        print(f"❌ Erreur Python IA : {str(e)}")
        return jsonify({"error": f"Erreur interne : {str(e)}"}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "python-ai", "port": 8000})


if __name__ == "__main__":
    if not api_key:
        print("⚠️  ATTENTION: MISTRAL_API_KEY non trouvée dans .env")
        print("   Créez un fichier .env dans ai-python/ avec: MISTRAL_API_KEY=votre_clé")
    else:
        print("✅ Clé Mistral AI chargée")
    print("🚀 Démarrage serveur Python IA sur http://127.0.0.1:8000")
    app.run(host="127.0.0.1", port=8000, debug=True)
