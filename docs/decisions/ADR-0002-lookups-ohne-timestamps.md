# ADR-0002: Lookup-Responses ohne Zeitsstempel

**Status:** Accepted
**Datum:** 2025-09-15

## Kontext
Lookup-Tabellen (z. B. `size`, `alignment`) sind statisch und werden selten geändert. Timestamps sind für Client-Usecases nicht nötig und erhöhen die API-Reibung.

## Entscheidung
- Pydantic-Read-Schemas für Lookups **enthalten keine** `created_at`/`updated_at`.
- DB-Felder können bestehen (aktuell nicht vorhanden), werden aber nicht serialisiert.

## Konsequenzen
- Schlankere Responses.
- Tests müssen keine Zeitfelder assert’en.
