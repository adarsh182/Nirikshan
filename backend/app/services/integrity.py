import hashlib
import hmac
import json
from datetime import datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.config import settings

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        return None


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def build_record_payload(
    record_id: str,
    operator_id: str,
    kit_type_id: str,
    result: str,
    captured_at: datetime,
    latitude: float,
    longitude: float,
    image_hash: str,
    location_source: str = "gps_hardware",
    location_verified: bool = True,
    location_accuracy_m: float | None = None,
) -> dict[str, Any]:
    return {
        "id": record_id,
        "operator_id": operator_id,
        "kit_type_id": kit_type_id,
        "result": result,
        "captured_at": captured_at.isoformat(),
        "latitude": latitude,
        "longitude": longitude,
        "image_hash": image_hash,
        "location_source": location_source,
        "location_verified": location_verified,
        "location_accuracy_m": location_accuracy_m,
    }


def compute_record_hash(payload: dict[str, Any]) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def sign_record(record_hash: str) -> str:
    return hmac.new(
        settings.signing_secret.encode("utf-8"),
        record_hash.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def verify_signature(record_hash: str, signature: str) -> bool:
    expected = sign_record(record_hash)
    return hmac.compare_digest(expected, signature)
