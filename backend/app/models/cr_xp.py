# backend/app/models/cr_xp.py
from decimal import Decimal

from sqlalchemy import CheckConstraint, Column, Integer, Numeric
from sqlmodel import Field, SQLModel

# Challenge Rating ↔ XP mapping
# - CR is the PRIMARY KEY (Numeric(4,3))
# - XP must be >= 0


class CRToXP(SQLModel, table=True):
    __tablename__ = "cr_to_xp"

    challenge_rating: Decimal = Field(
        sa_column=Column(Numeric(4, 3), primary_key=True, nullable=False)
    )
    xp: int = Field(sa_column=Column(Integer, nullable=False))

    __table_args__ = (CheckConstraint("xp >= 0", name="ck_cr_to_xp_xp_nonneg"),)
