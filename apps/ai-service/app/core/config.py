"""
Haveloc Pro AI Service — Core Configuration
Pydantic Settings for 12-factor app compliance.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──
    APP_NAME: str = "haveloc-pro-ai"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    WORKERS: int = 4
    LOG_LEVEL: str = "INFO"

    # ── Security ──
    JWT_SECRET: str = Field(default="dev-secret-change-in-prod", description="JWT signing key")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60
    API_KEY_HEADER: str = "X-API-Key"
    API_KEYS: str = ""  # comma-separated valid API keys
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:4000"
    RATE_LIMIT_PER_MINUTE: int = 60

    # ── Database ──
    DATABASE_URL: str = "postgresql+asyncpg://haveloc:haveloc_dev@localhost:5432/haveloc_pro"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_TIMEOUT: int = 30

    # ── Redis ──
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 300

    # ── AI / LLM ──
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    LLM_PROVIDER: Literal["openai", "groq", "auto"] = "auto"
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_TOKENS: int = 2000
    LLM_TIMEOUT: int = 30

    # ── Observability ──
    OTEL_EXPORTER_ENDPOINT: str = ""
    OTEL_SERVICE_NAME: str = "haveloc-pro-ai"
    PROMETHEUS_ENABLED: bool = True
    SENTRY_DSN: str = ""

    # ── External Services ──
    API_SERVICE_URL: str = "http://localhost:4000"
    WEBHOOK_SECRET: str = ""

    @computed_field
    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @computed_field
    @property
    def api_key_list(self) -> list[str]:
        return [k.strip() for k in self.API_KEYS.split(",") if k.strip()]

    @computed_field
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
