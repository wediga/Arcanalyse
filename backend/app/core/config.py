# backend/app/core/config.py
from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_name: str = "Arcanalyse API"
    app_version: str = "0.1.0"

    # "dev" | "test" | "prod"
    environment: str = Field(default="dev", alias="ENVIRONMENT")

    # Database (async Postgres URL)
    database_url: str = Field(
        default="postgresql+asyncpg://arcanalyse_dev:arcanalyse_dev@localhost:5432/arcanalyse_dev",
        alias="DATABASE_URL",
    )

    # CORS: dev frontend
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # default .env, wird in get_settings() dynamisch überschrieben
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


def _env_file_for_current_env() -> str:
    env = os.getenv("ENVIRONMENT", "dev").lower()
    return ".env.test" if env == "test" else ".env"


@lru_cache
def get_settings() -> Settings:
    load_dotenv(_env_file_for_current_env(), override=False)
    return Settings()
