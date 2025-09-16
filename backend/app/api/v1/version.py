from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["system"])


@router.get(
    "/version",
    summary="Version",
    description="Gibt die aktuelle Anwendungs-Version zurück.",
)
async def version() -> dict[str, str]:
    s = get_settings()
    return {"name": s.app_name, "version": s.app_version, "env": s.environment}
