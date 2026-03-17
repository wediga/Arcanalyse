# Entwickler-Setup

## Voraussetzungen

- **Python:** 3.12 (via `.python-version`)
- **uv:** Package Manager ([Installation](https://docs.astral.sh/uv/getting-started/installation/))
- **Docker:** Für PostgreSQL (optional: lokale Installation)
- **IDE:** PyCharm (empfohlen)

## Projekt klonen & Setup

```powershell
# Repository klonen
git clone <repo-url>
cd Arcanalyse

# Dependencies installieren (default environment)
uv sync

# Prüfen ob alles funktioniert
uv run python --version
```

## Environments

### Default Environment (`.venv`)

Für API-Entwicklung und allgemeine Arbeit.

```powershell
# Sync
uv sync

# Command ausführen
uv run <command>

# Beispiel: Tests
uv run pytest
```

### Training Environment (`.venv-training`)

Isoliert für ML-Training, um Konflikte zu vermeiden.

```powershell
# Erstellen/Sync
$env:UV_PROJECT_ENVIRONMENT = ".venv-training"
uv sync --package arcanalyse-training
Remove-Item Env:\UV_PROJECT_ENVIRONMENT

# Command ausführen
$env:UV_PROJECT_ENVIRONMENT = ".venv-training"
uv run --package arcanalyse-training <command>
Remove-Item Env:\UV_PROJECT_ENVIRONMENT
```

## Datenbank (PostgreSQL)

### Option A: Docker (empfohlen)

```powershell
# docker-compose.yml erstellen (siehe unten)
docker compose up -d

# Verbindung testen
uv run python -c "from arcanalyse_db import engine; print('Connected!')"
```

**docker-compose.yml:**
```yaml
version: "3.8"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: arcanalyse
      POSTGRES_PASSWORD: arcanalyse
      POSTGRES_DB: arcanalyse
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Option B: Lokale PostgreSQL Installation

1. PostgreSQL 16 installieren
2. Datenbank erstellen:
   ```sql
   CREATE DATABASE arcanalyse;
   CREATE USER arcanalyse WITH PASSWORD 'arcanalyse';
   GRANT ALL PRIVILEGES ON DATABASE arcanalyse TO arcanalyse;
   ```

### Environment Variables

Erstelle `.env` im Projekt-Root (wird nicht committed):

```env
DATABASE_URL=postgresql://arcanalyse:arcanalyse@localhost:5432/arcanalyse
```

## Projekt-Struktur

```
Arcanalyse/
├── src/
│   └── arcanalyse_api/      # FastAPI Application
├── packages/
│   ├── arcanalyse-core/     # Domain Logic
│   │   └── src/arcanalyse_core/
│   ├── arcanalyse-db/       # Persistence
│   │   └── src/arcanalyse_db/
│   └── arcanalyse-training/ # ML (isoliert)
│       └── src/arcanalyse_training/
├── docs/                    # Dokumentation
├── tests/                   # Tests (TODO)
├── .env                     # Lokale Config (nicht committed)
├── .env.example             # Template für .env
├── pyproject.toml           # Workspace Root
└── uv.lock                  # Lockfile (committed)
```

## Typische Workflows

### Dependency hinzufügen

```powershell
# Zu Root (arcanalyse-api)
uv add fastapi

# Zu einem Package
cd packages/arcanalyse-core
uv add pydantic
cd ../..
```

### API starten (sobald implementiert)

```powershell
uv run uvicorn arcanalyse_api:app --reload
```

### Tests ausführen

```powershell
uv run pytest
```

### Docs lokal anschauen

```powershell
uv run mkdocs serve
# → http://localhost:8000
```

## IDE-Setup (PyCharm)

1. **Python Interpreter:** `.venv/Scripts/python.exe` auswählen
2. **Mark as Sources Root:**
   - `src/`
   - `packages/arcanalyse-core/src/`
   - `packages/arcanalyse-db/src/`
   - `packages/arcanalyse-training/src/`
3. **pytest als Test Runner** konfigurieren

## Troubleshooting

### "Module not found" bei Imports

```powershell
# Sync neu ausführen
uv sync

# Prüfen ob Package installiert
uv run pip list | Select-String arcanalyse
```

### PostgreSQL Connection Error

1. Docker läuft? `docker ps`
2. Port 5432 frei? `netstat -an | Select-String 5432`
3. `.env` korrekt?

### Training Environment Probleme

```powershell
# Komplett neu erstellen
Remove-Item -Recurse -Force .venv-training
$env:UV_PROJECT_ENVIRONMENT = ".venv-training"
uv sync --package arcanalyse-training
Remove-Item Env:\UV_PROJECT_ENVIRONMENT
```
