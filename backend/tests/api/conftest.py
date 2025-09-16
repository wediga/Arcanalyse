from __future__ import annotations

import asyncio
import os
from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from asgi_lifespan import LifespanManager
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.main import create_app
from app.seeds.system_user import seed_system_user


@pytest.fixture(scope="session")
def app() -> FastAPI:
    # Eine einzige App-Instanz für alle API-Tests
    return create_app()


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    # Pin auf asyncio, damit kein trio benötigt wird
    return "asyncio"


RUN_SEED = os.getenv("SEED_SYSTEM_USER", "0") == "1"


@pytest.fixture(scope="session", autouse=RUN_SEED)
def _seed_system_user_once() -> None:
    """Seedet den System-User einmal pro Test-Session (idempotent)."""
    settings = get_settings()
    engine = create_async_engine(settings.database_url, pool_pre_ping=True, future=True)
    Session = async_sessionmaker[AsyncSession](engine, expire_on_commit=False, autoflush=False)

    async def _run() -> None:
        async with Session() as session:
            await seed_system_user(session)
        await engine.dispose()

    asyncio.get_event_loop().run_until_complete(_run())


class _PerRequestClient:
    """Erzeugt für JEDEN Request einen neuen AsyncClient + Transport.
    Lifespan wird stabil pro Request geöffnet/geschlossen.
    => Keine 'NoneType.send'-Fehler mehr und keine Linter-Warnungen.
    """

    def __init__(self, app: FastAPI) -> None:
        self.app = app

    async def _request(self, method: str, url: str, **kwargs: Any):
        async with LifespanManager(self.app):
            transport = ASGITransport(app=self.app)
            async with AsyncClient(transport=transport, base_url="http://test") as c:
                return await c.request(method, url, **kwargs)

    async def get(self, url: str, **kwargs: Any):
        return await self._request("GET", url, **kwargs)

    async def post(self, url: str, **kwargs: Any):
        return await self._request("POST", url, **kwargs)


@pytest_asyncio.fixture
async def client(app: FastAPI) -> AsyncGenerator[_PerRequestClient, None]:
    yield _PerRequestClient(app)


# Alias für bestehende Tests
@pytest_asyncio.fixture
async def async_client(client: _PerRequestClient) -> AsyncGenerator[_PerRequestClient, None]:
    yield client
