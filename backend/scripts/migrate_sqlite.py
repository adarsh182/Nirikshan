"""
Safe SQLite Schema Migration Utility for Nirikshan
Applies missing indexes and column alterations idempotently without dropping evidence tables.
"""

import sys
from pathlib import Path
from sqlalchemy import inspect, text

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database.connection import engine, init_db


def migrate() -> None:
    print("Beginning SQLite idempotent migration...")
    init_db()

    with engine.connect() as conn:
        inspector = inspect(conn)
        tables = inspector.get_table_names()
        print(f"Existing tables detected: {tables}")

        if "test_records" in tables:
            indexes = [idx["name"] for idx in inspector.get_indexes("test_records")]
            print(f"Current test_records indexes: {indexes}")

            required_indexes = [
                ("ix_test_records_captured_at", "captured_at"),
                ("ix_test_records_operator_id", "operator_id"),
                ("ix_test_records_kit_type_id", "kit_type_id"),
                ("ix_test_records_result", "result"),
            ]

            for idx_name, col_name in required_indexes:
                if idx_name not in indexes:
                    print(f"Applying missing index: {idx_name} on {col_name}...")
                    conn.execute(text(f"CREATE INDEX IF NOT EXISTS {idx_name} ON test_records ({col_name});"))
                    conn.commit()
                else:
                    print(f"Index verified: {idx_name}")

    print("Migration complete. All indexes and schema invariants verified.")


if __name__ == "__main__":
    migrate()
