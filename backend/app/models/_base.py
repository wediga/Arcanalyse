# backend/app/models/_base.py
from __future__ import annotations

from datetime import datetime
from typing import Any, cast
from uuid import UUID as PyUUID

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Identity, Text, func, text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.schema import FetchedValue
from sqlmodel import Field, SQLModel

# --- Primary key mixins -------------------------------------------------------


class IntPKMixin(SQLModel):
    """BIGINT identity primary key mixin."""

    id: int | None = Field(
        default=None,
        sa_column=Column(
            BigInteger,
            Identity(always=False),
            primary_key=True,
        ),
    )


class UUIDPKMixin(SQLModel):
    """UUID primary key mixin (requires PostgreSQL pgcrypto)."""

    id: PyUUID | None = Field(
        default=None,
        sa_column=Column(
            PG_UUID(as_uuid=True),
            primary_key=True,
            server_default=text("gen_random_uuid()"),
        ),
    )


# --- Timestamps ---------------------------------------------------------------


class TimestampMixin(SQLModel):
    """Server-managed timestamps using NOW() (timezone-aware)."""

    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),  # INSERT: DB setzt NOW()
        ),
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),  # INSERT
            onupdate=func.now(),  # UPDATE: ORM setzt NOW()
        ),
    )


# --- Audit mixins -------------------------------------------------------------


class ActorAuditMixin(SQLModel):
    """References to the actor who created/updated the row (FK to app_user)."""

    created_by_id: PyUUID | None = Field(
        default=None,
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("app_user.id", ondelete="RESTRICT"),
            nullable=True,
        ),
    )
    updated_by_id: PyUUID | None = Field(
        default=None,
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("app_user.id", ondelete="RESTRICT"),
            nullable=True,
        ),
    )


class SoftDeleteMixin(SQLModel):
    """Optional soft delete timestamp."""

    deleted_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )


# --- Postgres helpers ---------------------------------------------------------


def jsonb_field(*, nullable: bool = True, server_default_empty: bool = False) -> Any:
    """Return a Field backed by a JSONB SQLAlchemy column."""
    server_default: FetchedValue | None = (
        cast(FetchedValue, text("'{}'::jsonb")) if server_default_empty else None
    )
    col: Column[Any] = Column(
        JSONB,
        nullable=nullable,
        server_default=server_default,
    )
    return Field(sa_column=col)


def str_array_field(*, nullable: bool = True) -> Any:
    """Return a Field backed by an ARRAY(TEXT) SQLAlchemy column."""
    col: Column[Any] = Column(ARRAY(Text), nullable=nullable)
    return Field(sa_column=col)
