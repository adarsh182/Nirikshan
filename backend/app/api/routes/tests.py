import json
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.api.routes.auth import get_current_operator
from app.config import settings
from app.database.connection import get_db
from app.models.kit_type import KitType
from app.models.operator import Operator
from app.models.test_record import TestRecord
from app.schemas import (
    DashboardStats,
    TestRecordCreate,
    TestRecordList,
    TestRecordOut,
    VerificationResult,
)
from app.services.classification import classify_image, parse_lab_json
from app.services.integrity import (
    build_record_payload,
    compute_record_hash,
    sha256_bytes,
    sign_record,
    verify_signature,
)
from app.services.ml_classification import hybrid_classify
from app.services.storage import image_exists, read_image, save_image

router = APIRouter(prefix="/tests", tags=["tests"])


def _to_out(record: TestRecord) -> TestRecordOut:
    details = json.loads(record.classification_details) if record.classification_details else None
    return TestRecordOut(
        id=record.id,
        operator_id=record.operator_id,
        kit_type_id=record.kit_type_id,
        kit_type_name=record.kit_type.name if record.kit_type else None,
        operator_name=record.operator.name if record.operator else None,
        operator_badge_id=record.operator.badge_id if record.operator else None,
        result=record.result,
        confidence=record.confidence,
        captured_at=record.captured_at,
        device_captured_at=record.device_captured_at,
        latitude=record.latitude,
        longitude=record.longitude,
        location_accuracy_m=record.location_accuracy_m,
        location_source=getattr(record, "location_source", "gps_hardware") or "gps_hardware",
        location_verified=bool(getattr(record, "location_verified", True)),
        image_hash=record.image_hash,
        record_hash=record.record_hash,
        signature=record.signature,
        classification_details=details,
        notes=record.notes,
        created_at=record.created_at,
    )


