# Production Deployment Guide: Field Drug Test Companion

Complete guide for deploying the **Digital Companion for Field Drug Testing** using **Railway**, **Fly.io**, or **Docker Compose**.

---

## Architecture Overview

| Component | Technology | Dockerfile | Default Port | Storage Requirement |
|---|---|---|---|---|
| **Backend API** | FastAPI + OpenCV + SQLite/Postgres | `backend/Dockerfile` | `8000` | Persistent Volume (`/app/data` or `/app/uploads`) |
| **Web Dashboard** | React 19 + Vite + Nginx Alpine | `web/Dockerfile` | `80` (mapped to `5173` or domain) | Stateless |
| **Mobile App** | Expo React Native | `mobile/` | EAS Build / Expo Go | Points to Backend URL |

---

## Option 1: Deploy on Railway (Fastest & Simplest)

Railway allows deploying both the FastAPI backend and React frontend directly from your GitHub repository in a single project.

### Step 1: Push Code to GitHub
Ensure your local branch is committed and pushed to GitHub:
```bash
git add .
git commit -m "feat: add production Dockerfiles and deployment descriptors"
git push origin main
```

---

### Step 2: Deploy Backend Service on Railway
1. Log in to [Railway.app](https://railway.app).
2. Click **+ New Project** → **Deploy from GitHub repo** → Select your repository (`SIH_NEXT`).
3. Click the newly created service card:
   - Go to **Settings** → **Service Name**: Rename to `fieldtest-backend`.
   - Under **General** → **Root Directory**: Set to `/backend`.
   - Railway will automatically detect `backend/Dockerfile`.
4. Go to **Variables** tab and add:
   ```env
   PORT=8000
   CORS_ORIGINS=*
   DATABASE_URL=sqlite:///./fieldtest.db
   JWT_SECRET=generate-a-strong-random-secret-here-12345
   SIGNING_SECRET=generate-a-strong-hmac-secret-here-67890
   ```
5. *(Optional for persistence)*: Go to **Settings** → **Volumes** → **Add Volume**:
   - Mount path: `/app/uploads`
6. Go to **Settings** → **Networking** → Click **Generate Domain**.
   - Note your public backend URL (e.g., `https://fieldtest-backend-production.up.railway.app`).
   - Test in your browser: `https://fieldtest-backend-production.up.railway.app/health` → `{"status": "ok"}`.

---

### Step 3: Deploy Web Dashboard Service on Railway
1. Inside the **same Railway project**, click **+ New** → **GitHub Repo** → Select the same repository (`SIH_NEXT`).
2. Click the new service card:
   - Go to **Settings** → **Service Name**: Rename to `fieldtest-web`.
   - Under **General** → **Root Directory**: Set to `/web`.
   - Railway will automatically detect `web/Dockerfile`.
3. Go to **Variables** tab and add:
   ```env
   PORT=80
   VITE_API_URL=https://fieldtest-backend-production.up.railway.app
   ```
   *(Replace with your actual backend URL from Step 2)*.
4. Go to **Settings** → **Networking** → Click **Generate Domain**.
   - Your web dashboard is now live! Open the URL in any browser.

---

## Option 2: Deploy on Fly.io

Fly.io provides global edge deployment with persistent NVMe volumes.

### Prerequisites
Install the Fly CLI:
- **macOS**: `brew install flyctl`
- **Linux/Windows**: `curl -L https://fly.io/install.sh | sh`
- Authenticate: `fly auth login`

---

### Step 1: Deploy Backend to Fly.io
```bash
cd backend

# Initialize Fly app (press enter to keep name or choose unique name)
fly launch --no-deploy

# Create persistent storage volume for SQLite & test evidence images (1GB)
fly volumes create fieldtest_data --region bom --size 1

# Set production secrets
fly secrets set JWT_SECRET="strong-secret-key-xyz" SIGNING_SECRET="hmac-key-abc"

# Deploy backend
fly deploy
```
Verify the backend:
```bash
curl https://fieldtest-backend.fly.dev/health
# Response: {"status":"ok"}
```

---

### Step 2: Deploy Web Dashboard to Fly.io
```bash
cd ../web

# Launch web app passing the backend URL as a build argument
fly launch --no-deploy

# Deploy with backend API target
fly deploy --build-arg VITE_API_URL="https://fieldtest-backend.fly.dev"
```
Open your live dashboard:
```bash
fly open
```

---

## Option 3: Deploy with Docker Compose (VPS / Server)

If deploying to an Ubuntu/Debian VPS (e.g. DigitalOcean Droplet, AWS EC2, Linode, or Hetzner):

1. Clone repository to server:
   ```bash
   git clone <your-repo-url> /opt/fieldtest
   cd /opt/fieldtest
   ```
2. Run single-command start:
   ```bash
   docker compose up -d --build
   ```
3. Check status:
   ```bash
   docker compose ps
   docker compose logs -f
   ```
4. Access:
   - Web Dashboard: `http://<SERVER_IP>:5173`
   - Backend API Docs: `http://<SERVER_IP>:8000/docs`

---

## Post-Deployment Verification Checklist

Once deployed, verify all critical components:

- [ ] **Health Check**: `GET /health` returns `{"status":"ok"}`.
- [ ] **Operator Roster**: Open Web Dashboard → Login screen loads seeded officers without password prompts.
- [ ] **Capture Flow**: Select officer → Capture → Enter test → Verify color swatch analysis.
- [ ] **Evidence Dossier**: Verify newly submitted test shows:
  - Canonical record hash
  - HMAC-SHA256 digital signature
  - Tamper-evident badge
- [ ] **Verification Endpoint**: `GET /tests/{id}/verify` returns `{"verified": true}`.
