from fastapi import APIRouter, status
from app.schemas.health import HealthCheckResponse
from app.core.config import settings

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Check",
    description="Returns current operational status confirming that the FoodLoop AI backend is healthy and responding.",
)
async def get_health() -> HealthCheckResponse:
    """Return service health status."""
    return HealthCheckResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )
