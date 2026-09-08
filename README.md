# Field Drug Test Companion

Digital companion for colorimetric field drug testing. Captures test result images with reference-card calibration, classifies outcomes automatically, and generates tamper-evident digital records.

**Important:** Output is a presumptive field-test result. Laboratory confirmatory testing is required.

## Architecture

- **Mobile** (`mobile/`) — Expo React Native app for capture, GPS, and on-site classification
- **Backend** (`backend/`) — FastAPI API with OpenCV classification, HMAC signing, SQLite storage
- **Web** (`web/`) — React dashboard for searchable test logs and integrity verification

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python scripts/seed.py
python scripts/train_ml.py   # optional: enables hybrid ML classification
uvicorn app.main:app --reload --port 8000
```

### 2. Web Dashboard

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173 — login with your officer credentials

### 3. Mobile App

```bash
cd mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (e.g. `http://192.168.1.5:8000`) for physical device testing.

## Default Credentials

| Badge ID | Password | Role |
|---|---|---|
| OFF-001 | ******** | Officer |
| OFF-002 | ******** | Supervisor |

## Kit Types (Seeded)

- **Marquis** — purple/violet = positive, orange/yellow = negative
- **Mecke** — blue-green = positive, yellow/orange = negative

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Operator login |
| GET | `/kits` | List kit types |
| POST | `/tests` | Upload image + metadata → classify + sign |
| GET | `/tests` | Searchable test log |
| GET | `/tests/{id}` | Test detail |
| GET | `/tests/{id}/verify` | Integrity verification |
| GET | `/tests/{id}/image` | Captured image |

## Tamper-Evident Records

Each test record includes:

- UTC timestamp + device timestamp
- GPS coordinates + accuracy
- Operator badge ID
- SHA-256 hash of the captured image
- HMAC-SHA256 signature of the canonical record payload

Verify via web dashboard or `GET /tests/{id}/verify`.

## Reference Color Card

See [docs/reference-card.md](docs/reference-card.md) for printable card specifications.

## Hybrid Classification

Phase 1 uses rule-based LAB color analysis with reference-card calibration. Enable ML hybrid mode:

```bash
# In backend/.env
ML_ENABLED=true
```

Requires running `python scripts/train_ml.py` first.

## Project Structure

```
field-test-companion/
├── backend/          FastAPI + OpenCV + SQLAlchemy
├── mobile/           Expo React Native
├── web/              React + Vite dashboard
├── docs/             Reference card spec
└── README.md
```
