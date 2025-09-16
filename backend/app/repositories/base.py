# backend/app/repositories/base.py
from __future__ import annotations

from collections.abc import Sequence
from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

"""
Repository base:
- Thin data-access layer with async SQLAlchemy operations.
- No business logic and no transaction boundaries (commit handled by caller).
"""

ModelT = TypeVar("ModelT", bound=SQLModel)


class Repository[ModelT: SQLModel]:
    """Generic repository for a single SQLModel entity."""

    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        """
        Initialize repository.

        Args:
            session: Async SQLAlchemy session.
            model: SQLModel class managed by this repository.
        """
        self.session = session
        self.model = model

    # ---- internal -------------------------------------------------------------

    def _apply_not_deleted_filter(self, stmt):
        """
        Apply `deleted_at IS NULL` if the model has a `deleted_at` column.
        Lookups (ohne Soft-Delete) bleiben unverändert.
        """
        deleted_attr = getattr(self.model, "deleted_at", None)
        if deleted_attr is not None:
            stmt = stmt.where(deleted_attr.is_(None))
        return stmt

    # ---- CRUD ----------------------------------------------------------------

    async def get(self, id_: Any) -> ModelT | None:
        """
        Fetch a single entity by primary key.
        If the model supports soft-delete and the row is deleted, returns None.
        """
        obj = await self.session.get(self.model, id_)
        if obj is None:
            return None
        # Soft-delete guard at instance level
        if hasattr(obj, "deleted_at") and obj.deleted_at is not None:
            return None
        return obj

    async def list(self, *, limit: int = 50, offset: int = 0) -> Sequence[ModelT]:
        """
        List entities using limit/offset pagination.
        Applies soft-delete filter if present on the model.
        """
        stmt = select(self.model).limit(limit).offset(offset)
        stmt = self._apply_not_deleted_filter(stmt)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def create(self, obj: ModelT) -> ModelT:
        """
        Persist a new entity. Caller commits.
        """
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def update(self, obj: ModelT, data: dict[str, Any]) -> ModelT:
        """
        Apply attribute dict onto an entity and persist. Caller commits.
        """
        for key, value in data.items():
            setattr(obj, key, value)
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: ModelT) -> None:
        """
        Delete an entity (hard delete). Caller commits.
        """
        await self.session.delete(obj)
