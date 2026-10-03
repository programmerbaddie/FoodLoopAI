"""Overview API routes for FoodLoop AI."""
from fastapi import APIRouter
from app.schemas.overview import TodayOverviewResponse
from app.services.overview_service import overview_service

router = APIRouter(prefix="/overview", tags=["Executive Overview"])


@router.get(
    "/today",
    response_model=TodayOverviewResponse,
    summary="Get Today's Operational Overview",
    description="Returns high-level operational metrics across all 6 loop phases for today's kitchen operations.",
)
async def get_today_overview() -> TodayOverviewResponse:
    """Return executive telemetry snapshot."""
    return overview_service.get_today_overview()
