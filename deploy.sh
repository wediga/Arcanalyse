#!/bin/bash
set -e

cd /home/wediga/arcanalyse
git pull origin main
cd frontend
docker compose build
docker compose up -d
