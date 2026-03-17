# Architektur-Übersicht

## Package-Struktur

```
arcanalyse/
├── src/arcanalyse_api/        # FastAPI Application
├── packages/
│   ├── arcanalyse-core/       # Domain Logic (pure Python)
│   ├── arcanalyse-db/         # Persistence Layer
│   └── arcanalyse-training/   # ML Pipeline (isolated)
├── docs/
└── pyproject.toml             # Workspace Root
```

## Abhängigkeiten

```
┌─────────────────┐     ┌─────────────────┐
│ arcanalyse-api  │────▶│ arcanalyse-db   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │              ┌────────▼────────┐
         └─────────────▶│ arcanalyse-core │
                        └─────────────────┘

┌───────────────────────┐
│ arcanalyse-training   │──▶ core + db (isoliertes venv)
└───────────────────────┘
```

## Package-Verantwortlichkeiten

### arcanalyse-core

**Zweck:** Framework-agnostische Domain-Logik

- Pydantic-Models für Domain-Typen (Monster, Spell, Character, Encounter)
- Validierungsregeln
- Analyse-Engine (CR/XP, Action Economy, Risk Flags)
- Simulation-Engine (Monte-Carlo)
- Keine I/O, keine DB, keine HTTP

### arcanalyse-db

**Zweck:** Persistence Layer

- SQLModel-Tabellen (DB-Schema)
- Alembic Migrations
- Repository-Pattern für Datenzugriff
- Hängt von `arcanalyse-core` ab (nutzt Domain-Typen)

### arcanalyse-api

**Zweck:** HTTP-Interface

- FastAPI Application
- REST-Endpoints
- Request/Response DTOs
- Auth (später)
- Hängt von `core` und `db` ab

### arcanalyse-training

**Zweck:** ML-Pipeline (separat)

- Training-Skripte
- Feature-Engineering
- Model-Evaluation
- Läuft in isoliertem `.venv-training`
- Darf NICHT von `api` abhängen

## Environments

| Environment | Zweck | Aktivierung |
|-------------|-------|-------------|
| `.venv` | API-Entwicklung | `uv sync` |
| `.venv-training` | ML-Training | Siehe CLAUDE.md |

## Externe Datenquellen

- **5e-database** (SRD): https://github.com/5e-bits/5e-database
  - JSON-Format, REST API unter dnd5eapi.co
  - Wird für initialen Monster/Spell-Import genutzt
  - Siehe [SRD-Integration](decisions/003-srd-integration.md)
