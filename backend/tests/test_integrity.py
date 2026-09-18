from datetime import datetime, timezone
import pytest

from app.services.integrity import (
    build_record_payload,
    compute_record_hash,
    create_access_token,
    decode_access_token,
    hash_password,
    sha256_bytes,
    sign_record,
    verify_password,
    verify_signature,
)


def test_password_hashing():
    raw = "officer-secure-pass"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong-pass", hashed) is False


def test_jwt_token_lifecycle():
    data = {"sub": "op-123", "badge_id": "OFF-001"}
    token = create_access_token(data)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "op-123"
    assert decoded["badge_id"] == "OFF-001"

    # Invalid token handling
    assert decode_access_token("invalid.token.payload") is None


def test_sha256_bytes():
    data = b"Nirikshan Evidence Sample"
    h = sha256_bytes(data)
    assert len(h) == 64
    assert h == sha256_bytes(data)


def test_record_payload_and_canonical_hash():
    now = datetime.now(timezone.utc)
    payload = build_record_payload(
        record_id="rec-001",
        operator_id="op-001",
        kit_type_id="kit-marquis",
        result="positive",
        captured_at=now,
        latitude=19.0760,
        longitude=72.8777,
        image_hash="a" * 64,
        location_source="gps_hardware",
        location_verified=True,
        location_accuracy_m=12.5,
    )
    rec_hash = compute_record_hash(payload)
    assert len(rec_hash) == 64

    # Determinism: same payload produces same hash
    assert compute_record_hash(payload) == rec_hash


def test_hmac_signing_and_tamper_detection():
    now = datetime.now(timezone.utc)
    payload = build_record_payload(
        record_id="rec-002",
        operator_id="op-001",
        kit_type_id="kit-marquis",
        result="positive",
        captured_at=now,
        latitude=19.0760,
        longitude=72.8777,
        image_hash="b" * 64,
    )
    orig_hash = compute_record_hash(payload)
    signature = sign_record(orig_hash)

    # Valid signature check
    assert verify_signature(orig_hash, signature) is True

    # Tampered result -> hash mismatch
    tampered_payload = payload.copy()
    tampered_payload["result"] = "negative"
    tampered_hash = compute_record_hash(tampered_payload)
    assert tampered_hash != orig_hash

    # Signature verification must fail for altered hash
    assert verify_signature(tampered_hash, signature) is False