@router.post("", response_model=TestRecordOut)
async def create_test(
    db: Annotated[Session, Depends(get_db)],
    operator: Annotated[Operator, Depends(get_current_operator)],
    image: UploadFile = File(...),
    kit_type_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_accuracy_m: float | None = Form(None),
    location_source: str | None = Form(None),
    location_verified: bool | None = Form(None),
    device_captured_at: str | None = Form(None),
    notes: str | None = Form(None),
    roi_x: float | None = Form(None),
    roi_y: float | None = Form(None),
    roi_width: float | None = Form(None),
    roi_height: float | None = Form(None),
    override_result: str | None = Form(None),
) -> TestRecordOut:
    kit = db.query(KitType).filter(KitType.id == kit_type_id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Kit type not found")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image")

    image_hash = sha256_bytes(image_bytes)
    ext = ".jpg" if (image.filename or "").lower().endswith((".jpg", ".jpeg")) else ".png"
    image_path = save_image(image_bytes, ext)

    classification = classify_image(
        image_bytes=image_bytes,
        positive_lab=parse_lab_json(kit.positive_lab),
        negative_lab=parse_lab_json(kit.negative_lab),
        inconclusive_lab=parse_lab_json(kit.inconclusive_lab) if kit.inconclusive_lab else None,
        confidence_threshold=kit.confidence_threshold,
        roi_x=roi_x,
        roi_y=roi_y,
        roi_width=roi_width,
        roi_height=roi_height,
        override_result=override_result,
    )

    result, confidence, details = hybrid_classify(
        rule_result=classification.result,
        rule_confidence=classification.confidence,
        rule_details=classification.details,
        image_bytes=image_bytes,
        ml_enabled=settings.ml_enabled,
    )

    captured_at = datetime.utcnow()
    device_dt = None
    if device_captured_at:
        try:
            device_dt = datetime.fromisoformat(device_captured_at.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            device_dt = None

    # Enforce Location Integrity Guard
    effective_source = location_source or "network_ip_approximate"
    if effective_source == "manual_officer_entry":
        effective_verified = False
    elif effective_source == "gps_hardware":
        effective_verified = location_accuracy_m is not None and location_accuracy_m <= 50.0
        if not effective_verified and location_accuracy_m and location_accuracy_m > 500:
            effective_source = "network_ip_approximate"
    else:
        effective_source = "network_ip_approximate"
        effective_verified = False
        if location_accuracy_m is None or location_accuracy_m < 500:
            location_accuracy_m = 2500.0

    record = TestRecord(
        operator_id=operator.id,
        kit_type_id=kit.id,
        result=result,
        confidence=confidence,
        captured_at=captured_at,
        device_captured_at=device_dt,
        latitude=latitude,
        longitude=longitude,
        location_accuracy_m=location_accuracy_m,
        location_source=effective_source,
        location_verified=effective_verified,
        image_path=image_path,
        image_hash=image_hash,
        record_hash="",
        signature="",
        classification_details=json.dumps(details),
        notes=notes,
    )
    db.add(record)
    db.flush()

    payload = build_record_payload(
        record_id=record.id,
        operator_id=record.operator_id,
        kit_type_id=record.kit_type_id,
        result=record.result,
        captured_at=record.captured_at,
        latitude=record.latitude,
        longitude=record.longitude,
        image_hash=record.image_hash,
        location_source=record.location_source,
        location_verified=record.location_verified,
        location_accuracy_m=record.location_accuracy_m,
    )
    record.record_hash = compute_record_hash(payload)
    record.signature = sign_record(record.record_hash)

    db.commit()
    db.refresh(record)
    record.kit_type = kit
    record.operator = operator
    return _to_out(record)


@router.get("", response_model=TestRecordList)
def list_tests(
    db: Annotated[Session, Depends(get_db)],
    _operator: Annotated[Operator, Depends(get_current_operator)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    result: str | None = None,
    operator_id: str | None = None,
    kit_type_id: str | None = None,
    from_date: datetime | None = Query(None, alias="from"),
    to_date: datetime | None = Query(None, alias="to"),
    q: str | None = None,
) -> TestRecordList:
    query = db.query(TestRecord).options(
        joinedload(TestRecord.operator),
        joinedload(TestRecord.kit_type),
    )

    if result:
        query = query.filter(TestRecord.result == result)
    if operator_id:
        query = query.filter(TestRecord.operator_id == operator_id)
    if kit_type_id:
        query = query.filter(TestRecord.kit_type_id == kit_type_id)
    if from_date:
        query = query.filter(TestRecord.captured_at >= from_date)
    if to_date:
        query = query.filter(TestRecord.captured_at <= to_date)
    if q:
        query = query.join(Operator).join(KitType).filter(
            or_(
                Operator.badge_id.ilike(f"%{q}%"),
                Operator.name.ilike(f"%{q}%"),
                KitType.name.ilike(f"%{q}%"),
                TestRecord.notes.ilike(f"%{q}%"),
            )
        )

    total = query.count()
    items = (
        query.order_by(TestRecord.captured_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return TestRecordList(
        items=[_to_out(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    _operator: Annotated[Operator, Depends(get_current_operator)],
) -> DashboardStats:
    total = db.query(func.count(TestRecord.id)).scalar() or 0
    positive = db.query(func.count(TestRecord.id)).filter(TestRecord.result == "positive").scalar() or 0
    negative = db.query(func.count(TestRecord.id)).filter(TestRecord.result == "negative").scalar() or 0
    inconclusive = db.query(func.count(TestRecord.id)).filter(TestRecord.result == "inconclusive").scalar() or 0
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today = db.query(func.count(TestRecord.id)).filter(TestRecord.captured_at >= today_start).scalar() or 0
    return DashboardStats(
        total_tests=total,
        positive_count=positive,
        negative_count=negative,
        inconclusive_count=inconclusive,
        tests_today=today,
    )


@router.get("/{test_id}", response_model=TestRecordOut)
def get_test(
    test_id: str,
    db: Annotated[Session, Depends(get_db)],
    _operator: Annotated[Operator, Depends(get_current_operator)],
) -> TestRecordOut:
    record = (
        db.query(TestRecord)
        .options(joinedload(TestRecord.operator), joinedload(TestRecord.kit_type))
        .filter(TestRecord.id == test_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Test not found")
    return _to_out(record)


@router.get("/{test_id}/verify", response_model=VerificationResult)
def verify_test(
    test_id: str,
    db: Annotated[Session, Depends(get_db)],
    _operator: Annotated[Operator, Depends(get_current_operator)],
) -> VerificationResult:
    record = db.query(TestRecord).filter(TestRecord.id == test_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Test not found")

    image_hash_match = False
    if image_exists(record.image_path):
        current_hash = sha256_bytes(read_image(record.image_path))
        image_hash_match = current_hash == record.image_hash

    payload = build_record_payload(
        record_id=record.id,
        operator_id=record.operator_id,
        kit_type_id=record.kit_type_id,
        result=record.result,
        captured_at=record.captured_at,
        latitude=record.latitude,
        longitude=record.longitude,
        image_hash=record.image_hash,
        location_source=getattr(record, "location_source", "gps_hardware") or "gps_hardware",
        location_verified=bool(getattr(record, "location_verified", True)),
        location_accuracy_m=record.location_accuracy_m,
    )
    recomputed_hash = compute_record_hash(payload)
    record_hash_match = recomputed_hash == record.record_hash
    signature_valid = verify_signature(record.record_hash, record.signature)
    valid = image_hash_match and record_hash_match and signature_valid

    message = "Record integrity verified" if valid else "Record integrity check failed"
    return VerificationResult(
        valid=valid,
        image_hash_match=image_hash_match,
        record_hash_match=record_hash_match,
        signature_valid=signature_valid,
        message=message,
    )


@router.patch("/{test_id}", response_model=TestRecordOut)
def override_test_result(
    test_id: str,
    db: Annotated[Session, Depends(get_db)],
    operator: Annotated[Operator, Depends(get_current_operator)],
    override_result: str = Form(...),
    notes: str | None = Form(None),
) -> TestRecordOut:
    if override_result not in ("positive", "negative", "inconclusive"):
        raise HTTPException(status_code=400, detail="Invalid result")

    record = (
        db.query(TestRecord)
        .options(joinedload(TestRecord.operator), joinedload(TestRecord.kit_type))
        .filter(TestRecord.id == test_id, TestRecord.operator_id == operator.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Test not found")

    record.result = override_result
    record.confidence = 1.0
    if notes:
        record.notes = notes
    elif not record.notes:
        record.notes = f"Officer override to {override_result}"

    details = json.loads(record.classification_details) if record.classification_details else {}
    details["officer_override"] = override_result
    record.classification_details = json.dumps(details)

    payload = build_record_payload(
        record_id=record.id,
        operator_id=record.operator_id,
        kit_type_id=record.kit_type_id,
        result=record.result,
        captured_at=record.captured_at,
        latitude=record.latitude,
        longitude=record.longitude,
        image_hash=record.image_hash,
        location_source=getattr(record, "location_source", "gps_hardware") or "gps_hardware",
        location_verified=bool(getattr(record, "location_verified", True)),
        location_accuracy_m=record.location_accuracy_m,
    )
    record.record_hash = compute_record_hash(payload)
    record.signature = sign_record(record.record_hash)

    db.commit()
    db.refresh(record)
    return _to_out(record)


@router.get("/{test_id}/image")
def get_test_image(
    test_id: str,
    db: Annotated[Session, Depends(get_db)],
    _operator: Annotated[Operator, Depends(get_current_operator)],
):
    record = db.query(TestRecord).filter(TestRecord.id == test_id).first()
    if not record or not image_exists(record.image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    media = "image/jpeg" if record.image_path.endswith((".jpg", ".jpeg")) else "image/png"
    return FileResponse(record.image_path, media_type=media)
