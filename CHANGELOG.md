# Changelog — Nirikshan (निरीक्षण)

All notable changes to this project are documented in this file following [Keep a Changelog](https://keepachangelog.com/) guidelines and Semantic Versioning.

---

## [1.1.0] - 2026-09-18

### Added
- **Automated Backend Test Suite**: Added `backend/tests/` with 14 comprehensive unit and integration tests covering password hashing, JWT token lifecycle, canonical JSON payload hashing, HMAC-SHA256 signature verification, tamper detection, offline batch synchronization, `/health` and `/ready` endpoints, and colorimetric calibration (`backend/pytest.ini`).
- **Offline Batch Ingestion**: Implemented `POST /tests/sync-batch` and `/api/tests/sync-batch` in `tests.py` with idempotent client UUID tracking and base64 image commitment.
- **Frontend Error Resilience**: Added `ErrorBoundary.tsx` wrapping the application root in `main.tsx` to gracefully handle UI component exceptions with tactile recovery actions.
- **Observability & Diagnostics**: Added `/health` and `/ready` endpoints to both root and `/api` prefixes, and `X-Process-Time` latency response header middleware in `main.py`.
- **CI/CD Quality Pipeline**: Added GitHub Actions workflow (`.github/workflows/ci.yml`) for automated pytest runs, typechecking, and production web building.
- **Forensic Architecture Decision Record**: Added `docs/adr-001-tamper-evident-records.md` documenting dual-layer cryptographic design (SHA-256 image immutability + HMAC canonical payload signing).
- **Offline Sync Specification**: Added `docs/spec-offline-first-sync.md` specifying disconnected queue, batch sync protocol, and conflict resolution for field officers.
- **Project Quality Contract**: Added `CONSTRAINTS.md` enforcing non-negotiable test, security, latency, and architectural boundaries.
- **AI Agent Context Rules**: Added `AGENTS.md` specifying tech stack, forensic invariants, test commands, and UI rules for AI assistants.
- **Idempotent SQLite Migration**: Added `backend/scripts/migrate_sqlite.py` for safe index verification and schema migration without downtime.
- **A11y ARIA Status**: Added accessible ARIA status and screen-reader labeling to `ResultBadge.tsx`.

### Changed
- **Security & Upload Protection**: Enforced `MAX_IMAGE_SIZE = 15MB` (HTTP 413) upload ceiling, empty-file check, and path-traversal prevention in `tests.py`.
- **Adversarial Precision Hardening**: Updated `build_record_payload()` in `integrity.py` to round GPS latitude/longitude to 6 decimal places and accuracy to 2 decimals, preventing cross-platform IEEE 754 float drift in HMAC calculation.
- **Performance Optimization**: Added database indexes (`index=True`) on `captured_at`, `operator_id`, `kit_type_id`, and `result` columns in `test_record.py`.
- **Standard Library Simplification**: Replaced manual IP prefix logic in `location.py` with standard library `ipaddress.ip_address(client_ip).is_global`.
- **Modern Python 3.12+ Timestamps**: Replaced deprecated `datetime.utcnow()` with `datetime.now(timezone.utc)` across `integrity.py`, `test_record.py`, and `seed.py`.
- **API Parity & Image Serving**: Added `?token=` query parameter authentication in `auth.py` to allow direct forensic photo rendering in HTML `<img>` elements.
- **Quickstart Documentation**: Updated `README.md` with explicit platform commands for macOS (`python3`, `source .venv/bin/activate`) and Windows.

### Removed
- **Dead Code**: Removed unused `_bgr_to_lab` function and `REFERENCE_PATCHES_BGR` constant in `classification.py`.
- **Unused Imports**: Cleaned unused `datetime` and `verify_password` imports in `auth.py`.

---

## [1.0.0] - 2026-09-08
- Initial release with React web dashboard, Expo React Native mobile app, FastAPI backend, OpenCV colorimetric classification, and SQLite evidence storage.
