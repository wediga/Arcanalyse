from fastapi import APIRouter

router = APIRouter(tags=["system"])


@router.get(
    "/health",
    summary="Health",
    description="Einfacher Health-Check; gibt `{ status: 'ok' }` zurück.",
)
async def health() -> dict[str, str]:
    return {"status": "ok"}
