from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path
from backend.models.database import get_connection

PROJECT_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_FOLDER = PROJECT_ROOT / "frontend"

app = Flask(
    __name__,
    static_folder=str(FRONTEND_FOLDER),
    static_url_path="/static"
)

@app.route("/", methods=["GET"])
def home():
    return send_from_directory(FRONTEND_FOLDER, "index.html")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "database": "SQLite",
        "data_label": "SYNTHETIC/DEMO ONLY"
    })


@app.route("/api/threats", methods=["GET"])
def get_threats():
    try:
        limit = request.args.get("limit", default=50, type=int)

        if limit is None or limit < 1 or limit > 200:
            return jsonify({
                "error": "limit must be between 1 and 200"
            }), 400

        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT record_id, ioc_type, ioc_value, category,
                       severity, confidence, risk_score, risk_level,
                       data_label
                FROM threat_records
                ORDER BY record_id
                LIMIT ?
                """,
                (limit,)
            ).fetchall()

            threats = [dict(row) for row in rows]

            return jsonify({
                "count": len(threats),
                "data_label": "SYNTHETIC/DEMO ONLY",
                "threats": threats
            })
        finally:
            connection.close()

    except Exception:
        app.logger.exception("Unable to retrieve threat records")
        return jsonify({
            "error": "Unable to retrieve threat records"
        }), 500


@app.route("/api/search", methods=["GET"])
def search_threats():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({
            "error": "Please provide a search term using ?q="
        }), 400

    connection = get_connection()

    try:
        rows = connection.execute("""
            SELECT *
            FROM threat_records
            WHERE ioc_value LIKE ?
            ORDER BY risk_score DESC
            LIMIT 100
        """, (f"%{query}%",)).fetchall()

        return jsonify({
            "query": query,
            "count": len(rows),
            "results": [dict(row) for row in rows],
            "data_label": "SYNTHETIC/DEMO ONLY"
        })
    finally:
        connection.close()

if __name__ == "__main__":
    app.run(debug=False, port=5000)