#!/bin/bash
set -e

git config --global --add safe.directory /home/wediga/arcanalyse

cd /home/wediga/arcanalyse
git reset --hard origin/main
git pull origin main

# Export env vars so NEXT_PUBLIC_* are available as build args
set -a
source infra/.env
set +a

cd frontend
docker compose build
docker compose up -d
