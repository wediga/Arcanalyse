# backend/app/models/lookups.py
from sqlalchemy import Column, SmallInteger, Text
from sqlmodel import Field, SQLModel

# Note:
# - Lookup tables use SmallInt autoincrement PK
# - "code" is unique, machine-readable; "name" is display text
# - No auditing/timestamps on lookups


class ACType(SQLModel, table=True):
    __tablename__ = "ac_type"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class Size(SQLModel, table=True):
    __tablename__ = "size"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class CreatureType(SQLModel, table=True):
    __tablename__ = "creature_type"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class Alignment(SQLModel, table=True):
    __tablename__ = "alignment"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class DamageType(SQLModel, table=True):
    __tablename__ = "damage_type"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class ConditionType(SQLModel, table=True):
    __tablename__ = "condition_type"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class SpeedType(SQLModel, table=True):
    __tablename__ = "speed_type"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class SenseType(SQLModel, table=True):
    __tablename__ = "sense_type"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class Language(SQLModel, table=True):
    __tablename__ = "language"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class Environment(SQLModel, table=True):
    __tablename__ = "environment"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class Tag(SQLModel, table=True):
    __tablename__ = "tag"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class Skill(SQLModel, table=True):
    __tablename__ = "skill"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class Ability(SQLModel, table=True):
    __tablename__ = "ability"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    name: str = Field(sa_column=Column(Text, nullable=False))


class Source(SQLModel, table=True):
    __tablename__ = "source"
    id: int | None = Field(
        default=None,
        sa_column=Column(SmallInteger, primary_key=True, autoincrement=True),
    )
    code: str = Field(sa_column=Column(Text, nullable=False, unique=True))
    title: str = Field(sa_column=Column(Text, nullable=False))
    abbrev: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    release_year: int | None = Field(default=None, sa_column=Column(SmallInteger, nullable=True))
    publisher: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
