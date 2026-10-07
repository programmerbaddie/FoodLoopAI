"""Impact and ESG telemetry API routes for FoodLoop AI."""
from fastapi import APIRouter, Query, status
from app.schemas.impact import (
    ImpactEvent,
    ImpactEventCreatePayload,
    ImpactSummaryResponse,
)
from app.services.impact_service import impact_service

router = APIRouter(prefix="/impact", tags=["Impact & Sustainability"])


@router.get(
    "/summary",
    response_model=ImpactSummaryResponse,
    summary="Get Cumulative Impact Metrics",
    description="Returns aggregate ESG indicators including meals rescued, waste diverted, modelled CO₂e avoided, and longitudinal baseline trends.",
)
async def get_impact_summary() -> ImpactSummaryResponse:
    """Retrieve cumulative environmental and nutritional impact telemetry."""
    return impact_service.get_summary()


@router.get(
    "/events",
    response_model=list[ImpactEvent],
    summary="Get Historical Impact Events",
    description="Returns granular post-service outcome events linking meal predictions to verified redistribution outcomes.",
)
async def get_impact_events(
    kitchen_id: str | None = Query(
        None, description="Filter impact records by institutional kitchen identifier"
    ),
    limit: int = Query(50, ge=1, le=200, description="Maximum records to return"),
) -> list[ImpactEvent]:
    """Retrieve list of completed meal service outcome logs."""
    return impact_service.get_events(kitchen_id=kitchen_id, limit=limit)


@router.post(
    "/record",
    response_model=ImpactEvent,
    status_code=status.HTTP_201_CREATED,
    summary="Record Completed Service Impact Event",
    description="Logs a verified post-service meal outcome and calculates modelled environmental impact.",
)
async def record_impact_event(payload: ImpactEventCreatePayload) -> ImpactEvent:
    """Log an end-of-service meal outcome event."""
    return impact_service.record_event(payload)
