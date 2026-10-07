"""Impact and ESG telemetry schemas for FoodLoop AI.

Provides structured schemas for individual impact events and aggregate impact summaries.
Environmental metrics (CO₂e, virtual water) are explicitly marked as modelled estimates
with configurable factors rather than direct physical field measurements.
"""
from typing import Any
from pydantic import BaseModel, Field
from app.schemas.surplus import SurplusCategory


class MonthlyTrendItem(BaseModel):
    month: str = Field(..., description="Reporting month (e.g. June, July)")
    planned_portions: int = Field(..., description="Kitchen target portions")
    actual_consumed_portions: int = Field(..., description="Diners served")
    rescued_portions: int = Field(
        ..., description="Surplus portions routed to recipients"
    )
    diverted_kg: float = Field(
        ..., description="Organic mass diverted from landfill in kg"
    )


class CategoryBreakdownItem(BaseModel):
    category: SurplusCategory = Field(..., description="Food category")
    percentage: float = Field(
        ..., ge=0.0, le=100.0, description="Percentage of total diverted weight"
    )
    rescued_kg: float = Field(..., description="Cumulative weight in kilograms")


class ImpactEvent(BaseModel):
    """Granular post-service outcome event linking prediction to redistribution."""
    event_id: str = Field(..., description="Unique impact tracking ID (e.g. IMP-EVT-01)")
    timestamp: str = Field(..., description="Logging timestamp in IST or ISO format")
    kitchen_id: str = Field(..., description="Originating institutional kitchen ID")
    meal_slot: str = Field(..., description="Service slot (Breakfast, Lunch, Dinner, Evening Snacks)")
    meal_date: str = Field(..., description="Date of meal service (YYYY-MM-DD)")
    dish_name: str = Field(..., description="Prepared culinary item name")
    category: SurplusCategory = Field(..., description="Food classification category")

    # Traceability linkages across operational loop stages
    demand_prediction_id: str | None = Field(default=None, description="Linked demand forecast ID")
    surplus_id: str | None = Field(default=None, description="Linked surplus detection ID")
    safety_verification_id: str | None = Field(default=None, description="Linked safety verification record ID")
    match_id: str | None = Field(default=None, description="Linked recipient match ID")
    dispatch_id: str | None = Field(default=None, description="Linked logistics dispatch ID")
    recipient_id: str | None = Field(default=None, description="Destination beneficiary ID")
    recipient_name: str | None = Field(default=None, description="Destination beneficiary name")

    # Operational portions and weights
    planned_portions: int = Field(..., ge=0, description="Initial production plan target")
    predicted_demand: int = Field(..., ge=0, description="AI baseline predicted diner headcount")
    actual_consumed: int = Field(..., ge=0, description="Actual meals consumed by institutional diners")
    meals_prepared: int = Field(..., ge=0, description="Actual portions cooked in kitchen")
    surplus_portions: int = Field(..., ge=0, description="Portions remaining post-service")
    surplus_weight_kg: float = Field(..., ge=0.0, description="Weight of initial surplus in kg")
    safely_redistributed_portions: int = Field(..., ge=0, description="Portions delivered to recipient")
    redistributed_weight_kg: float = Field(..., ge=0.0, description="Weight delivered to recipient in kg")
    composted_or_discarded_kg: float = Field(default=0.0, ge=0.0, description="Weight discarded or composted in kg")

    # Operational lifecycle outcomes
    safety_outcome: str = Field(..., description="Internal safety verification result (e.g. Safety Verified, Non-Compliant)")
    redistribution_outcome: str = Field(..., description="Logistics status (e.g. Verified Handoff, In Transit, Cancelled, None)")
    pickup_time_minutes: int | None = Field(default=None, ge=0, description="Elapsed time from dispatch to recipient handoff in minutes")

    # Modelled environmental accounting (explicitly tagged as estimates)
    estimated_co2e_avoided_kg: float = Field(..., ge=0.0, description="Modelled greenhouse gas emissions avoided (kg CO₂e)")
    estimated_water_saved_liters: float = Field(..., ge=0.0, description="Modelled agricultural irrigation water conserved (liters)")
    is_demo_data: bool = Field(default=True, description="Indicates demonstration simulation record")
    notes: str | None = Field(default=None, description="Operational observations or variance explanations")


