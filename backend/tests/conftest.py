import pytest
from app.database.connection import init_db
from scripts.seed import seed

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    init_db()
    try:
        seed()
    except Exception:
        pass
