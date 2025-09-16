# backend/app/seed/system_user.py
from __future__ import annotations

from dataclasses import dataclass
from secrets import choice
from string import ascii_letters, digits
from typing import cast
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.models.user import AppUser
from app.services.password_service import password_service

SYSTEM_USER_ID_STR = "00000000-0000-0000-0000-000000000001"
SYSTEM_USER_EMAIL = "system@encounterplanner.local"


@dataclass(frozen=True)
class SeedResult:
    created: bool
    user_id: str
    email: str


def _random_password(length: int = 32) -> str:
    alphabet = ascii_letters + digits
    return "".join(choice(alphabet) for _ in range(length))


async def seed_system_user(session: AsyncSession) -> SeedResult:
    """
    Idempotenter Seeder für den System-User.
    Workaround für Self-FKs: Insert mit NULL-FKs, danach Self-Update auf die eigene ID.
    """
    system_uuid = UUID(SYSTEM_USER_ID_STR)
    email_norm = SYSTEM_USER_EMAIL  # bereits lowercase

    # 1) Existenz prüfen (per PK, danach per CI-E-Mail)
    existing = await session.get(AppUser, system_uuid)
    if existing is None:
        table = AppUser.__table__
        email_col = cast(sa.ColumnElement[str], table.c.email)
        cond_email = cast(
            sa.ColumnElement[bool],
            sa.func.lower(email_col) == sa.literal(email_norm),
        )
        stmt = sa.select(AppUser).where(cond_email).limit(1)
        existing = (await session.execute(stmt)).scalar_one_or_none()

    if existing is not None:
        # Audit-Self-FKs sicherstellen (idempotent)
        changed = False
        if getattr(existing, "created_by_id", None) != existing.id:
            existing.created_by_id = existing.id
            changed = True
        if getattr(existing, "updated_by_id", None) != existing.id:
            existing.updated_by_id = existing.id
            changed = True
        if changed:
            await session.flush()
            await session.commit()
        return SeedResult(created=False, user_id=str(existing.id), email=existing.email)

    # 2) Einfügen mit NULL in den Self-FKs
    raw_password = _random_password(32)  # nur Vollständigkeit; kein Login vorgesehen
    pwd_hash = password_service.hash(raw_password)

    sys_user = AppUser(
        id=system_uuid,
        email=email_norm,
        password_hash=pwd_hash,
        created_by_id=None,
        updated_by_id=None,
    )
    session.add(sys_user)
    await session.flush()  # Row existiert nun, ID ist gesetzt

    # 3) Self-Update der Audit-Felder
    sys_user.created_by_id = sys_user.id
    sys_user.updated_by_id = sys_user.id
    await session.flush()
    await session.commit()

    return SeedResult(created=True, user_id=str(sys_user.id), email=sys_user.email)


# ---- CLI entrypoint ----------------------------------------------------------


async def _run() -> None:
    settings = get_settings()
    engine = create_async_engine(settings.database_url, pool_pre_ping=True, future=True)
    Session = async_sessionmaker(engine, expire_on_commit=False, autoflush=False)
    async with Session() as session:
        result = await seed_system_user(session)
        print(
            f"[seed] system user: created={result.created} id={result.user_id} email={result.email}"
        )


if __name__ == "__main__":
    import asyncio

    asyncio.run(_run())
