"""Demand service layer for FoodLoop AI.

Provides structured demand forecasting data and variance calculation logic.
In this phase, records are returned from structured institutional demonstration
registries and clearly marked as demo data without claiming live AI model output.
"""

from app.schemas.demand import DemandInput, DemandPredictionResponse, RiskSeverity
from app.schemas.menu import MealSlot


class DemandService:
    """Service handling institutional kitchen demand predictions and batch cuts."""

    def __init__(self):
        # Structured institutional demonstration store
        self._demo_records: list[DemandPredictionResponse] = [
            DemandPredictionResponse(
                id="DP-TODAY-01",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.BREAKFAST,
                planned_portions=450,
                predicted_portions=415,
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
                prep_recommendation="Standard batch prep completed with 20 portions buffer.",
                suggested_batch_reduction_kg=8.5,
                risk_severity=RiskSeverity.LOW,
                is_demo_data=True,
            ),
            DemandPredictionResponse(
                id="DP-TODAY-02",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.LUNCH,
                planned_portions=550,
                predicted_portions=480,
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
                prep_recommendation=(
                    "Reduce 2nd batch grain preparation by 18 kg. Hold back 12 kg prepped vegetables until 13:00 headcount confirmation."
                ),
                suggested_batch_reduction_kg=18.0,
                risk_severity=RiskSeverity.HIGH,
                is_demo_data=True,
            ),
            DemandPredictionResponse(
                id="DP-TODAY-03",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.SNACKS,
                planned_portions=220,
                predicted_portions=195,
                variance_portions=-25,
                variance_pct=-11.4,
                attendance_projected=310,
                historical_baseline_portions=210,
                menu_highlights=[
                    "Vegetable Samosa with Mint Chutney",
                    "Cardamom Tea",
                ],
                key_drivers=["Inter-hostel sports tournament at main grounds"],
                prep_recommendation="Bake in two staggered batches of 110 portions rather than a single large batch.",
                suggested_batch_reduction_kg=6.0,
                risk_severity=RiskSeverity.MODERATE,
                is_demo_data=True,
            ),
            DemandPredictionResponse(
                id="DP-TODAY-04",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot=MealSlot.DINNER,
                planned_portions=530,
                predicted_portions=460,
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
                prep_recommendation=(
                    "Cap initial gravy preparation at 420 portions. Cook backup rice batch only if 20:30 mess swipe threshold exceeds 350."
                ),
                suggested_batch_reduction_kg=22.5,
                risk_severity=RiskSeverity.HIGH,
                is_demo_data=True,
            ),
        ]

    def get_predictions_for_today(self, kitchen_id: str | None = None) -> list[DemandPredictionResponse]:
        """Return all scheduled demand predictions for today."""
        if kitchen_id:
            return [r for r in self._demo_records if r.kitchen_id == kitchen_id]
        return self._demo_records

    def calculate_adhoc_forecast(self, data: DemandInput) -> DemandPredictionResponse:
        """Calculate explainable forecast based on headcount and verified leaves."""
        # Explainable heuristic baseline: assumes typical 12% opt-out plus explicit event deductions
        opt_out_factor = 0.12
        if data.special_events:
            opt_out_factor += 0.05

        predicted = int(data.registered_headcount * (1.0 - opt_out_factor))
        variance = predicted - data.planned_portions
        variance_pct = round((variance / data.planned_portions) * 100.0, 1)

        # Average portion weight ~ 250 grams -> 0.25 kg per portion
        reduction_kg = max(0.0, round(abs(variance) * 0.25, 1)) if variance < 0 else 0.0
        severity = RiskSeverity.HIGH if abs(variance_pct) > 12 else (RiskSeverity.MODERATE if abs(variance_pct) > 5 else RiskSeverity.LOW)

        return DemandPredictionResponse(
            id=f"DP-CALC-{data.meal_slot.value.upper()[:3]}",
            kitchen_id=data.kitchen_id,
            meal_slot=data.meal_slot,
            planned_portions=data.planned_portions,
            predicted_portions=predicted,
            variance_portions=variance,
            variance_pct=variance_pct,
            attendance_projected=data.registered_headcount,
            historical_baseline_portions=int(data.registered_headcount * 0.9),
            menu_highlights=["Batch Input Dish"],
            key_drivers=[
                f"Calculated from registered headcount of {data.registered_headcount}",
                f"Events factored: {', '.join(data.special_events) if data.special_events else 'None'}",
            ],
            prep_recommendation=f"Recommended preparation target: {predicted} portions.",
            suggested_batch_reduction_kg=reduction_kg,
            risk_severity=severity,
            is_demo_data=True,
        )


demand_service = DemandService()
