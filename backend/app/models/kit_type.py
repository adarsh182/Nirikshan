import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class KitType(Base):
    __tablename__ = "kit_types"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    positive_lab: Mapped[str] = mapped_column(Text)  # JSON: {"L": x, "a": y, "b": z}
    negative_lab: Mapped[str] = mapped_column(Text)
    inconclusive_lab: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence_threshold: Mapped[float] = mapped_column(Float, default=0.55)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    test_records = relationship("TestRecord", back_populates="kit_type")
