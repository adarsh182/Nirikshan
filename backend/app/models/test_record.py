import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class TestRecord(Base):
    __tablename__ = "test_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    operator_id: Mapped[str] = mapped_column(String(36), ForeignKey("operators.id"), index=True)
    kit_type_id: Mapped[str] = mapped_column(String(36), ForeignKey("kit_types.id"), index=True)
    result: Mapped[str] = mapped_column(String(20), index=True)  # positive, negative, inconclusive
    confidence: Mapped[float] = mapped_column(Float)
    captured_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    device_captured_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    location_accuracy_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_source: Mapped[str] = mapped_column(String(50), default="gps_hardware")
    location_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    image_path: Mapped[str] = mapped_column(String(500))
    image_hash: Mapped[str] = mapped_column(String(64))
    record_hash: Mapped[str] = mapped_column(String(64))
    signature: Mapped[str] = mapped_column(String(64))
    classification_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    operator = relationship("Operator", back_populates="test_records")
    kit_type = relationship("KitType", back_populates="test_records")
