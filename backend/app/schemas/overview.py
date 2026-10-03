"""Executive overview schemas for FoodLoop AI."""
from pydantic import BaseModel, Field


class TodayOverviewResponse(BaseModel):
    facility_name: str = Field(..., description="Reporting kitchen facility name")
    facility_license: str = Field(..., description="FSSAI registration code")
    meals_planned: int = Field(..., description="Planned meal volume today in portions")
    predicted_demand: int = Field(
        ..., description="Forecasted total diner demand in portions"
    )
    surplus_risk_portions: int = Field(
        ..., description="Projected portions in excess of demand"
    )
    surplus_risk_level: str = Field(
        ..., description="Qualitative surplus risk assessment"
    )
    available_for_rescue: int = Field(
        ..., description="Surplus verified safe and ready for allocation"
    )
    meals_rescued_today: int = Field(
        ..., description="Meals already delivered to beneficiaries today"
    )
    waste_diverted_kg: float = Field(
        ..., description="Weight of food diverted from municipal waste today"
    )
    co2e_avoided_kg: float = Field(
        ..., description="Avoided methane/GHG emissions today in kg CO₂e"
    )
    active_redistributions_count: int = Field(
        ..., description="Active transport vehicles currently in transit"
    )
    last_updated: str = Field(
        ..., description="Timestamp of telemetry refresh (e.g. Today, 13:45 IST)"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
