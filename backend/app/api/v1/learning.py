"""Closed-Loop Learning and Feedback API routes for FoodLoop AI."""
from fastapi import APIRouter, Query, status
from app.schemas.learning import (
    DemandPerformanceSummary,
    LearningSignal,
    LearningSignalType,
    LearningFeedbackCreatePayload,
    LearningFeedbackResponse,
)
from app.services.learning_service import learning_service

router = APIRouter(prefix="/learning", tags=["Closed-Loop Learning"])


@router.get(
    "/demand-performance",
    response_model=DemandPerformanceSummary,
    summary="Get Demand Prediction vs Outcome Performance",
    description="Statistical evaluation of historical demand prediction error, Mean Absolute Percentage Error (MAPE), and prediction bias.",
)
async def get_demand_performance() -> DemandPerformanceSummary:
    """Retrieve demand accuracy telemetry comparing forecasts against actual consumption."""
    return learning_service.get_demand_performance()


@router.get(
    "/feedback",
    response_model=list[LearningSignal],
    summary="Get Operational Learning Signals",
    description="Returns structured feedback signals (over-prep, under-prep, pickup delays, safety flags) curated for kitchen planning and ML training datasets.",
)
async def get_feedback_signals(
    signal_type: LearningSignalType | None = Query(
        None, description="Filter signals by category type"
    ),
    severity: str | None = Query(
        None, description="Filter signals by severity level (low, moderate, high)"
    ),
) -> list[LearningSignal]:
    """Retrieve curated operational learning and calibration signals."""
    return learning_service.get_feedback_signals(
        signal_type=signal_type, severity=severity
    )


@router.post(
    "/feedback",
    response_model=LearningFeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Post-Service Outcome Feedback",
    description="Ingests actual diner consumption and surplus tallies post-service, computes error metrics, and produces actionable learning signals.",
)
async def submit_learning_feedback(
    payload: LearningFeedbackCreatePayload,
) -> LearningFeedbackResponse:
    """Register post-service outcome data and generate closed-loop learning signals."""
    return learning_service.record_feedback(payload)
