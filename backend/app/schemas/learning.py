"""Closed-Loop Learning schemas for FoodLoop AI.

Captures post-service outcome telemetry, compares demand forecasts against actual diner
consumption, and generates structured operational learning signals.
Explicitly clarifies that this curates a clean training dataset for downstream ML,
without claiming autonomous real-time retraining.
"""
from enum import Enum
from pydantic import BaseModel, Field


class PredictionBias(str, Enum):
    OVER_PREDICTION = "Over-Prediction"
    UNDER_PREDICTION = "Under-Prediction"
    BALANCED = "Balanced"


class LearningSignalType(str, Enum):
    OVER_PREPARATION = "OVER_PREPARATION"
    UNDER_PREPARATION = "UNDER_PREPARATION"
    HIGH_SURPLUS_MEAL = "HIGH_SURPLUS_MEAL"
    PICKUP_DELAY = "PICKUP_DELAY"
    RECIPIENT_REJECTION = "RECIPIENT_REJECTION"
    RECIPIENT_ACCEPTED = "RECIPIENT_ACCEPTED"
    SAFETY_FAILURE = "SAFETY_FAILURE"
    SAFETY_PASSED = "SAFETY_PASSED"


class DemandPerformanceRecord(BaseModel):
    """Post-service audit comparing demand forecast against actual institutional diner outcome."""
    record_id: str = Field(..., description="Unique demand audit record ID (e.g. DEM-PERF-01)")
    kitchen_id: str = Field(..., description="Institutional kitchen identifier")
    meal_slot: str = Field(..., description="Service slot (Breakfast, Lunch, Dinner, Evening Snacks)")
    plan_date: str = Field(..., description="Date of meal service (YYYY-MM-DD)")
    dish_name: str = Field(..., description="Primary menu item evaluated")
    registered_headcount: int = Field(..., ge=0, description="Enrolled diners on institutional roster")
    planned_portions: int = Field(..., ge=0, description="Initial cook target decided by kitchen manager")
    predicted_diners: int = Field(..., ge=0, description="AI baseline forecast diners")
    actual_diners: int = Field(..., ge=0, description="Actual meals consumed verified at checkout")
    absolute_error: int = Field(..., ge=0, description="Absolute diner deviation: |predicted - actual|")
    percentage_error: float = Field(..., ge=0.0, description="Percentage deviation relative to actual diners")
    bias: PredictionBias = Field(..., description="Direction of forecast error (Over, Under, Balanced)")
    surplus_risk_predicted: str = Field(default="Low", description="Forecasted surplus risk category")
    actual_surplus_portions: int = Field(..., ge=0, description="Remaining uneaten portions post-service")
    reason_codes: list[str] = Field(default_factory=list, description="Audit reason codes for observed variance")
    is_demo_data: bool = Field(default=True, description="Demonstration simulation record flag")


class LearningSignal(BaseModel):
    """Actionable operational feedback signal for kitchen planning and ML training curation."""
    signal_id: str = Field(..., description="Unique signal ID (e.g. SIG-001)")
    signal_type: LearningSignalType = Field(..., description="Categorical signal classification")
    severity: str = Field(..., description="Urgency/importance (low, moderate, high)")
    timestamp: str = Field(..., description="Detection timestamp")
    kitchen_id: str = Field(..., description="Kitchen identifier")
    meal_slot: str = Field(..., description="Service meal slot")
    dish_name: str | None = Field(default=None, description="Culinary dish name if item-specific")
    description: str = Field(..., description="Human-readable operational description of the observed outcome")
    metric_observed: float = Field(..., description="Observed numeric metric (e.g. surplus %, error %, minutes)")
    target_threshold: float = Field(..., description="Allowable operational threshold")
    suggested_action: str = Field(..., description="Actionable kitchen or dispatch recommendation")
    feedback_dataset_ready: bool = Field(
        default=True,
        description="Flag indicating this record is normalized and ready for future ML model training",
    )
    is_demo_data: bool = Field(default=True, description="Demonstration record indicator")


class LearningFeedbackCreatePayload(BaseModel):
    """Payload submitted post-service to register actual outcome telemetry and generate learning signals."""
    kitchen_id: str = Field(..., description="Originating kitchen ID")
    meal_slot: str = Field(..., description="Service slot (Breakfast, Lunch, Dinner, Evening Snacks)")
    plan_date: str = Field(..., description="Date of meal service (YYYY-MM-DD)")
    dish_name: str = Field(..., description="Menu item evaluated")
    registered_headcount: int = Field(default=500, ge=0, description="Registered headcount")
    planned_portions: int = Field(default=450, ge=0, description="Portions prepared by kitchen")
    predicted_portions: int = Field(..., ge=0, description="Predicted diners")
    actual_consumed: int = Field(..., ge=0, description="Actual meals consumed")
    actual_surplus: int = Field(default=0, ge=0, description="Uneaten portions remaining")
    reason_notes: str | None = Field(default=None, description="Kitchen supervisor notes explaining variance")


class LearningFeedbackResponse(BaseModel):
    """Result returned after ingesting outcome telemetry and calibrating feedback signals."""
    status: str = Field(default="recorded", description="Operation status")
    message: str = Field(..., description="Human-readable confirmation")
    recorded_performance: DemandPerformanceRecord = Field(..., description="Evaluated performance record")
    generated_signals: list[LearningSignal] = Field(
        default_factory=list, description="New learning signals generated from this outcome"
    )


class DemandPerformanceSummary(BaseModel):
    """Statistical summary of historical forecast errors and outcome bias."""
    total_evaluated_meals: int = Field(..., ge=0, description="Number of post-service audits completed")
    mean_absolute_error: float = Field(..., ge=0.0, description="Mean Absolute Error (portions)")
    mean_percentage_error: float = Field(..., ge=0.0, description="Mean Absolute Percentage Error (%)")
    over_prediction_count: int = Field(..., ge=0, description="Count of over-predicted meals")
    under_prediction_count: int = Field(..., ge=0, description="Count of under-predicted meals")
    balanced_count: int = Field(..., ge=0, description="Count of accurately forecasted meals (within ±5%)")
    records: list[DemandPerformanceRecord] = Field(
        default_factory=list, description="Detailed meal audit records"
    )
    disclaimer: str = Field(
        default=(
            "Operational performance evaluation on demonstration outcome data. "
            "Prepares clean datasets for future batch retraining; does not imply autonomous online retraining."
        ),
        description="Data honesty statement",
    )
