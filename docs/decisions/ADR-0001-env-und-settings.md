# ADR-0001: Umgebungen & Settings (dotenv)

**Status:** Accepted
**Datum:** 2025-09-15

## Kontext
Wir brauchen eine klare Trennung zwischen Dev- und Test-Datenbank und eine schlanke Konfiguration.

## Entscheidung
- Wir verwenden **python-dotenv** und nur das Flag `ENVIRONMENT` (`dev` | `test`).
- DB-URLs:
  - `DATABASE_URL` für dev
  - `DATABASE_URL_TEST` für test
- Auswahl der URL passiert zentral in `app/core/config.py`.

## Konsequenzen
- Kein doppeltes `APP_ENV`.
- Laufzeitwechsel via `ENVIRONMENT` ohne Codeänderungen.
- `.env` und `.env.test` werden die einzige Quelle der Wahrheit.
