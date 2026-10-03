"""Explainable Demand Prediction Baseline Engine for FoodLoop AI.

This module implements a transparent, multi-factor statistical baseline to estimate
institutional dining demand without claiming black-box machine learning accuracy.
It is engineered to be modular so that a trained Scikit-learn regression model
can drop in seamlessly in subsequent phases.
"""

from datetime import datetime
from app.schemas.demand import (
    DemandInput,
    DemandPredictionResponse,
    RiskSeverity,
    ConfidenceLevel,
)
from app.schemas.menu import MealSlot


class DemandPredictionEngine:
    """Explainable statistical baseline engine for institutional meal forecasting."""

    # Default baseline turnout rates per meal slot when historical telemetry is not yet established
    DEFAULT_SLOT_RATES: dict[MealSlot, float] = {
        MealSlot.BREAKFAST: 0.80,  # ~20% skip or wake up late
        MealSlot.LUNCH: 0.86,      # ~14% attend outside or lunch provided in labs
        MealSlot.SNACKS: 0.62,     # ~38% skip evening snacks
        MealSlot.DINNER: 0.82,     # ~18% dine off-campus or skip
    }

    def predict(self, data: DemandInput) -> DemandPredictionResponse:
        """Compute an explainable, audit-ready forecast from structured inputs."""
        drivers: list[str] = []
        reason_codes: list[str] = []

        # 1. Net Eligible Headcount (deducting verified portal leaves)
        eligible_headcount = max(0, data.registered_headcount - data.confirmed_leaves)
        if data.confirmed_leaves > 0:
            drivers.append(
                f"Deducted {data.confirmed_leaves} verified leave requests from registered {data.registered_headcount} headcount."
            )
            reason_codes.append("CONFIRMED_PORTAL_LEAVES")
        else:
            drivers.append(
                f"Full registered headcount of {data.registered_headcount} considered (zero portal leaves logged)."
            )

        # 2. Slot Turnout Rate
        if data.historical_consumption_rate is not None:
            turnout_rate = data.historical_consumption_rate
            drivers.append(
                f"Using verified historical turnout benchmark: {round(turnout_rate * 100, 1)}%."
            )
            reason_codes.append("HISTORICAL_SLOT_BENCHMARK")
        else:
            turnout_rate = self.DEFAULT_SLOT_RATES.get(data.meal_slot, 0.82)
            drivers.append(
                f"Applied default institutional baseline for {data.meal_slot.value}: {round(turnout_rate * 100, 1)}% turnout."
            )
            reason_codes.append("DEFAULT_SLOT_RATE")

        # 3. Day of Week Adjustment
        day_str = data.day_of_week
        if not day_str:
            try:
                parsed_date = datetime.strptime(data.plan_date, "%Y-%m-%d")
                day_str = parsed_date.strftime("%A")
            except ValueError:
                day_str = "Friday"  # Fallback default

        day_factor = 1.00
        if day_str in ("Friday", "Fri"):
            if data.meal_slot in (MealSlot.LUNCH, MealSlot.DINNER):
                day_factor = 0.90
                drivers.append("Friday weekend home departures: -10.0% attendance factor applied.")
                reason_codes.append("WEEKEND_DEPARTURE_FACTOR")
        elif day_str in ("Saturday", "Sunday", "Sat", "Sun"):
            day_factor = 0.85
            drivers.append(f"{day_str} weekend off-peak dining: -15.0% baseline factor applied.")
            reason_codes.append("WEEKEND_OFF_PEAK")
        elif day_str in ("Monday", "Mon"):
            day_factor = 0.98
            reason_codes.append("MONDAY_START_WEEK")

        # 4. Special Event Adjustments
        event_penalty = 0.0
        if data.special_events:
            for event in data.special_events:
                ev_lower = event.lower()
                if "symposium" in ev_lower or "conference" in ev_lower:
                    event_penalty += 0.12
                    drivers.append(f"Event '{event}': -12% due to external lunch provisioning.")
                    reason_codes.append("SYMPOSIUM_EXTERNAL_PROVISIONING")
                elif "exam" in ev_lower or "midterm" in ev_lower:
                    event_penalty += 0.08
                    drivers.append(f"Event '{event}': -8% early examination departure.")
                    reason_codes.append("EXAM_SCHEDULE_SHIFT")
                elif "sports" in ev_lower or "tournament" in ev_lower:
                    event_penalty += 0.06
                    drivers.append(f"Event '{event}': -6% shift to outdoor sports field.")
                    reason_codes.append("SPORTS_SCHEDULE_SHIFT")
                elif "holiday" in ev_lower or "fest" in ev_lower:
                    event_penalty += 0.25
                    drivers.append(f"Event '{event}': -25% major campus vacation drop.")
                    reason_codes.append("HOLIDAY_VACATION_DROP")
                else:
                    event_penalty += 0.04
                    drivers.append(f"Event '{event}': -4% attendance adjustment.")
                    reason_codes.append("GENERIC_EVENT_MODIFIER")

        # 5. Weather Modifier
        weather_factor = 1.00
        if data.weather_context:
            w_lower = data.weather_context.lower()
            if "rain" in w_lower or "storm" in w_lower:
                weather_factor = 0.94
                drivers.append(f"Weather '{data.weather_context}': -6% walk-in reduction from distant hostel blocks.")
                reason_codes.append("INCLEMENT_WEATHER_DECAY")
            elif "heat" in w_lower:
                weather_factor = 0.96
                drivers.append(f"Weather '{data.weather_context}': -4% appetite/beverage shift.")
                reason_codes.append("EXTREME_HEAT_DECAY")

        # 6. Raw Predicted Diners
        combined_rate = turnout_rate * day_factor * max(0.4, 1.0 - event_penalty) * weather_factor
        raw_predicted = int(round(eligible_headcount * combined_rate))
        predicted_portions = max(1, min(raw_predicted, int(data.planned_portions * 1.5)))

        # 7. Recommended Preparation Quantity (with non-stockout safe buffer of 4%)
        # Institutional safety rule: never cook precisely the bare predicted number to protect against sudden walk-ins
        recommended_prep = int(round(predicted_portions * 1.04))

        # 8. Variance vs Kitchen Baseline Plan
        variance_portions = predicted_portions - data.planned_portions
        variance_pct = round((variance_portions / data.planned_portions) * 100.0, 1)

        # 9. Batch Prep Reduction in kg (assume ~250g cooked portion weight -> 0.25 kg/portion)
        if variance_portions < 0:
            suggested_batch_reduction_kg = round(abs(variance_portions) * 0.25, 1)
        else:
            suggested_batch_reduction_kg = 0.0

        # 10. Risk Severity Assessment
        if variance_pct <= -15.0 or suggested_batch_reduction_kg >= 16.0:
            risk_severity = RiskSeverity.HIGH
            prep_advice = (
                f"Elevated surplus risk (-{abs(variance_portions)} portions). Hold back {suggested_batch_reduction_kg} kg "
                f"of raw prep. Stagger cooking into two batches; cap initial batch at {recommended_prep} portions."
            )
        elif variance_pct <= -6.0 or suggested_batch_reduction_kg >= 6.0:
            risk_severity = RiskSeverity.MODERATE
            prep_advice = (
                f"Moderate surplus risk. Target initial preparation at {recommended_prep} portions "
                f"(reducing batch by {suggested_batch_reduction_kg} kg). Release backup batch only if swipe threshold exceeds 80%."
            )
        else:
            risk_severity = RiskSeverity.LOW
            prep_advice = (
                f"Balanced service. Prepare planned volume with standard buffer ({recommended_prep} portions recommended)."
            )

        # 11. Honest Quality/Confidence Signal
        if data.confirmed_leaves > 0 and data.historical_consumption_rate is not None and data.weather_context:
            confidence = ConfidenceLevel.HIGH_SIGNAL
        elif data.confirmed_leaves > 0 or data.historical_consumption_rate is not None:
            confidence = ConfidenceLevel.MODERATE_SIGNAL
        else:
            confidence = ConfidenceLevel.BASELINE_HEURISTIC

        slot_code = data.meal_slot.value.upper()[:3]
        prediction_id = f"DP-EST-{slot_code}-{datetime.now().strftime('%H%M%S')}"

        return DemandPredictionResponse(
            id=prediction_id,
            kitchen_id=data.kitchen_id,
            meal_slot=data.meal_slot,
            planned_portions=data.planned_portions,
            predicted_portions=predicted_portions,
            recommended_prep_portions=recommended_prep,
            variance_portions=variance_portions,
            variance_pct=variance_pct,
            attendance_projected=eligible_headcount,
            historical_baseline_portions=int(round(data.registered_headcount * turnout_rate)),
            menu_highlights=["Batch Preparation Schedule"],
            key_drivers=drivers,
            reason_codes=reason_codes,
            prep_recommendation=prep_advice,
            suggested_batch_reduction_kg=suggested_batch_reduction_kg,
            risk_severity=risk_severity,
            confidence_level=confidence,
            is_demo_data=False,  # This prediction was computed dynamically by the engine
        )


demand_engine = DemandPredictionEngine()
