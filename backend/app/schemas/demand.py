"""Demand input and prediction schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from app.schemas.menu import MealSlot


class RiskSeverity(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class ConfidenceLevel(str, Enum):
    HIGH_SIGNAL = "High (Complete Inputs)"
    MODERATE_SIGNAL = "Moderate (Standard Signals)"
    BASELINE_HEURISTIC = "Baseline (Minimal Inputs)"


class DemandInput(BaseModel):
    kitchen_id: str = Field(
        default="KITCHEN-IITD-01", description="Target institutional kitchen identifier"
    )
    meal_slot: MealSlot = Field(..., description="Target meal slot")
    plan_date: str = Field(
        ...,
        description="Target service date in YYYY-MM-DD format",
        examples=["2026-10-09"],
    )
    registered_headcount: int = Field(
        ..., gt=0, le=10000, description="Active registered institutional head count"
    )
    planned_portions: int = Field(
        ..., gt=0, le=10000, description="Kitchen's baseline target preparation portions"
    )
    confirmed_leaves: int = Field(
        default=0,
        ge=0,
        description="Verified student/staff meal opt-out leave requests logged on portal",
    )
    historical_consumption_rate: float | None = Field(
        default=None,
        ge=0.1,
        le=1.5,
        description="Optional historical turnout multiplier (e.g. 0.85 = 85% turnout)",
    )
    day_of_week: str | None = Field(
        default=None,
        description="Optional day of week (e.g. Friday, Saturday)",
    )
    special_events: list[str] = Field(
        default_factory=list,
        description="Campus events affecting attendance (e.g. symposium, exams, sports)",
    )
    weather_context: str | None = Field(
        default=None,
        description="Reported weather conditions (e.g. Rain, Clear, Heatwave)",
    )

    @field_validator("confirmed_leaves")
    @classmethod
    def validate_leaves(cls, v: int, info) -> int:
        headcount = info.data.get("registered_headcount")
        if headcount is not None and v > headcount:
            raise ValueError("Confirmed leaves cannot exceed registered headcount.")
        return v


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
    recommended_prep_portions: int = Field(
        ...,
        description="Recommended cooking batch including safe 3-5% non-stockout buffer",
    )
    variance_portions: int = Field(
        ..., description="Net variance (predicted - planned portions)"
    )
    variance_pct: float = Field(
        ..., description="Variance expressed as percentage of planned"
    )
    attendance_projected: int = Field(
        ..., description="Projected physical attendance after leave deductions"
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
    reason_codes: list[str] = Field(
        default_factory=list,
        description="Machine-readable rule reason codes explaining the adjustments",
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
    confidence_level: ConfidenceLevel = Field(
        default=ConfidenceLevel.MODERATE_SIGNAL,
        description="Honest signal-completeness quality indicator (not trained ML accuracy)",
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record (no fake ML claimed)",
    )
