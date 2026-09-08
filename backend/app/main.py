from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, kits, location, tests
from app.config import settings
from app.database.connection import init_db
from app.services.storage import ensure_upload_dir


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    ensure_upload_dir()
    try:
        from scripts.seed import seed
        seed()
    except Exception as e:
        print(f"Startup database check: {e}")
    yield


app = FastAPI(
    title="Nirikshan API",
    description="Digital Forensic Companion for Colorimetric Field Drug Testing",
    version="1.0.0",
    lifespan=lifespan,
)

origins = settings.cors_origin_list
allow_all = "*" in origins or not origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=False if allow_all else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Direct routes
app.include_router(auth.router)
app.include_router(kits.router)
app.include_router(tests.router)
app.include_router(location.router)

# Dual-mount with /api prefix for unified single-domain deployment
api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(kits.router)
api_router.include_router(tests.router)
api_router.include_router(location.router)
app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok"}


# Serve production React Web build when packaged into container
web_dist = Path("/app/web_dist")
if not web_dist.exists():
    web_dist = Path(__file__).resolve().parent.parent.parent / "web" / "dist"

if web_dist.exists():
    assets_dir = web_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        target_file = web_dist / full_path
        if full_path and target_file.is_file():
            return FileResponse(target_file)
        index_file = web_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"detail": "Not Found"}

