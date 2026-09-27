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


def test_browser_navigation_spa_fallback():
    # 1. API request without browser navigation headers returns JSON
    r_api = client.get("/tests")
    assert r_api.status_code == 200
    assert "application/json" in r_api.headers.get("content-type", "")
    assert "items" in r_api.json()

    # 2. Browser page navigation / refresh to /tests with Sec-Fetch-Dest: document returns HTML
    r_browser = client.get("/tests", headers={
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    assert r_browser.status_code == 200
    assert "text/html" in r_browser.headers.get("content-type", "")
    assert "<!doctype html>" in r_browser.text.lower() or "<html" in r_browser.text.lower()

    # 3. Browser page navigation to /tests/{test_id} returns HTML
    r_detail = client.get("/tests/640242e5-79d6-4d91-a771-917225adb506", headers={
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Accept": "text/html",
    })
    assert r_detail.status_code == 200
    assert "text/html" in r_detail.headers.get("content-type", "")

    # 4. API request to /api/tests even with Accept: text/html returns JSON (API routes never intercepted)
    r_api_prefix = client.get("/api/tests")
    assert r_api_prefix.status_code == 200
    assert "application/json" in r_api_prefix.headers.get("content-type", "")

