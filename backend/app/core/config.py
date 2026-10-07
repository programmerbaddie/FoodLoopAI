"""Application configuration and core settings for FoodLoop AI."""
import json
from typing import Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "FoodLoop AI Backend"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/v1"

    # Runtime Environment (development, staging, production)
    ENVIRONMENT: str = Field(
        default="development",
        description="Current runtime environment",
    )

    # Server binding parameters (typically injected by cloud hosting platforms like Render)
    HOST: str = Field(
        default="0.0.0.0",
        description="Server host interface binding",
    )
    PORT: int = Field(
        default=8000,
        description="Server listening port (Render provides $PORT automatically)",
    )

    # Public Production Frontend Origin
    FRONTEND_ORIGIN: str | None = Field(
        default=None,
        description="Optional additional frontend URL (e.g. https://food-loop-ai.vercel.app)",
    )

    # Authorized CORS Origins
    CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "https://food-loop-ai.vercel.app",
        ],
        description="Explicit list of authorized origins for CORS requests",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        """Parse comma-separated string, JSON string, or list into origin array."""
        if isinstance(v, str):
            clean = v.strip()
            if clean.startswith("[") and clean.endswith("]"):
                try:
                    return json.loads(clean)
                except Exception:
                    pass
            return [i.strip() for i in clean.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return []

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    def get_cors_origins(self) -> list[str]:
        """Return consolidated CORS origins including production Vercel frontend and optional FRONTEND_ORIGIN."""
        origins = list(self.CORS_ORIGINS)
        # Ensure production Vercel frontend is always authorized
        prod_vercel = "https://food-loop-ai.vercel.app"
        if prod_vercel not in origins:
            origins.append(prod_vercel)

        if self.FRONTEND_ORIGIN and self.FRONTEND_ORIGIN.strip():
            clean_origin = self.FRONTEND_ORIGIN.strip().rstrip("/")
            if clean_origin and clean_origin not in origins:
                origins.append(clean_origin)

        # Safeguard: never permit wildcard in production
        return [o for o in origins if o != "*"]


settings = Settings()
