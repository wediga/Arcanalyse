# backend/app/api/main.py
from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import router as v1_router

api_router = APIRouter()
# alle v1-Module (health, version, lookups, users, …) erscheinen unter /api/v1/…
api_router.include_router(v1_router, prefix="/api/v1")
