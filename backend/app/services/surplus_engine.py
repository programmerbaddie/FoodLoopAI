"""Explainable Surplus Detection Engine for FoodLoop AI.

Computes surplus remnants from post-meal kitchen service counts, scales,
and storage holding metrics. Enforces the strict FoodLoop principle:
All surplus remnants require formal food safety verification before any
redistribution matching can occur.
"""

from datetime import datetime
from app.schemas.surplus import (
    SurplusDetectionInput,
    SurplusRecordResponse,
    SurplusCategory,
    SurplusStatus,
)


class SurplusDetectionEngine:
    """Explainable engine for institutional food surplus detection and ledgering."""

    # Configurable operational portion weights (kg/portion) used when scale weight is not provided
    DEFAULT_CATEGORY_PORTION_KG: dict[SurplusCategory, float] = {
        SurplusCategory.COOKED_GRAINS: 0.35,
        SurplusCategory.CURRY_DAL: 0.30,
        SurplusCategory.BREADS_ROTIS: 0.20,
        SurplusCategory.VEGETABLES: 0.25,
        SurplusCategory.DAIRY_DESSERTS: 0.18,
    }

    def detect_surplus(self, data: SurplusDetectionInput) -> SurplusRecordResponse:
        """Compute surplus portions, weight in kg, holding window, and safety flags."""
        reason_codes: list[str] = []

        # 1. Portion Calculations
        surplus_portions = max(0, data.cooked_portions - data.consumed_portions)
        over_cook_vs_planned = data.cooked_portions - data.planned_portions

        reason_codes.append("POST_SERVICE_TALLY")
        if over_cook_vs_planned > 0:
            reason_codes.append("OVER_PREPARED_VS_PLAN")
        elif over_cook_vs_planned < 0:
            reason_codes.append("UNDER_PREPARED_VS_PLAN")

        # 2. Weight Calculation (prefer direct physical scale measurement if supplied)
        if data.remaining_weight_kg is not None and data.remaining_weight_kg > 0:
            quantity_kg = round(data.remaining_weight_kg, 2)
            reason_codes.append("PHYSICAL_SCALE_VERIFIED")
        elif data.cooked_weight_kg is not None and data.cooked_portions > 0:
            kg_per_portion = data.cooked_weight_kg / data.cooked_portions
            quantity_kg = round(surplus_portions * kg_per_portion, 2)
            reason_codes.append("PROPORTIONAL_BATCH_WEIGHT")
        else:
            default_kg = self.DEFAULT_CATEGORY_PORTION_KG.get(data.category, 0.28)
            quantity_kg = round(surplus_portions * default_kg, 2)
            reason_codes.append("CATEGORY_BENCHMARK_WEIGHT")

        # 3. Holding Assessment & Shelf-life Estimation
        if data.holding_temp_c >= 60.0:
            # Maintained at or above FSSAI hot holding standard
            reason_codes.append("HOT_HOLD_STANDARD_MET")
            estimated_shelf_life_hours = 3.0
        else:
            # Temperature danger zone warning: holding below 60°C
            reason_codes.append("TEMPERATURE_BELOW_HOT_HOLD")
            estimated_shelf_life_hours = 1.5

        # 4. Mandatory Food Safety Gate
        reason_codes.append("MANDATORY_SAFETY_CHECK_REQUIRED")

        # 5. Generate human-readable explanation
        variance_explanation = (
            f"Logged {surplus_portions} unconsumed portions ({quantity_kg} kg) from "
            f"{data.cooked_portions} cooked portions. Holding at {data.holding_temp_c}°C in "
            f"'{data.storage_unit}'. Mandatory food safety signoff required prior to redistribution."
        )

        now_str = datetime.now().strftime("%H:%M IST")
        unique_id = f"SUR-{datetime.now().strftime('%m%d%H%M%S')[-6:]}"
        batch_id = f"B-{data.meal_slot.value.upper()[:3]}-{data.category.name[:4]}-{datetime.now().strftime('%H%M')}"

        return SurplusRecordResponse(
            id=unique_id,
            batch_id=batch_id,
            kitchen_id=data.kitchen_id,
            meal_slot=data.meal_slot,
            dish_name=data.dish_name,
            category=data.category,
            quantity_kg=quantity_kg,
            portions_equivalent=surplus_portions,
            prep_timestamp=data.prep_timestamp,
            holding_temp_c=data.holding_temp_c,
            storage_unit=data.storage_unit,
            shelf_life_remaining_hours=estimated_shelf_life_hours,
            status=SurplusStatus.PENDING_VERIFICATION,
            requires_safety_verification=True,
            redistribution_eligible=False,
            detection_timestamp=now_str,
            reason_codes=reason_codes,
            variance_explanation=variance_explanation,
            is_demo_data=False,  # Live detection record
        )


surplus_engine = SurplusDetectionEngine()
