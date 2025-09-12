# backend/app/schemas/base.py
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

"""
Pydantic schema bases:
- CreateSchema / UpdateSchema forbid unknown fields.
- ReadSchema includes id and timestamps; supports ORM mode.
"""


class CreateSchema(BaseModel):
    """Base for create payloads."""

    model_config = ConfigDict(extra="forbid")


class UpdateSchema(BaseModel):
    """Base for partial updates (all fields optional)."""

    model_config = ConfigDict(extra="forbid")


class ReadSchema(BaseModel):
    """Base for read models including identity and audit fields."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