class ImpactEventCreatePayload(BaseModel):
    """Payload to record a completed meal service outcome event."""
    kitchen_id: str = Field(..., description="Originating institutional kitchen ID")
    meal_slot: str = Field(..., description="Service slot (Breakfast, Lunch, Dinner, Evening Snacks)")
    meal_date: str = Field(..., description="Date of meal service (YYYY-MM-DD)")
    dish_name: str = Field(..., description="Culinary dish name")
    category: SurplusCategory = Field(..., description="Food classification category")
    planned_portions: int = Field(..., ge=0, description="Initial production plan target")
    predicted_demand: int = Field(..., ge=0, description="Predicted diner headcount")
    actual_consumed: int = Field(..., ge=0, description="Diners served")
    meals_prepared: int = Field(..., ge=0, description="Actual meals cooked")
    surplus_portions: int = Field(..., ge=0, description="Portions remaining post-service")
    surplus_weight_kg: float = Field(..., ge=0.0, description="Weight of surplus in kg")
    safely_redistributed_portions: int = Field(default=0, ge=0, description="Portions successfully delivered")
    redistributed_weight_kg: float = Field(default=0.0, ge=0.0, description="Weight delivered in kg")
    composted_or_discarded_kg: float = Field(default=0.0, ge=0.0, description="Weight composted or discarded in kg")
    safety_outcome: str = Field(default="Safety Verified", description="Safety verification outcome")
    redistribution_outcome: str = Field(default="Verified Handoff", description="Redistribution status")
    pickup_time_minutes: int | None = Field(default=22, ge=0, description="Elapsed pickup time in minutes")
    demand_prediction_id: str | None = None
    surplus_id: str | None = None
    safety_verification_id: str | None = None
    match_id: str | None = None
    dispatch_id: str | None = None
    recipient_id: str | None = None
    recipient_name: str | None = None
    notes: str | None = None


class EnvironmentalAssumptions(BaseModel):
    """Transparency schema documenting conversion assumptions for modelled environmental metrics."""
    co2e_factor_kg_per_kg_food: float = Field(
        default=2.2,
        description="Modelled emissions factor (kg CO₂e avoided per kg food diverted from landfill)",
    )
    water_factor_liters_per_kg_food: float = Field(
        default=500.0,
        description="Modelled virtual water footprint (liters conserved per kg cooked food preserved)",
    )
    kg_per_portion_default: float = Field(
        default=0.6,
        description="Standard institutional meal portion weight in kilograms",
    )
    methodology_note: str = Field(
        default=(
            "Modelled estimates derived from published institutional catering lifecycle factors "
            "(IPCC/MoEFCC guidance); not certified physical field measurements."
        ),
        description="Scientific qualification statement",
    )


class ImpactSummaryResponse(BaseModel):
    """Aggregate environmental and operational metrics for FoodLoop dashboard."""
    total_meals_rescued: int = Field(
        ..., ge=0, description="Cumulative nutritious meals delivered to beneficiaries"
    )
    total_kg_waste_diverted: float = Field(
        ..., ge=0.0, description="Cumulative kilograms of organic waste diverted from landfills"
    )
    ghg_avoided_co2e_kg: float = Field(
        ..., ge=0.0, description="Modelled greenhouse gas emissions prevented (kg CO₂e)"
    )
    water_saved_liters: float = Field(
        ..., ge=0.0, description="Modelled agricultural irrigation footprint conserved (liters)"
    )
    beneficiary_count_served: int = Field(
        ..., ge=0, description="Estimated distinct individuals provided nutrition"
    )
    average_kitchen_surplus_reduction_pct: float = Field(
        ..., description="Measured reduction in initial surplus generation rate over baseline"
    )
    surplus_rate_pct: float = Field(
        default=0.0, ge=0.0, le=100.0, description="Proportion of prepared food that became surplus"
    )
    rescue_rate_pct: float = Field(
        default=0.0, ge=0.0, le=100.0, description="Proportion of surplus successfully rescued"
    )
    successful_handoff_count: int = Field(
        default=0, ge=0, description="Count of completed redistribution dispatches"
    )
    failed_or_cancelled_count: int = Field(
        default=0, ge=0, description="Count of cancelled or safety-rejected surplus dispatches"
    )
    average_pickup_time_minutes: float = Field(
        default=0.0, ge=0.0, description="Mean elapsed transit time from dispatch to delivery"
    )
    monthly_trends: list[MonthlyTrendItem] = Field(
        default_factory=list, description="Longitudinal trend dataset"
    )
    category_breakdown: list[CategoryBreakdownItem] = Field(
        default_factory=list, description="Surplus composition breakdown"
    )
    environmental_assumptions: EnvironmentalAssumptions = Field(
        default_factory=EnvironmentalAssumptions,
        description="Documented assumptions for modelled environmental metrics",
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
