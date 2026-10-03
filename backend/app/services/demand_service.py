"""Demand service layer for FoodLoop AI.

Provides structured demand forecasting data and connects to the explainable
prediction engine. Separates mathematical baseline logic from API routers.
"""

from app.schemas.demand import (
    DemandInput,
    DemandPredictionResponse,
    RiskSeverity,
    ConfidenceLevel,
)
from app.schemas.menu import MealSlot
from app.services.demand_engine import demand_engine


class DemandService:
    """Service handling institutional kitchen demand predictions and batch cuts."""

    def __init__(self):
        # Structured institutional demonstration store for the daily schedule
        self._demo_records: list[DemandPredictionResponse] = [
            DemandPredictionResponse(
                id="DP-TODAY-01",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.BREAKFAST,
                planned_portions=450,
                predicted_portions=415,
                recommended_prep_portions=432,
                variance_portions=-35,
                variance_pct=-7.8,
                attendance_projected=520,
                historical_baseline_portions=430,
                menu_highlights=[
                    "Poha with Roasted Peanuts",
                    "Boiled Eggs",
                    "Masala Tea",
                    "Seasonal Fruit",
                ],
                key_drivers=[
                    "Early Friday lectures scheduled at 08:00 AM",
                    "Normal mess swipe attendance trend",
                    "Weather: Clear sky, 24°C",
                ],
                reason_codes=["HISTORICAL_SLOT_BENCHMARK", "WEATHER_OPTIMAL"],
                prep_recommendation="Standard batch prep completed with 20 portions buffer.",
                suggested_batch_reduction_kg=8.5,
                risk_severity=RiskSeverity.LOW,
                confidence_level=ConfidenceLevel.MODERATE_SIGNAL,
                is_demo_data=True,
            ),
            DemandPredictionResponse(
                id="DP-TODAY-02",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.LUNCH,
                planned_portions=550,
                predicted_portions=480,
                recommended_prep_portions=499,
                variance_portions=-70,
                variance_pct=-12.7,
                attendance_projected=580,
                historical_baseline_portions=510,
                menu_highlights=[
                    "Jeera Rice",
                    "Yellow Dal Tadka",
                    "Aloo Gobi Matar",
                    "Tawa Roti",
                    "Boondi Raita",
                ],
                key_drivers=[
                    "Department symposium in North Block (lunch served on-site)",
                    "Estimated 65 students opting for external canteen meals",
                    "Historical Friday lunch decline: 11.2%",
                ],
                reason_codes=[
                    "SYMPOSIUM_EXTERNAL_PROVISIONING",
                    "WEEKEND_DEPARTURE_FACTOR",
                    "HISTORICAL_SLOT_BENCHMARK",
                ],
                prep_recommendation=(
                    "Reduce 2nd batch grain preparation by 18 kg. Hold back 12 kg prepped vegetables until 13:00 headcount confirmation."
                ),
                suggested_batch_reduction_kg=18.0,
                risk_severity=RiskSeverity.HIGH,
                confidence_level=ConfidenceLevel.HIGH_SIGNAL,
                is_demo_data=True,
            ),
            DemandPredictionResponse(
                id="DP-TODAY-03",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.SNACKS,
                planned_portions=220,
                predicted_portions=195,
                recommended_prep_portions=203,
                variance_portions=-25,
                variance_pct=-11.4,
                attendance_projected=310,
                historical_baseline_portions=210,
                menu_highlights=[
                    "Vegetable Samosa with Mint Chutney",
                    "Cardamom Tea",
                ],
                key_drivers=["Inter-hostel sports tournament at main grounds"],
                reason_codes=["SPORTS_SCHEDULE_SHIFT", "DEFAULT_SLOT_RATE"],
                prep_recommendation="Bake in two staggered batches of 110 portions rather than a single large batch.",
                suggested_batch_reduction_kg=6.0,
                risk_severity=RiskSeverity.MODERATE,
                confidence_level=ConfidenceLevel.MODERATE_SIGNAL,
                is_demo_data=True,
            ),
            DemandPredictionResponse(
                id="DP-TODAY-04",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.DINNER,
                planned_portions=530,
                predicted_portions=460,
                recommended_prep_portions=478,
                variance_portions=-70,
                variance_pct=-13.2,
                attendance_projected=600,
                historical_baseline_portions=490,
                menu_highlights=[
                    "Paneer Makhani",
                    "Mixed Veg Korma",
                    "Steamed Basmati Rice",
                    "Butter Naan",
                    "Gulab Jamun",
                ],
                key_drivers=[
                    "Friday weekend home departure rate (~15% hostel check-out)",
                    "Student mess leave requests submitted on portal: 62 verified",
                ],
                reason_codes=[
                    "CONFIRMED_PORTAL_LEAVES",
                    "WEEKEND_DEPARTURE_FACTOR",
                    "HISTORICAL_SLOT_BENCHMARK",
                ],
                prep_recommendation=(
                    "Cap initial gravy preparation at 420 portions. Cook backup rice batch only if 20:30 mess swipe threshold exceeds 350."
                ),
                suggested_batch_reduction_kg=22.5,
                risk_severity=RiskSeverity.HIGH,
                confidence_level=ConfidenceLevel.HIGH_SIGNAL,
                is_demo_data=True,
            ),
        ]

    def get_predictions_for_today(
        self, kitchen_id: str | None = None
    ) -> list[DemandPredictionResponse]:
        """Return all scheduled demand predictions for today."""
        if kitchen_id:
            return [r for r in self._demo_records if r.kitchen_id == kitchen_id]
        return self._demo_records

    def predict_demand(self, data: DemandInput) -> DemandPredictionResponse:
        """Execute explainable demand prediction using the dedicated baseline engine."""
        return demand_engine.predict(data)


demand_service = DemandService()
