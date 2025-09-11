# All code comments in English by your preference.
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_name: str = "Arcanalyse API"
    app_version: str = "0.1.0"
    environment: str = "dev"

    # Database (async Postgres URL)
    database_url: str = Field(
        default=(
            "postgresql+asyncpg://arcanalyse_dev:arcanalyse_dev@localhost:5432/arcanalyse_dev"
        ),
        alias="DATABASE_URL",
    )

    # CORS: dev frontend
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Read .env automatically if present in working dir (backend/)
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    # Cache settings object so every import does not re-parse env
    return Settings()
