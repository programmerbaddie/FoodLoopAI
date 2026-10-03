"""Executive overview service layer for FoodLoop AI."""
from app.schemas.overview import TodayOverviewResponse


class OverviewService:
    """Service synthesizing real-time operational metrics across all 6 loop phases."""

    def __init__(self):
        self._demo_overview = TodayOverviewResponse(
            facility_name="IIT Delhi Central Dining Complex — Mess B",
            facility_license="FSSAI-LIC-10023011000429",
            meals_planned=1450,
            predicted_demand=1280,
            surplus_risk_portions=170,
            surplus_risk_level="Elevated",
            available_for_rescue=95,
            meals_rescued_today=195,
            waste_diverted_kg=118.0,
            co2e_avoided_kg=260.0,
            active_redistributions_count=2,
            last_updated="Today, 13:45 IST",
            is_demo_data=True,
        )

    def get_today_overview(self) -> TodayOverviewResponse:
        """Return executive KPIs for today's kitchen operations."""
        return self._demo_overview


overview_service = OverviewService()
