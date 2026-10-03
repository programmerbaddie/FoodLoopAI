"""Impact and Closed-Loop API routes for FoodLoop AI."""
from fastapi import APIRouter
from app.schemas.impact import ImpactSummaryResponse
from app.services.impact_service import impact_service

router = APIRouter(prefix="/impact", tags=["Impact & Learning"])


@router.get(
    "/summary",
    response_model=ImpactSummaryResponse,
    summary="Get Cumulative Impact Metrics",
    description="Returns aggregate ESG indicators including meals rescued, waste diverted, CO₂e avoided, and longitudinal baseline trends.",
)
async def get_impact_summary() -> ImpactSummaryResponse:
    """Retrieve cumulative environmental and nutritional impact telemetry."""
    return impact_service.get_summary()
