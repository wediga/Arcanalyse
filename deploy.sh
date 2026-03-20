#!/bin/bash
set -e

git config --global --add safe.directory /home/wediga/arcanalyse

cd /home/wediga/arcanalyse
git pull origin main
cd frontend
docker compose build
docker compose up -d
