# backend/app/schemas/lookups.py
from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict

# ---------------------------------------------------------------------------
# Gemeinsame Basisklassen für Lookups (override von Timestamps -> optional)
# ---------------------------------------------------------------------------


class LookupRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    name: str


# ---------------------------------------------------------------------------
# Generische Lookup-Read-Schemas (id, code, name)
# ---------------------------------------------------------------------------


class ACTypeRead(LookupRead):  # id, code, name, created_at?, updated_at?
    pass


class SizeRead(LookupRead):
    pass


class CreatureTypeRead(LookupRead):
    pass


class AlignmentRead(LookupRead):
    pass


class DamageTypeRead(LookupRead):
    pass


class ConditionTypeRead(LookupRead):
    pass


class SpeedTypeRead(LookupRead):
    pass


class SenseTypeRead(LookupRead):
    pass


class LanguageRead(LookupRead):
    pass


class EnvironmentRead(LookupRead):
    pass


class TagRead(LookupRead):
    pass


class SkillRead(LookupRead):
    pass


class AbilityRead(LookupRead):
    pass


# ---------------------------------------------------------------------------
# Source (abweichende Felder)
# ---------------------------------------------------------------------------


class SourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    title: str
    abbrev: str | None = None
    release_year: int | None = None
    publisher: str | None = None


# ---------------------------------------------------------------------------
# CR -> XP (PK = challenge_rating, kein "id")
# ---------------------------------------------------------------------------


class CRToXPRead(BaseModel):
    challenge_rating: Decimal
    xp: int

    model_config = ConfigDict(from_attributes=True)
