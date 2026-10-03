"""Surplus Inventory API routes for FoodLoop AI."""
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.surplus import SurplusCategory, SurplusStatus, SurplusRecordResponse
from app.services.surplus_service import surplus_service

router = APIRouter(prefix="/surplus", tags=["Surplus Inventory"])


@router.get(
    "/active",
    response_model=list[SurplusRecordResponse],
    summary="Get Active Surplus Inventory",
    description="Lists all detected kitchen surplus batches with live holding conditions and status.",
)
async def get_active_surplus(
    kitchen_id: str | None = Query(default=None, description="Kitchen filter"),
    category: SurplusCategory | None = Query(default=None, description="Category filter"),
    surplus_status: SurplusStatus | None = Query(
        default=None, alias="status", description="Status filter"
    ),
) -> list[SurplusRecordResponse]:
    """Retrieve active surplus inventory."""
    return surplus_service.get_all_surplus(
        kitchen_id=kitchen_id, category=category, status=surplus_status
    )


@router.get(
    "/{surplus_id}",
    response_model=SurplusRecordResponse,
    summary="Get Surplus Batch by ID",
    description="Retrieve specific details and holding metrics for a single surplus batch.",
)
async def get_surplus_detail(surplus_id: str) -> SurplusRecordResponse:
    """Retrieve single surplus record."""
    item = surplus_service.get_surplus_by_id(surplus_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Surplus item '{surplus_id}' not found.",
        )
    return item
