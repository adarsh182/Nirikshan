# Specification: Offline-First Field Evidence Sync (Nirikshan Mobile)

## Status: Proposed
## Capability ID: `offline-sync`
## Target Consumers: Field Law Enforcement Officers in Remote Jurisdictions

---

## 1. Problem Statement
Narcotics interdiction operations frequently occur in remote border outposts, transit corridors, or maritime checkpoints with zero cellular or network connectivity. Officers need to:
1. Photograph and calibrate field reagent tests offline.
2. Generate local cryptographically signed records with cached device keys.
3. Queue records locally on the mobile device.
4. Automatically reconcile and sync records to the central Nirikshan server upon network re-establishment without data loss, duplicate records, or chain-of-custody disruption.

---

## 2. Architecture & Data Flow

```
[Camera + Card Calibration]
           │
           ▼
[Local SQLite Mobile Queue] ──(Generates local UUID & Device Timestamp)
           │
     (Network Online?)
      ├── No  ──> Persist state: "pending_sync"
      └── Yes ──> Stream to POST /api/tests/sync-batch
                       │
                       ▼
            [FastAPI Backend Batch Ingestion]
                       │
             (Verify Image SHA-256 + HMAC)
                       │
            [Central SQLite/Postgres Persistence]
                       │
                       ▼
            [Return Sync Acknowledgement & Server Timestamps]
```

---

## 3. Data Contract: Sync Batch Payload

### Request: `POST /api/tests/sync-batch`
```json
{
  "device_id": "MBL-EXP-0882",
  "operator_id": "op-001",
  "records": [
    {
      "client_record_id": "e7b9148d-294b-4860-93cb-77b3112d09bb",
      "kit_type_id": "kit-marquis",
      "result": "positive",
      "confidence": 0.88,
      "device_captured_at": "2026-09-18T16:45:00.000Z",
      "latitude": 18.9220,
      "longitude": 72.8346,
      "location_accuracy_m": 8.5,
      "location_source": "gps_hardware",
      "location_verified": true,
      "image_base64": "...",
      "notes": "Seized sample near checkpoint Alpha"
    }
  ]
}
```

### Response: `200 OK`
```json
{
  "processed": 1,
  "failed": 0,
  "sync_results": [
    {
      "client_record_id": "e7b9148d-294b-4860-93cb-77b3112d09bb",
      "server_record_id": "rec-018f600d-9d0e-476d-a88b",
      "status": "synced",
      "signature": "3f98a287c88b0a51...",
      "message": "Verified and committed to chain of custody"
    }
  ]
}
```

---

## 4. Conflict Resolution & Chain of Custody Invariants
1. **Idempotence**: `client_record_id` is unique. If a mobile device re-transmits the batch due to a dropped connection, the backend acknowledges the already-created record without creating duplicates.
2. **Dual Timestamps**: `device_captured_at` records physical field capture time; `captured_at` (server timestamp) records receipt time. Both are cryptographically sealed in the canonical hash.
3. **Audit Log**: Any clock-skew exceeding 1 hour flags an administrative review notice on the Supervisor Dashboard.
