from contextlib import asynccontextmanager
from pathlib import Path
import time

from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


origins = settings.cors_origin_list
allow_all = "*" in origins or not origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=False if allow_all else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@api_router.get("/health")
@app.get("/health")
def health():
    return {"status": "ok", "service": "nirikshan-api"}


@api_router.get("/ready")
@app.get("/ready")
def ready():
    return {"status": "ready", "ml_enabled": settings.ml_enabled}


app.include_router(api_router)


# Serve production React Web build when packaged into container
web_dist = Path("/app/web_dist")
if not web_dist.exists():
    web_dist = Path(__file__).resolve().parent.parent.parent / "web" / "dist"

if web_dist.exists():
    assets_dir = web_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon_ico():
        ico = web_dist / "favicon.ico"
        if ico.exists():
            return FileResponse(ico, media_type="image/x-icon", headers={"Cache-Control": "no-cache, must-revalidate"})
        return {"detail": "Not Found"}

    @app.get("/favicon.svg", include_in_schema=False)
    async def favicon_svg():
        svg = web_dist / "favicon.svg"
        if svg.exists():
            return FileResponse(svg, media_type="image/svg+xml", headers={"Cache-Control": "no-cache, must-revalidate"})
        return {"detail": "Not Found"}

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        target_file = web_dist / full_path
        if full_path and target_file.is_file():
            return FileResponse(target_file)
        index_file = web_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"detail": "Not Found"}

