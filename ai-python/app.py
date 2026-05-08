from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import urllib.request
import json
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:5000"
]}})

api_key = os.getenv("MISTRAL_API_KEY")
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"


def call_mistral(messages_payload):
    """Appel HTTP direct à l'API Mistral via urllib (pas besoin de package externe)."""
    body = json.dumps({
        "model": "mistral-small-latest",
        "messages": messages_payload,
        "max_tokens": 600,
        "temperature": 0.7
    }).encode("utf-8")

    req = urllib.request.Request(
        MISTRAL_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.loads(response.read().decode("utf-8"))
        return result["choices"][0]["message"]["content"]


@app.route("/")
def home():
    status = "✅ clé configurée" if api_key else "❌ MISTRAL_API_KEY manquante"
    return jsonify({
        "service": "GestionVente - Python IA Service",
        "status": status,
        "port": 8000
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "python-ai", "port": 8000})


@app.route("/ai", methods=["POST"])
def ai():
    try:
        if not api_key:
            return jsonify({"error": "MISTRAL_API_KEY non configurée dans .env"}), 503

        data = request.get_json()
        if not data:
            return jsonify({"error": "Requête JSON requise"}), 400

        messages = data.get("messages")
        if not messages or not isinstance(messages, list):
            return jsonify({"error": "Le champ 'messages' est requis (tableau)"}), 400

        last_message = messages[-1].get("content", "").strip()
        if not last_message:
            return jsonify({"error": "Message vide"}), 400

        # Construction du payload avec prompt système
        messages_payload = [
            {
                "role": "system",
                "content": (
                    "Tu es GestoBot, un assistant intelligent pour une application "
                    "de gestion de ventes et de produits. Tu aides les utilisateurs "
                    "avec la gestion de leurs stocks, produits et ventes. "
                    "Réponds toujours en français, de manière claire et professionnelle."
                )
            },
            *messages
        ]

        reply = call_mistral(messages_payload)
        return jsonify({"reply": reply})

    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"❌ Erreur HTTP Mistral : {e.code} - {err_body}")
        if e.code == 401:
            return jsonify({"error": "Clé API Mistral invalide"}), 401
        return jsonify({"error": f"Erreur API Mistral : {e.code}"}), 502

    except urllib.error.URLError as e:
        print(f"❌ Erreur réseau : {str(e)}")
        return jsonify({"error": "Impossible de contacter l'API Mistral"}), 503

    except Exception as e:
        print(f"❌ Erreur Python IA : {str(e)}")
        return jsonify({"error": f"Erreur interne : {str(e)}"}), 500


if __name__ == "__main__":
    if not api_key:
        print("⚠️  ATTENTION: MISTRAL_API_KEY non trouvée dans .env")
    else:
        print(f"✅ Clé Mistral AI chargée : {api_key[:8]}...")
    print("🚀 Démarrage serveur Python IA sur http://127.0.0.1:8000")
    app.run(host="127.0.0.1", port=8000, debug=True)
