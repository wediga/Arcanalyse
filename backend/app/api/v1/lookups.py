# backend/app/api/v1/lookups.py
from decimal import Decimal
from typing import Annotated, Any, cast

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

from app.core.db import get_session
from app.models.cr_xp import CRToXP
from app.models.lookups import (
    Ability,
    ACType,
    Alignment,
    ConditionType,
    CreatureType,
    DamageType,
    Environment,
    Language,
    SenseType,
    Size,
    Skill,
    Source,
    SpeedType,
    Tag,
)
from app.repositories.base import Repository
from app.schemas.lookups import (
    AbilityRead,
    ACTypeRead,
    AlignmentRead,
    ConditionTypeRead,
    CreatureTypeRead,
    CRToXPRead,
    DamageTypeRead,
    EnvironmentRead,
    LanguageRead,
    SenseTypeRead,
    SizeRead,
    SkillRead,
    SourceRead,
    SpeedTypeRead,
    TagRead,
)

# ---------------------------------------------------------------------------

router = APIRouter(tags=["lookups"])
SessionDep = Annotated[AsyncSession, Depends(get_session)]

# ---------------------------------------------------------------------------


def register_lookup_routes[
    M: SQLModel
](path: str, model: type[M], read_schema: type[BaseModel]) -> None:
    """Registriert GET list + GET by id für einfache Lookup-Tabellen mit int-PK."""

    async def list_items(
        session: SessionDep,
        limit: int = Query(100, ge=1, le=500),
        offset: int = Query(0, ge=0),
    ) -> list[Any]:
        repo: Repository[M] = Repository(session=session, model=model)
        items = await repo.list(limit=limit, offset=offset)
        return list(items)

    async def get_item(
        item_id: int,
        session: SessionDep,
    ) -> Any:
        repo: Repository[M] = Repository(session=session, model=model)
        obj = await repo.get(item_id)
        if obj is None:
            raise HTTPException(status_code=404, detail="Not found")
        return obj

    router.add_api_route(
        f"/{path}",
        list_items,
        methods=["GET"],
        response_model=cast(Any, list)[read_schema],
    )
    router.add_api_route(
        f"/{path}" + "/{item_id:int}",
        get_item,
        methods=["GET"],
        response_model=read_schema,
    )


# Int-PK Lookups
register_lookup_routes("ac-types", ACType, ACTypeRead)
register_lookup_routes("sizes", Size, SizeRead)
register_lookup_routes("creature-types", CreatureType, CreatureTypeRead)
register_lookup_routes("alignments", Alignment, AlignmentRead)
register_lookup_routes("damage-types", DamageType, DamageTypeRead)
register_lookup_routes("condition-types", ConditionType, ConditionTypeRead)
register_lookup_routes("speed-types", SpeedType, SpeedTypeRead)
register_lookup_routes("sense-types", SenseType, SenseTypeRead)
register_lookup_routes("languages", Language, LanguageRead)
register_lookup_routes("environments", Environment, EnvironmentRead)
register_lookup_routes("tags", Tag, TagRead)
register_lookup_routes("skills", Skill, SkillRead)
register_lookup_routes("abilities", Ability, AbilityRead)
register_lookup_routes("sources", Source, SourceRead)

# ---------------------------------------------------------------------------


@router.get("/cr-to-xp", response_model=list[CRToXPRead])
async def list_cr_to_xp(
    session: SessionDep,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> list[Any]:
    repo: Repository[CRToXP] = Repository(session=session, model=CRToXP)
    items = await repo.list(limit=limit, offset=offset)
    return list(items)


@router.get("/cr-to-xp/{cr}", response_model=CRToXPRead)
async def get_cr_to_xp(
    cr: Decimal,
    session: SessionDep,
) -> Any:
    repo: Repository[CRToXP] = Repository(session=session, model=CRToXP)
    obj = await repo.get(cr)
    if obj is None:
        raise HTTPException(status_code=404, detail="Not found")
    return obj
