import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import download_and_transcribe, summarize_podcast_transcription

app = Flask(__name__)
CORS(
    app,
    resources={r"/transcribe": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)


@app.route("/transcribe", methods=["POST"])
def transcribe_episode():
    data = request.get_json()
    app.logger.debug(f"Received data: {data}")
    audio_preview_url = data.get("audioPreviewUrl")
    if not audio_preview_url:
        return jsonify({"error": "Missing audioPreviewUrl parameter"}), 400

    try:
        transcription = download_and_transcribe(audio_preview_url)
        summary = summarize_podcast_transcription(transcription)
        return jsonify({"transcription": transcription, "summary": summary}), 200
    except Exception as e:
        app.logger.error(f"Error during transcription: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/version", methods=["GET"])
def get_version():
    return jsonify({"version": "liav"})


@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    app.logger.debug(f"Response headers: {response.headers}")
    return response


if __name__ == "__main__":
    app.run(debug=True)
