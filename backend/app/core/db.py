from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

# Create a single async engine for the whole app lifetime
engine = create_async_engine(
    settings.database_url,
    echo=False,  # can be toggled via settings later
    future=True,
    pool_pre_ping=True,  # validates connections
)

# Session factory, no models required at this point
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an AsyncSession per-request."""
    async with SessionLocal() as session:
        yield session
