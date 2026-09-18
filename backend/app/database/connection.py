from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


if settings.database_url.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.models import KitType, Operator, TestRecord  # noqa: F401

    Base.metadata.create_all(bind=engine)

    if settings.database_url.startswith("sqlite"):
        with engine.connect() as conn:
            result = conn.exec_driver_sql("PRAGMA table_info(test_records)")
            existing_cols = {row[1] for row in result.fetchall()}
            if existing_cols:
                col_defs = [
                    ("device_captured_at", "DATETIME"),
                    ("location_accuracy_m", "FLOAT"),
                    ("location_source", "VARCHAR(50) DEFAULT 'gps_hardware'"),
                    ("location_verified", "BOOLEAN DEFAULT 1"),
                ]
                for col_name, col_type in col_defs:
                    if col_name not in existing_cols:
                        conn.exec_driver_sql(f"ALTER TABLE test_records ADD COLUMN {col_name} {col_type}")
                conn.commit()
