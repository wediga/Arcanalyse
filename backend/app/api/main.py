# backend/app/api/main.py
from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.lookups import router as lookups_router
from app.api.v1.version import router as version_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(version_router)
api_router.include_router(lookups_router)
