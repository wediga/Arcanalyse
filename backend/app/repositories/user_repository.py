# backend/app/repositories/user_repository.py (Ausschnitt)
from __future__ import annotations

from datetime import datetime
from typing import Any, cast

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import AppUser
from .base import Repository


class UserRepository(Repository[AppUser]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=AppUser)

    async def get_by_email_ci(self, email: str) -> AppUser | None:
        """Return user by email (case-insensitive), excluding soft-deleted rows."""
        table = cast(Any, AppUser.__table__)
        email_col = cast(sa.ColumnElement[str], table.c.email)

        email_lower: str = email.lower()
        cond_email = cast(
            sa.ColumnElement[bool],
            sa.func.lower(email_col) == sa.literal(email_lower),
        )

        stmt = sa.select(AppUser).where(cond_email)

        if "deleted_at" in table.c:
            deleted_col = cast(sa.ColumnElement[datetime | None], table.c.deleted_at)
            stmt = stmt.where(deleted_col.is_(None))

        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()
