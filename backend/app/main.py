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
    title="Field Drug Test Companion API",
    description="Digital companion for colorimetric field drug testing",
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

app.include_router(auth.router)
app.include_router(kits.router)
app.include_router(tests.router)
app.include_router(location.router)


@app.get("/health")
def health():
    return {"status": "ok"}
