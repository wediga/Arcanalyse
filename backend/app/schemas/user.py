# backend/app/schemas/user.py
from __future__ import annotations

from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, StringConstraints

PasswordStr = Annotated[str, StringConstraints(min_length=8, max_length=128)]


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    password: PasswordStr


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: str
    created_at: datetime
    updated_at: datetime


class UserPage(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    items: list[UserRead]
    total: int
    limit: int
    offset: int
