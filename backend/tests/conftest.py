from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from app.main import create_app
from asgi_lifespan import LifespanManager
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session")
def test_app() -> FastAPI:
    return create_app()


@pytest_asyncio.fixture
async def async_client(test_app: FastAPI) -> AsyncGenerator[AsyncClient, Any]:
    # Ensure FastAPI lifespan events run independently of httpx version quirks
    async with LifespanManager(test_app):
        transport = ASGITransport(app=test_app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client
