"""Redistribution Logistics API routes for FoodLoop AI."""
from fastapi import APIRouter, HTTPException, status
from app.schemas.redistribution import (
    HandoverVerificationInput,
    RedistributionDispatchResponse,
)
from app.services.redistribution_service import redistribution_service

router = APIRouter(prefix="/redistribution", tags=["Redistribution Logistics"])


@router.get(
    "/dispatches",
    response_model=list[RedistributionDispatchResponse],
    summary="Get Active Consignments",
    description="Retrieve all transport consignments with live vehicle sensor readings and delivery stages.",
)
async def get_active_dispatches() -> list[RedistributionDispatchResponse]:
    """Retrieve all active logistics dispatches."""
    return redistribution_service.get_all_dispatches()


@router.get(
    "/dispatches/{dispatch_id}",
    response_model=RedistributionDispatchResponse,
    summary="Get Dispatch by ID",
    description="Retrieve logistics consignment details by tracking identifier.",
)
async def get_dispatch_by_id(dispatch_id: str) -> RedistributionDispatchResponse:
    """Retrieve single consignment details."""
    d = redistribution_service.get_dispatch_by_id(dispatch_id)
    if not d:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dispatch '{dispatch_id}' not found.",
        )
    return d


@router.post(
    "/verify-otp",
    summary="Verify Handover Token",
    description="Recipient coordinator verifies one-time passcode to confirm physical custody transfer.",
)
async def verify_handover_otp(data: HandoverVerificationInput):
    """Validate secure handover OTP token."""
    success = redistribution_service.verify_handover(
        dispatch_id=data.dispatch_id, otp_code=data.otp_code
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid handover token or dispatch record not found.",
        )
    return {
        "status": "success",
        "message": f"Dispatch '{data.dispatch_id}' handoff verified and logged.",
    }
