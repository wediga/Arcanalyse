# Developer Setup

## Prerequisites

- **Python:** 3.12 (via `.python-version`)
- **Node.js:** 18+ (for frontend)
- **uv:** Package manager ([installation](https://docs.astral.sh/uv/getting-started/installation/))
- **Docker:** For PostgreSQL
- **IDE:** PyCharm (recommended)

## Clone and Setup

```bash
# Clone the repository
git clone <repo-url>
cd Arcanalyse

# Install dependencies (default environment)
uv sync

# Verify the setup
uv run python --version
```

## Environments

### Default Environment (`.venv`)

For API development and general work.

```bash
# Sync dependencies
uv sync

# Run a command
uv run <command>

# Example: run tests
uv run pytest
```

### Training Environment (`.venv-training`)

Isolated environment for the analysis pipeline to avoid dependency conflicts.

```bash
# Create/sync
UV_PROJECT_ENVIRONMENT=.venv-training uv sync --package arcanalyse-training

# Run a command
UV_PROJECT_ENVIRONMENT=.venv-training uv run --package arcanalyse-training <command>
```

<details>
<summary>PowerShell (Windows)</summary>

```powershell
# Create/sync
$env:UV_PROJECT_ENVIRONMENT = ".venv-training"
uv sync --package arcanalyse-training
Remove-Item Env:\UV_PROJECT_ENVIRONMENT

# Run a command
$env:UV_PROJECT_ENVIRONMENT = ".venv-training"
uv run --package arcanalyse-training <command>
Remove-Item Env:\UV_PROJECT_ENVIRONMENT
```
</details>

## Database (PostgreSQL)

### Option A: Docker (recommended)

```bash
docker compose up -d

# Verify the container is running
docker ps
```

This starts a PostgreSQL 16 container on port 5433.

### Option B: Local PostgreSQL Installation

1. Install PostgreSQL 16
2. Create the database:
   ```sql
   CREATE DATABASE arcanalyse;
   CREATE USER arcanalyse WITH PASSWORD 'arcanalyse';
   GRANT ALL PRIVILEGES ON DATABASE arcanalyse TO arcanalyse;
   ```

### Environment Variables

Create `.env` in the project root (not committed to Git):

```env
DATABASE_URL_TEST=postgresql://arcanalyse:arcanalyse@localhost:5433/arcanalyse_test
```

## Project Structure

```
Arcanalyse/
├── src/
│   └── arcanalyse_api/      # FastAPI application
├── packages/
│   ├── arcanalyse-core/     # Domain logic
│   │   └── src/arcanalyse_core/
│   ├── arcanalyse-db/       # Persistence
│   │   └── src/arcanalyse_db/
│   └── arcanalyse-training/ # Analysis pipeline (isolated)
│       └── src/arcanalyse_training/
├── frontend/                # Next.js frontend
├── docs/                    # Documentation
├── .env                     # Local config (not committed)
├── .env.example             # Template for .env
├── pyproject.toml           # Workspace root
└── uv.lock                  # Lockfile (committed)
```

## Common Workflows

### Adding a Dependency

```bash
# To root project (arcanalyse-api)
uv add fastapi

# To a workspace package
cd packages/arcanalyse-core
uv add pydantic
cd ../..
```

### Starting the API (once implemented)

```bash
uv run uvicorn arcanalyse_api:app --reload
```

### Running Tests

```bash
uv run pytest
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## IDE Setup (PyCharm)

1. **Python interpreter:** Select `.venv/bin/python` (Windows: `.venv/Scripts/python.exe`)
2. **Mark as Sources Root:**
   - `src/`
   - `packages/arcanalyse-core/src/`
   - `packages/arcanalyse-db/src/`
   - `packages/arcanalyse-training/src/`
3. **Configure pytest** as the test runner

## Troubleshooting

### "Module not found" on Imports

```bash
# Re-sync dependencies
uv sync

# Check if the package is installed
uv run pip list | grep arcanalyse
```

### PostgreSQL Connection Error

1. Is Docker running? `docker ps`
2. Is port 5433 available? `ss -tlnp | grep 5433` (Linux) / `netstat -an | Select-String 5433` (Windows)
3. Is `.env` configured correctly?

### Training Environment Issues

```bash
# Recreate from scratch
rm -rf .venv-training
UV_PROJECT_ENVIRONMENT=.venv-training uv sync --package arcanalyse-training
```
