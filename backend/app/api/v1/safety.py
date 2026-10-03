"""Safety Verification API routes for FoodLoop AI."""
from fastapi import APIRouter, status
from app.schemas.safety import (
    SafetyVerificationInput,
    SafetyVerificationRecordResponse,
)
from app.services.safety_service import safety_service

router = APIRouter(prefix="/safety", tags=["Food Safety Verification"])


@router.get(
    "/records",
    response_model=list[SafetyVerificationRecordResponse],
    summary="Get Safety Inspection Records",
    description="Retrieve all logged FoodLoop food safety verification audit records and holding temperature assessments.",
)
async def get_safety_records() -> list[SafetyVerificationRecordResponse]:
    """Retrieve all safety inspection records."""
    return safety_service.get_all_records()


@router.post(
    "/verify",
    response_model=SafetyVerificationRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Perform Safety Sign-off",
    description="Validate temperature probe and sensory attributes to issue an internal FoodLoop safety verification token (audit checksum).",
)
async def verify_surplus_safety(
    data: SafetyVerificationInput,
) -> SafetyVerificationRecordResponse:
    """Submit temperature probe inspection and sensory signoff."""
    return safety_service.verify_surplus(data)
