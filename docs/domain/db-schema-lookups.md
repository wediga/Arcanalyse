# DB-Schema – Lookups (Slice 1)

## Tabellen (via Alembic)

ability, ac_type, alignment, condition_type, cr_to_xp,
creature_type, damage_type, environment, language,
sense_type, size, skill, source, speed_type, tag

### Allgemeines Muster
- Klassische Lookups (z. B. `size`, `alignment`, …)
  - `id` – integer PK
  - `code` – text/varchar, **UNIQUE**, **NOT NULL**
  - `name` – text/varchar, **NOT NULL**
- Spezialfall `cr_to_xp`
  - `challenge_rating` – numeric/decimal, **PRIMARY KEY**
  - `xp` – integer, **NOT NULL**

> **Hinweis:** API-Responses für Lookups enthalten **keine** `created_at`/`updated_at`-Felder (siehe ADR-0002).

### Wichtige Constraints
- Alle `*_code`-Spalten haben **UNIQUE**-Constraint.
- `cr_to_xp.challenge_rating` ist der **Primärschlüssel** (ein Wert pro CR).

### Migration
- Datei: `backend/alembic/versions/0b6635e32d0f_slice_1_lookups_cr_to_xp.py`

### Migration anwenden
```bash
# immer aus dem Ordner backend/ aufrufen
alembic upgrade head                 # dev-DB
alembic -x env=test upgrade head     # test-DB
