# Architecture Overview

## Workspace Structure

Arcanalyse uses a [uv](https://docs.astral.sh/uv/) workspace monorepo with four Python packages and a separate frontend application.

```
arcanalyse/
├── src/arcanalyse_api/        # FastAPI application
├── packages/
│   ├── arcanalyse-core/       # Domain logic (pure Python)
│   ├── arcanalyse-db/         # Persistence layer
│   └── arcanalyse-training/   # Analysis pipeline (isolated)
├── frontend/                  # Next.js frontend
├── docs/                      # Public documentation
└── pyproject.toml             # Workspace root
```

## Package Dependencies

```
┌─────────────────┐     ┌─────────────────┐
│ arcanalyse-api  │────>│ arcanalyse-db   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │              ┌────────v────────┐
         └─────────────>│ arcanalyse-core │
                        └─────────────────┘

┌───────────────────────┐
│ arcanalyse-training   │──> core + db (isolated venv)
└───────────────────────┘
```

**Key constraint:** `arcanalyse-core` has zero external dependencies. It contains only pure Python domain logic and can be used by any consumer without pulling in framework dependencies.

## Package Responsibilities

### arcanalyse-core

**Purpose:** Framework-agnostic domain logic

- Pydantic models for domain types (Monster, Spell, Character, Encounter)
- Validation rules
- Analysis engine (CR/XP, action economy, risk flags)
- Simulation engine (Monte Carlo combat)
- No I/O, no database, no HTTP

### arcanalyse-db

**Purpose:** Persistence layer

- SQLModel table definitions (database schema)
- Alembic migrations
- Repository pattern for data access
- Depends on `arcanalyse-core` (uses domain types)

### arcanalyse-api

**Purpose:** HTTP interface

- FastAPI application
- REST endpoints
- Request/response DTOs
- Authentication (planned)
- Depends on `core` and `db`

### arcanalyse-training

**Purpose:** Analysis pipeline (separate)

- Training scripts
- Feature engineering
- Model evaluation
- Runs in an isolated `.venv-training` environment
- Must NOT depend on `api`

## Frontend

The frontend is a Next.js application with TypeScript and Tailwind CSS v4.

- Located in `frontend/`
- Uses Turbopack as the bundler
- Currently serves the landing page and survey system
- Will include the encounter builder, results screen, and monster browser

## Environments

| Environment | Purpose | Activation |
|-------------|---------|------------|
| `.venv` | API development | `uv sync` |
| `.venv-training` | Analysis pipeline | `UV_PROJECT_ENVIRONMENT=.venv-training uv sync --package arcanalyse-training` |

## Infrastructure

- **Server:** Hetzner AX41
- **Containerization:** Docker + Docker Compose
- **Reverse proxy:** Caddy
- **Database:** PostgreSQL 16 (port 5432 production, port 5433 local dev)
- **Analytics:** Umami (self-hosted)
- **Newsletter:** Listmonk + Brevo SMTP (self-hosted)
- **Surveys:** Formbricks (self-hosted)

## External Data Sources

- **Open5e v2** (SRD): Structured D&D 5e data for monsters, spells, and classes
  - Used for initial SRD data import (~400 monsters, top 30 spells)
  - Design decision: Full statblock depth from day one (no lazy-loading or stub approach)
  - Primary keys use UUID v7 (time-sortable, no sequence bottleneck)
