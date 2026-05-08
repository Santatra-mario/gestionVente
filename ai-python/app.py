from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# 🔥 Autoriser requêtes depuis React / Node
CORS(app)

@app.route('/')
def home():
    return "Python IA fonctionne ✅"


@app.route('/ai', methods=['POST'])
def ai():
    try:
        data = request.get_json()

        # 🔥 Vérification JSON
        if not data:
            return jsonify({"error": "Requête JSON requise"}), 400

        # 🔥 Support conversation
        messages = data.get("messages")

        if not messages or not isinstance(messages, list):
            return jsonify({"error": "messages requis (tableau)"}), 400

        # 🔥 Vérifier dernier message
        last_message = messages[-1].get("content", "").strip()

        if not last_message:
            return jsonify({"error": "message vide"}), 400

        # 🔥 Simulation IA (simple)
        reply = f"IA répond: {last_message}"

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        print("❌ Erreur Python :", str(e))  # log console
        return jsonify({"error": "Erreur interne serveur"}), 500


if __name__ == "__main__":
    print("🚀 Démarrage serveur Python...")
    app.run(host="127.0.0.1", port=5000, debug=True)