import re

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health(async_client: AsyncClient) -> None:
    resp = await async_client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_version(async_client: AsyncClient) -> None:
    resp = await async_client.get("/api/v1/version")
    assert resp.status_code == 200
    data = resp.json()
    assert set(data.keys()) == {"name", "version", "env"}
    assert isinstance(data["name"], str)
    assert isinstance(data["env"], str)
    assert re.match(r"^\d+\.\d+\.\d+$", data["version"]) is not None
