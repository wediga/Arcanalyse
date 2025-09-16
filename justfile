# PowerShell als Shell (If/Else, $LASTEXITCODE etc.)
set shell := ["powershell", "-NoProfile", "-Command"]

# Pfade
backend_dir := "backend"
frontend_dir := "frontend"

# --------------------------------------------------------------------
# Übersicht
default:
    @just --list

# --------------------------------------------------------------------
# Setup & Dev-Server
setup:
    Write-Host "Installing frontend deps..."; Push-Location {{frontend_dir}}; npm install; $fe=$LASTEXITCODE; Pop-Location; if ($fe -ne 0) { exit $fe } else { Write-Host "Frontend deps OK"; }; Write-Host "Python deps were installed earlier via 'uv pip install ...'."

fe-install:
    Push-Location {{frontend_dir}}; npm install; $code=$LASTEXITCODE; Pop-Location; exit $code

backend:
    Push-Location {{backend_dir}}; uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000; $code=$LASTEXITCODE; Pop-Location; exit $code

frontend:
    Push-Location {{frontend_dir}}; npm run dev -- --open --host; $code=$LASTEXITCODE; Pop-Location; exit $code

seed-system-user:
    $dir = "."; if (Test-Path "backend/app") { $dir = "backend" }; \
    Push-Location $dir; \
    uv run python -m app.seeds.system_user; \
    $code=$LASTEXITCODE; Pop-Location; exit $code

seed-system-user-test:
    $dir = "."; if (Test-Path "backend/app") { $dir = "backend" }; \
    Push-Location $dir; \
    $env:DATABASE_URL="postgresql+asyncpg://arcanalyse_test:arcanalyse_test@localhost:5432/arcanalyse_test"; \
    uv run python -m app.seeds.system_user; \
    $code=$LASTEXITCODE; Pop-Location; exit $code

# --------------------------------------------------------------------
# Qualität
lint:
    if ((Get-ChildItem -Path {{backend_dir}} -Recurse -Include *.py -File -ErrorAction SilentlyContinue)) { uv run ruff check {{backend_dir}}; exit $LASTEXITCODE } else { Write-Host "No Python files found in '{{backend_dir}}'. Skipping lint."; exit 0 }

format:
    uv run black .

typecheck:
    if ((Get-ChildItem -Path {{backend_dir}} -Recurse -Include *.py -File -ErrorAction SilentlyContinue)) { uv run mypy {{backend_dir}}; exit $LASTEXITCODE } else { Write-Host "No Python files found in '{{backend_dir}}'. Skipping typecheck."; exit 0 }

# --------------------------------------------------------------------
# Tests
test-be:
    Push-Location backend; if (!(Test-Path "tests")) { Write-Host "No tests directory at 'backend\\tests'. Skipping."; Pop-Location; exit 0 }; $tf = Get-ChildItem -Path "tests" -Recurse -Include *.py -File -ErrorAction SilentlyContinue; if (!$tf) { Write-Host "No test files found in 'backend\\tests'. Skipping."; Pop-Location; exit 0 }; uv run pytest tests; $code=$LASTEXITCODE; Pop-Location; exit $code

test-fe:
    Push-Location {{frontend_dir}}; npm run test:run; $code=$LASTEXITCODE; Pop-Location; exit $code

test-fe-watch:
    Push-Location {{frontend_dir}}; npm run test; $code=$LASTEXITCODE; Pop-Location; exit $code

# --------------------------------------------------------------------
# OpenAPI-Typen
gen-api:
    Push-Location {{frontend_dir}}; npm run gen:api; $code=$LASTEXITCODE; Pop-Location; exit $code

# --------------------------------------------------------------------
# Alembic (DEV & TEST)
migrate-status:
    Push-Location {{backend_dir}}; uv run alembic current -v; $code=$LASTEXITCODE; Pop-Location; exit $code

migrate-up:
    Push-Location {{backend_dir}}; uv run alembic upgrade head; $code=$LASTEXITCODE; Pop-Location; exit $code

migrate-rev msg:
    Push-Location {{backend_dir}}; uv run alembic revision --autogenerate -m "{{msg}}"; $code=$LASTEXITCODE; Pop-Location; exit $code

migrate-status-test:
    Push-Location {{backend_dir}}; $env:DATABASE_URL="postgresql+asyncpg://arcanalyse_dev:arcanalyse_dev@localhost:5432/arcanalyse_test"; uv run alembic current -v; $code=$LASTEXITCODE; Pop-Location; exit $code

migrate-up-test:
    Push-Location {{backend_dir}}; $env:DATABASE_URL="postgresql+asyncpg://arcanalyse_test:arcanalyse_test@localhost:5432/arcanalyse_test"; uv run alembic upgrade head; $code=$LASTEXITCODE; Pop-Location; exit $code

pre-commit-install:
    uv run pre-commit install

pre-commit:
    uv run pre-commit run --all-files


# -----------------------------------------------------------------------------
# Pre-commit verification (non-mutating): format, lint, types, BE+FE tests

fix-local:
    uv run ruff check --fix .
    uv run black .

fix:
    uv run pre-commit run --all-files

# Black in --check-Mode, nur wenn es Python-Dateien gibt
format-check:
    if ((Get-ChildItem -Path backend -Recurse -Include *.py -File -ErrorAction SilentlyContinue)) { uv run black --check backend; exit $LASTEXITCODE } else { Write-Host "No Python files found in 'backend'. Skipping format-check."; exit 0 }

# Lokal wie im CI prüfen (ohne zu ändern)
verify:
    # zuerst automatisch reparieren (damit black --check nicht scheitert)
    just fix
    # exakt die pre-commit Hooks laufen lassen (wie beim Commit/CI)
    uv run pre-commit run --all-files
    # statische Typprüfung
    uv run mypy backend
    # Tests
    cd backend && uv run pytest -q
