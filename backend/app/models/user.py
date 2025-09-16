# backend/app/models/user.py
from __future__ import annotations

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import TEXT
from sqlmodel import Field, SQLModel

from ._base import ActorAuditMixin, SoftDeleteMixin, TimestampMixin, UUIDPKMixin


class AppUser(UUIDPKMixin, TimestampMixin, ActorAuditMixin, SoftDeleteMixin, SQLModel, table=True):
    __tablename__ = "app_user"

    # Credentials
    email: str = Field(sa_column=Column(TEXT, nullable=False))
    password_hash: str = Field(sa_column=Column(TEXT, nullable=False))
