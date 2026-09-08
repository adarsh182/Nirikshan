import os
import uuid
from pathlib import Path

from app.config import settings


def ensure_upload_dir() -> Path:
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


def save_image(image_bytes: bytes, extension: str = ".jpg") -> str:
    upload_dir = ensure_upload_dir()
    filename = f"{uuid.uuid4()}{extension}"
    filepath = upload_dir / filename
    filepath.write_bytes(image_bytes)
    return str(filepath)


def get_image_path(relative_or_absolute: str) -> Path:
    return Path(relative_or_absolute)


def read_image(path: str) -> bytes:
    return Path(path).read_bytes()


def image_exists(path: str) -> bool:
    return Path(path).is_file()
