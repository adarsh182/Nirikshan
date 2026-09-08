from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    badge_id: str
    password: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    operator_id: str
    badge_id: str
    name: str


class OperatorOut(BaseModel):
    id: str
    badge_id: str
    name: str
    role: str

    model_config = {"from_attributes": True}


class KitTypeOut(BaseModel):
    id: str
    name: str
    description: str | None
    confidence_threshold: float

    model_config = {"from_attributes": True}


class ClassificationDetails(BaseModel):
    reference_card_detected: bool
    dominant_lab: dict[str, float]
    positive_distance: float
    negative_distance: float
    method: str
    ml_result: str | None = None
    ml_confidence: float | None = None
    corrected_swatch_rgb: list[int] | None = None


class TestRecordCreate(BaseModel):
    kit_type_id: str
    latitude: float
    longitude: float
    location_accuracy_m: float | None = None
    location_source: str | None = None
    location_verified: bool | None = None
    device_captured_at: datetime | None = None
    notes: str | None = None
    roi_x: float | None = Field(default=None, ge=0, le=1)
    roi_y: float | None = Field(default=None, ge=0, le=1)
    roi_width: float | None = Field(default=None, ge=0, le=1)
    roi_height: float | None = Field(default=None, ge=0, le=1)
    override_result: str | None = None


class TestRecordOut(BaseModel):
    id: str
    operator_id: str
    kit_type_id: str
    kit_type_name: str | None = None
    operator_name: str | None = None
    operator_badge_id: str | None = None
    result: str
    confidence: float
    captured_at: datetime
    device_captured_at: datetime | None
    latitude: float
    longitude: float
    location_accuracy_m: float | None
    location_source: str = "gps_hardware"
    location_verified: bool = True
    image_hash: str
    record_hash: str
    signature: str
    classification_details: dict[str, Any] | None = None
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TestRecordList(BaseModel):
    items: list[TestRecordOut]
    total: int
    page: int
    page_size: int


class VerificationResult(BaseModel):
    valid: bool
    image_hash_match: bool
    record_hash_match: bool
    signature_valid: bool
    message: str


class DashboardStats(BaseModel):
    total_tests: int
    positive_count: int
    negative_count: int
    inconclusive_count: int
    tests_today: int
