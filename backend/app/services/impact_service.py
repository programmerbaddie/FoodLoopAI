"""Impact and closed-loop telemetry service layer for FoodLoop AI."""
from app.schemas.impact import (
    MonthlyTrendItem,
    CategoryBreakdownItem,
    ImpactSummaryResponse,
)
from app.schemas.surplus import SurplusCategory


class ImpactService:
    """Service computing ESG metrics, greenhouse gas avoidance, and longitudinal baseline updates."""

    def __init__(self):
        self._demo_summary = ImpactSummaryResponse(
            total_meals_rescued=4860,
            total_kg_waste_diverted=2916.0,
            ghg_avoided_co2e_kg=6415.0,
            water_saved_liters=1458000.0,
            beneficiary_count_served=3240,
            average_kitchen_surplus_reduction_pct=18.4,
            monthly_trends=[
                MonthlyTrendItem(
                    month="June",
                    planned_portions=38000,
                    actual_consumed_portions=35100,
                    rescued_portions=1950,
                    diverted_kg=1170.0,
                ),
                MonthlyTrendItem(
                    month="July",
                    planned_portions=41000,
                    actual_consumed_portions=38200,
                    rescued_portions=2100,
                    diverted_kg=1260.0,
                ),
                MonthlyTrendItem(
                    month="August",
                    planned_portions=42500,
                    actual_consumed_portions=40100,
                    rescued_portions=1850,
                    diverted_kg=1110.0,
                ),
                MonthlyTrendItem(
                    month="September",
                    planned_portions=43200,
                    actual_consumed_portions=41500,
                    rescued_portions=1420,
                    diverted_kg=852.0,
                ),
            ],
            category_breakdown=[
                CategoryBreakdownItem(
                    category=SurplusCategory.COOKED_GRAINS,
                    percentage=42.0,
                    rescued_kg=1224.0,
                ),
                CategoryBreakdownItem(
                    category=SurplusCategory.CURRY_DAL,
                    percentage=28.0,
                    rescued_kg=816.0,
                ),
                CategoryBreakdownItem(
                    category=SurplusCategory.BREADS_ROTIS,
                    percentage=16.0,
                    rescued_kg=466.0,
                ),
                CategoryBreakdownItem(
                    category=SurplusCategory.VEGETABLES,
                    percentage=10.0,
                    rescued_kg=292.0,
                ),
                CategoryBreakdownItem(
                    category=SurplusCategory.DAIRY_DESSERTS,
                    percentage=4.0,
                    rescued_kg=118.0,
                ),
            ],
            is_demo_data=True,
        )

    def get_summary(self) -> ImpactSummaryResponse:
        """Return cumulative impact and closed-loop learning parameters."""
        return self._demo_summary


impact_service = ImpactService()
