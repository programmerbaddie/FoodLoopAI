"""Demand input and prediction schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field
from app.schemas.menu import MealSlot


class RiskSeverity(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class DemandInput(BaseModel):
    kitchen_id: str = Field(..., description="Kitchen identifier")
    meal_slot: MealSlot = Field(..., description="Target meal slot")
    plan_date: str = Field(..., description="Target service date (YYYY-MM-DD)")
    registered_headcount: int = Field(
        ..., gt=0, description="Active registered head count"
    )
    planned_portions: int = Field(
        ..., gt=0, description="Kitchen's baseline target preparation portions"
    )
    special_events: list[str] = Field(
        default_factory=list,
        description="Identified campus events (e.g. exams, sports meet, symposium)",
    )
    weather_context: str | None = Field(
        default=None, description="Reported weather conditions (e.g. Rain, Clear, Heatwave)"
    )


class DemandPredictionResponse(BaseModel):
    id: str = Field(..., description="Unique prediction identifier")
    kitchen_id: str = Field(..., description="Kitchen ID")
    meal_slot: MealSlot = Field(..., description="Meal service slot")
    planned_portions: int = Field(
        ..., description="Kitchen baseline planned volume in portions"
    )
    predicted_portions: int = Field(
        ..., description="Forecasted portion requirement"
    )
    variance_portions: int = Field(
        ..., description="Net variance (predicted - planned portions)"
    )
    variance_pct: float = Field(
        ..., description="Variance expressed as percentage of planned"
    )
    attendance_projected: int = Field(
        ..., description="Projected physical attendance"
    )
    historical_baseline_portions: int = Field(
        ..., description="Historical average consumption benchmark"
    )
    menu_highlights: list[str] = Field(
        default_factory=list, description="Primary dishes considered in calculation"
    )
    key_drivers: list[str] = Field(
        default_factory=list,
        description="Transparent factor justifications explaining the predicted variance",
    )
    prep_recommendation: str = Field(
        ..., description="Actionable kitchen batch advice for chefs"
    )
    suggested_batch_reduction_kg: float = Field(
        ..., ge=0.0, description="Recommended raw preparation volume reduction in kg"
    )
    risk_severity: RiskSeverity = Field(
        ..., description="Surplus generation risk level"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record (no fake ML claimed)",
    )
