from backend.app import app


def test_health_endpoint():
    app.config["TESTING"] = True

    with app.test_client() as client:
        response = client.get("/api/health")

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "healthy"


def test_threats_endpoint():
    app.config["TESTING"] = True

    with app.test_client() as client:
        response = client.get("/api/threats?limit=10")

    assert response.status_code == 200

    data = response.get_json()

    assert "threats" in data
    assert len(data["threats"]) <= 10


def test_search_requires_query():
    app.config["TESTING"] = True

    with app.test_client() as client:
        response = client.get("/api/search")

    assert response.status_code == 400

    data = response.get_json()

    assert "error" in data