"""Demand Prediction API routes for FoodLoop AI."""
from fastapi import APIRouter, Query
from app.schemas.demand import DemandInput, DemandPredictionResponse
from app.services.demand_service import demand_service

router = APIRouter(prefix="/demand", tags=["Demand Prediction"])


@router.get(
    "/predictions",
    response_model=list[DemandPredictionResponse],
    summary="Get Daily Demand Forecasts",
    description="Returns pre-service forecasted portions, variance bounds, and batch prep cuts for all meal slots.",
)
async def get_daily_predictions(
    kitchen_id: str | None = Query(
        default=None, description="Optional facility filter ID"
    ),
) -> list[DemandPredictionResponse]:
    """Retrieve daily demand prediction records."""
    return demand_service.get_predictions_for_today(kitchen_id=kitchen_id)


@router.post(
    "/predict",
    response_model=DemandPredictionResponse,
    summary="Compute Ad-hoc Forecast",
    description="Calculate explainable consumption expectation based on physical headcount inputs and event factors.",
)
async def calculate_demand_forecast(
    input_data: DemandInput,
) -> DemandPredictionResponse:
    """Calculate demand forecast for a single meal service."""
    return demand_service.calculate_adhoc_forecast(input_data)
