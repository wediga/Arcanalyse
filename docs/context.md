# Arcanalyse – Kontext & Konventionen (MVP)

## Ziel
MVP eines Encounter Planners (ähnlich Kobold Fight Club) mit sauberer Basis für spätere KI-Features.

## Architektur (Stand)
- Backend: FastAPI (Python 3.12), SQLModel/SQLAlchemy (async), Alembic, asyncpg, pydantic-settings
- Frontend: Vite + React + TypeScript, Tailwind, @tanstack/react-query, MSW, Vitest
- DB: PostgreSQL (arcanalyse_dev/test)
- API: REST, Versionierung `/api/v1/*`, OpenAPI → FE-Typen via openapi-typescript
- Tooling: uv, ruff, black, mypy, pytest, just, pre-commit, CI (GitHub Actions)

## Benennungen & Typen
- **Tabellen/Spalten:** `snake_case`
- **Python-Klassen (Models/Schemas):** `CamelCase`
- **Enum-/Lookup-Codes:** lower-snake strings (z. B. `lawful_good`, `gargantuan`)
- **IDs:** Integer (SERIAL/BIGSERIAL) für MVP; UUID optional in späterem Slice
- **Zeitstempel:** `created_at`, `updated_at` (UTC, server defaults, `onupdate=now()`)
- **CR:** `NUMERIC(4,3)` (Python `Decimal`)
- **Booleans:** `is_*` Präfix
- **Soft-Delete:** nicht im MVP (nur harte Löschung, FK-Regeln beachten)

## API-Konventionen
- **Basis-URL:** `http://127.0.0.1:8000/api/v1`
- **Content-Type:** JSON
- **Pagination:** `limit` (default 50, max 200), `offset` (default 0)
- **Sortierung:** `sort` (z. B. `name`, `-cr`)
- **Fehler:** FastAPI-Standard (422 Validation Error), 404/409 nach semantischer Prüfung
- **CORS:** `http://localhost:5173`, `http://127.0.0.1:5173`

## Migrations
- **Alembic `target_metadata`:** `SQLModel.metadata`
- **Autogenerate:** aktiv; jede Änderung an Models → Revision → Upgrade → Commit
- **Seed:** nur Lookups/CR→XP in separatem Script

## Tests (BE)
- pytest + pytest-asyncio (strict), httpx.AsyncClient mit ASGITransport
- Test-DB über `TEST_DATABASE_URL` (Migrations vor Tests)
- Transaktionale Session pro Test (Rollback)
