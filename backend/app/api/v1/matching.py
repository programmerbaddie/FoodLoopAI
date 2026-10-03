"""Recipient Matching API routes for FoodLoop AI."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.recipient import RecipientMatchResponse, RecipientResponse
from app.services.matching_service import matching_service

router = APIRouter(prefix="/matching", tags=["Recipient Matching"])


@router.get(
    "/suggested",
    response_model=list[RecipientMatchResponse],
    summary="Get Suggested Recipient Matches",
    description="Lists candidate beneficiary allocations prioritized by travel distance, headcount capacity, and dietary fit.",
)
async def get_suggested_matches(
    surplus_id: Optional[str] = Query(None, description="Optional surplus batch ID to run matching against")
) -> list[RecipientMatchResponse]:
    """Retrieve prioritized list of candidate beneficiary matches."""
    return matching_service.get_candidate_matches(surplus_id=surplus_id)


@router.get(
    "/recipients",
    response_model=list[RecipientResponse],
    summary="Get Registered Demonstration Beneficiaries",
    description="List registered demonstration recipient organizations for matching simulation.",
)
async def get_recipients() -> list[RecipientResponse]:
    """Retrieve registered demonstration recipient organizations."""
    return matching_service.get_recipients()


@router.post(
    "/{match_id}/accept",
    response_model=RecipientMatchResponse,
    summary="Accept Beneficiary Match",
    description="Confirm match allocation, validate safety clearance, and trigger logistics driver assignment.",
)
async def accept_recipient_match(match_id: str) -> RecipientMatchResponse:
    """Acknowledge match and assign logistics dispatch."""
    success, updated, error_msg = matching_service.accept_match(match_id)
    if not success:
        if error_msg and "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg or "Failed to accept match candidate.",
        )
    return updated
