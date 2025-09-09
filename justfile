# Use PowerShell as shell on Windows
set shell := ["powershell", "-NoProfile", "-Command"]

# Common paths (kept simple for portability)
ROOT := "."
BACKEND_DIR := "backend"
FRONTEND_DIR := "frontend"

# Default target: show available recipes
default:
    @just --list

# Placeholder recipes — will be implemented in later steps
setup:
    echo "Setup steps will be added in step 3 (Python tooling) and step 8 (Frontend)."

backend:
    echo "Backend run command will be added in step 4 (FastAPI skeleton)."

frontend:
    echo "Frontend run command will be added in step 8 (Vite)."

test:be:
    echo "Backend tests will be wired in step 7."

test:fe:
    echo "Frontend tests will be wired in step 10."

gen:api:
    echo "OpenAPI type generation will be configured in step 9."

migrate:
    echo "Alembic migrations will be wired in step 5."
