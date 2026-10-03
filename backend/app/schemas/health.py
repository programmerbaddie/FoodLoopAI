from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(default="ok", description="Current service health status")
    service: str = Field(
        default="FoodLoop AI Backend", description="Service identity"
    )
    version: str = Field(default="0.1.0", description="Service version")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of health check",
    )
    environment: str = Field(
        default="development", description="Runtime environment"
    )
