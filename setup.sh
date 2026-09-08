#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Setting up Field Drug Test Companion ==="

# Backend
echo "Setting up backend..."
cd "$ROOT/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp -n .env.example .env 2>/dev/null || true
python scripts/seed.py
python scripts/train_ml.py
echo "Backend ready."

# Web
echo "Setting up web..."
cd "$ROOT/web"
npm install
echo "Web ready."

# Mobile
echo "Setting up mobile..."
cd "$ROOT/mobile"
npm install
echo "Mobile ready."

echo ""
echo "=== Setup complete ==="
echo "Start backend:  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo "Start web:      cd web && npm run dev"
echo "Start mobile:   cd mobile && npx expo start"
echo "Demo login:     OFF-001 / demo123"
