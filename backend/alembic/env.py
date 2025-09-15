# backend/alembic/env.py
from __future__ import annotations

import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import MetaData, pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlmodel import SQLModel

from alembic import context

# ---------------------------------------------------------------------
# Sys.path so that `import app...` works when running from backend/
# ---------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parents[1]  # .../backend
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Settings (liefert DATABASE_URL)
from app.core.config import get_settings  # noqa: E402

# Logging aus alembic.ini
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------------------------------------------------------------------
# WICHTIG: Modelle importieren, damit SQLModel.metadata befüllt ist
# Dein app/models/__init__.py importiert alle Submodule automatisch.
# ---------------------------------------------------------------------
import app.models  # noqa: F401, E402

# Debug (einmalig, hilft beim Troubleshooting)
print("[ALEMBIC] tables:", sorted(SQLModel.metadata.tables.keys()))

# Alembic-Target-Metadata
target_metadata: MetaData | None = SQLModel.metadata


def get_url() -> str:
    x = context.get_x_argument(as_dictionary=True)
    forced_env = x.get("env")
    if forced_env:
        os.environ["ENVIRONMENT"] = forced_env
    return get_settings().database_url


# ---------------------------------------------------------------------
# Offline migrations (kein DB-Connect)
# ---------------------------------------------------------------------
def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------
# Online migrations (async engine)
# ---------------------------------------------------------------------
def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable: AsyncEngine = create_async_engine(
        get_url(),
        poolclass=pool.NullPool,
        future=True,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


# ---------------------------------------------------------------------
# WICHTIG: Alembic erwartet den Aufruf auf Modulebene (ohne __main__)
# ---------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
