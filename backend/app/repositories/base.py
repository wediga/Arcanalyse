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

    async def get(self, id_: Any) -> ModelT | None:
        """
        Fetch a single entity by primary key.

        Args:
            id_: Primary key value.

        Returns:
            The entity or None if not found.
        """
        return await self.session.get(self.model, id_)

    async def list(self, *, limit: int = 50, offset: int = 0) -> Sequence[ModelT]:
        """
        List entities using limit/offset pagination.

        Args:
            limit: Maximum number of rows to return.
            offset: Number of rows to skip.

        Returns:
            A sequence of entities.
        """
        stmt = select(self.model).limit(limit).offset(offset)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def create(self, obj: ModelT) -> ModelT:
        """
        Persist a new entity.

        Args:
            obj: Instance to persist.

        Returns:
            The refreshed entity (with generated fields populated).
        """
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def update(self, obj: ModelT, data: dict[str, Any]) -> ModelT:
        """
        Apply an attribute dict onto an entity and persist.

        Args:
            obj: Instance to update.
            data: Mapping of field names to values (must match model attributes).

        Returns:
            The refreshed entity.
        """
        for key, value in data.items():
            setattr(obj, key, value)
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: ModelT) -> None:
        """
        Delete an entity.

        Args:
            obj: Instance to delete.
        """
        await self.session.delete(obj)
