# backend/app/models/enums.py
from __future__ import annotations

from enum import StrEnum  # noqa: E402

from sqlalchemy import Enum as SAEnum  # noqa: E402

"""
Enum utilities:
- String-based Python enums backed by SQLAlchemy Enum with native_enum=False.
  This keeps migrations portable and avoids CREATE TYPE churn in Postgres.
"""


def sa_str_enum(enum_cls: type[StrEnum], *, name: str | None = None) -> SAEnum:
    """
    Build a SQLAlchemy Enum for a Python StrEnum without native DB types.

    Args:
        enum_cls: The StrEnum class.
        name: Optional explicit SQL name for the enum constraint.

    Returns:
        SAEnum: Configured SQLAlchemy Enum (native_enum=False, validated).
    """
    return SAEnum(
        enum_cls,
        name=(name or enum_cls.__name__.lower()),
        native_enum=False,
        create_constraint=True,
        validate_strings=True,
    )
