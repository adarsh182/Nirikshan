import uuid
from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


def test_sync_batch_endpoint():
    # 1. Fetch available kit
    kits_resp = client.get("/kits")
    assert kits_resp.status_code == 200
    kit_id = kits_resp.json()[0]["id"]

    client_id_1 = str(uuid.uuid4())
    client_id_2 = str(uuid.uuid4())

    batch_payload = {
        "device_id": "EXP-MBL-FIELD-01",
        "operator_id": "OFF-001",
        "records": [
            {
                "client_record_id": client_id_1,
                "kit_type_id": kit_id,
                "result": "positive",
                "confidence": 0.95,
                "device_captured_at": "2026-09-18T17:00:00.000Z",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "location_accuracy_m": 5.2,
                "location_source": "gps_hardware",
                "location_verified": True,
                "notes": "Offline check at remote border outpost",
            },
            {
                "client_record_id": client_id_2,
                "kit_type_id": kit_id,
                "result": "negative",
                "confidence": 0.89,
                "device_captured_at": "2026-09-18T17:05:00.000Z",
                "latitude": 19.0762,
                "longitude": 72.8779,
                "location_accuracy_m": 4.8,
                "location_source": "gps_hardware",
                "location_verified": True,
                "notes": "Secondary sample verification",
            },
        ],
    }

    # First transmission: should sync both records
    resp = client.post("/tests/sync-batch", json=batch_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["processed"] == 2
    assert data["failed"] == 0
    assert len(data["sync_results"]) == 2
    assert data["sync_results"][0]["status"] == "synced"
    assert data["sync_results"][0]["signature"] is not None

    # Verify the synced record is verifiable via standard verification endpoint
    verify_resp = client.get(f"/tests/{client_id_1}/verify")
    assert verify_resp.status_code == 200
    verify_data = verify_resp.json()
    assert verify_data["record_hash_match"] is True
    assert verify_data["signature_valid"] is True

    # Re-transmission (Idempotency test): should report duplicate without failure
    retry_resp = client.post("/tests/sync-batch", json=batch_payload)
    assert retry_resp.status_code == 200
    retry_data = retry_resp.json()
    assert retry_data["processed"] == 2
    assert retry_data["failed"] == 0
    assert retry_data["sync_results"][0]["status"] == "duplicate"
