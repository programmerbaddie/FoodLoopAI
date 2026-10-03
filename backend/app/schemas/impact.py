"""Impact and ESG telemetry schemas for FoodLoop AI."""
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


class ImpactSummaryResponse(BaseModel):
    total_meals_rescued: int = Field(
        ..., description="Cumulative nutritious meals delivered to beneficiaries"
    )
    total_kg_waste_diverted: float = Field(
        ..., description="Cumulative kilograms of organic waste diverted from landfills"
    )
    ghg_avoided_co2e_kg: float = Field(
        ..., description="Calculated greenhouse gas emissions prevented (kg CO₂e)"
    )
    water_saved_liters: float = Field(
        ..., description="Embedded agricultural irrigation footprint conserved (liters)"
    )
    beneficiary_count_served: int = Field(
        ..., description="Estimated distinct people provided nutrition"
    )
    average_kitchen_surplus_reduction_pct: float = Field(
        ..., description="Measured reduction in initial surplus generation rate"
    )
    monthly_trends: list[MonthlyTrendItem] = Field(
        default_factory=list, description="Longitudinal trend dataset"
    )
    category_breakdown: list[CategoryBreakdownItem] = Field(
        default_factory=list, description="Surplus composition breakdown"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
