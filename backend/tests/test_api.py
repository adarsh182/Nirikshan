from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


def test_health_endpoints():
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "ok"
    assert "X-Process-Time" in r1.headers
    assert r1.headers["X-Content-Type-Options"] == "nosniff"
    assert r1.headers["X-Frame-Options"] == "SAMEORIGIN"

    r2 = client.get("/api/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "ok"
    assert r2.headers["X-Content-Type-Options"] == "nosniff"


def test_ready_endpoint():
    r = client.get("/ready")
    assert r.status_code == 200
    assert r.json()["status"] == "ready"


def test_list_kits():
    r = client.get("/kits")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Check kit fields
    first_kit = data[0]
    assert "id" in first_kit
    assert "name" in first_kit
    assert "confidence_threshold" in first_kit


def test_list_operators():
    r = client.get("/auth/operators")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "badge_id" in data[0]


def test_login_flow():
    # Attempt login with seeded badge
    r = client.post("/auth/login", json={"badge_id": "OFF-001"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["badge_id"] == "OFF-001"
