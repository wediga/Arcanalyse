import os

import psycopg
import pytest


@pytest.fixture(scope="session")
def db_url():
    return os.environ.get(
        "DATABASE_URL_TEST",
        "postgresql://arcanalyse:arcanalyse@localhost:5433/arcanalyse_test",
    )


@pytest.fixture
def db_connection(db_url):
    conn = psycopg.connect(db_url)
    yield conn
    conn.close()
