# ADR-0003: Alembic – Workdir & Konfiguration

**Status:** Accepted
**Datum:** 2025-09-15

## Problem
Fehler `No 'script_location' key found in configuration` trat auf.

## Entscheidung
- `alembic.ini` mit `script_location = alembic`.
- **Alle Alembic-Aufrufe aus `backend/`** starten.
- Für Test-DB `-x env=test` verwenden (env.py liest `.env.test`).

## Befehle
```bash
# im Ordner backend/
alembic upgrade head
alembic -x env=test upgrade head
