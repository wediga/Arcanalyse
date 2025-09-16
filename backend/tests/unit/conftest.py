# backend/tests/unit/conftest.py
from __future__ import annotations

import pytest


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    # sorgt dafür, dass @pytest.mark.anyio-Tests nicht auf 'trio' parametrisiert werden
    return "asyncio"
