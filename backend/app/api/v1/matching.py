"""Recipient Matching API routes for FoodLoop AI."""
from fastapi import APIRouter, HTTPException, status
from app.schemas.recipient import RecipientMatchResponse
from app.services.matching_service import matching_service

router = APIRouter(prefix="/matching", tags=["Recipient Matching"])


@router.get(
    "/suggested",
    response_model=list[RecipientMatchResponse],
    summary="Get Suggested Recipient Matches",
    description="Lists candidate beneficiary allocations prioritized by travel distance, headcount capacity, and dietary fit.",
)
async def get_suggested_matches() -> list[RecipientMatchResponse]:
    """Retrieve prioritized list of candidate beneficiary matches."""
    return matching_service.get_candidate_matches()


@router.post(
    "/{match_id}/accept",
    response_model=RecipientMatchResponse,
    summary="Accept Beneficiary Match",
    description="Confirm match allocation and trigger automated logistics driver assignment.",
)
async def accept_recipient_match(match_id: str) -> RecipientMatchResponse:
    """Acknowledge match and assign logistics dispatch."""
    updated = matching_service.accept_match(match_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match candidate '{match_id}' not found.",
        )
    return updated
