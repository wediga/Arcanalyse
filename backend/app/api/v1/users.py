# backend/app/api/v1/users.py
from __future__ import annotations

from typing import Annotated, Literal
from uuid import UUID

import sqlalchemy as sa
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.db import get_session
from ...models.user import AppUser
from ...repositories.user_repository import UserRepository
from ...schemas.user import UserCreate, UserPage, UserRead
from ...services.password_service import password_service

# Optional: feinere Erkennung von Unique-Violations (psycopg)
try:
    from psycopg.errors import UniqueViolation  # type: ignore[attr-defined]
except Exception:  # pragma: no cover
    UniqueViolation = None  # type: ignore[assignment]

router = APIRouter(prefix="/users", tags=["users"])

DEFAULT_LIMIT = 50
MAX_LIMIT = 200


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=UserRead,
    summary="Create a new user",
    description=(
        "Legt einen neuen Benutzer an. "
        "E-Mail wird in Kleinbuchstaben normalisiert, das Passwort mit Argon2id gehasht. "
        "Bei bereits existierender E-Mail (case-insensitive) wird **409 Conflict** zurückgegeben."
    ),
)
async def create_user(
    payload: UserCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    actor_id: Annotated[UUID | None, Header(alias="X-Actor-Id")] = None,
) -> UserRead:
    # 1) Normalisieren
    email_norm = str(payload.email).lower()
    # 2) Hashen
    pwd_hash = password_service.hash(payload.password)

    # 3) Entity bauen (Audit by actor, falls vorhanden)
    entity = AppUser(
        email=email_norm,
        password_hash=pwd_hash,
        created_by_id=actor_id,
        updated_by_id=actor_id,
    )

    repo = UserRepository(session)

    try:
        await repo.create(entity)
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        # 5) Unique-Violation → 409
        if UniqueViolation is not None and isinstance(getattr(e, "orig", None), UniqueViolation):  # type: ignore[arg-type]
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-Mail existiert bereits.",
            ) from e
        # Fallback: auf Indexnamen/Unique-Fehlertext prüfen
        err_txt = str(getattr(e, "orig", e)).lower()
        if "uq_app_user_email_ci" in err_txt or "unique" in err_txt:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-Mail existiert bereits.",
            ) from e
        # ansonsten hochreichen
        raise

    return UserRead.model_validate(entity)


@router.get(
    "",
    response_model=UserPage,
    summary="List users (paginated)",
    description=(
        "Paginierte Liste von Benutzern. "
        f"Standard-Limit {DEFAULT_LIMIT}, max. {MAX_LIMIT}. "
        "Standard-Sortierung: `created_at` absteigend."
    ),
)
async def list_users(
    session: Annotated[AsyncSession, Depends(get_session)],
    limit: Annotated[int, Query(ge=1, le=MAX_LIMIT)] = DEFAULT_LIMIT,
    offset: Annotated[int, Query(ge=0)] = 0,
    sort: Annotated[Literal["created_at.asc", "created_at.desc"], Query()] = "created_at.desc",
) -> UserPage:
    table = AppUser.__table__

    # Soft-delete-Filter
    where_clauses: list[sa.ColumnElement[bool]] = []
    if "deleted_at" in table.c:
        where_clauses.append(table.c.deleted_at.is_(None))

    # Sortierung
    order_by = table.c.created_at.asc() if sort.endswith(".asc") else table.c.created_at.desc()

    # Total
    count_stmt = sa.select(sa.func.count()).select_from(table)
    if where_clauses:
        count_stmt = count_stmt.where(*where_clauses)
    total = (await session.execute(count_stmt)).scalar_one()

    # Page
    stmt = sa.select(AppUser).where(*where_clauses).order_by(order_by).limit(limit).offset(offset)
    res = await session.execute(stmt)
    items = [UserRead.model_validate(row) for row in res.scalars().all()]

    return UserPage(items=items, total=int(total), limit=limit, offset=offset)


@router.get(
    "/{user_id}",
    response_model=UserRead,
    summary="Get user by id",
    description="Liefert einen Benutzer per ID. **404**, wenn nicht gefunden.",
)
async def get_user(
    user_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserRead:
    repo = UserRepository(session)
    obj = await repo.get(user_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User nicht gefunden.")
    return UserRead.model_validate(obj)
