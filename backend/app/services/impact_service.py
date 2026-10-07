"""Impact and closed-loop telemetry service layer for FoodLoop AI.

Maintains granular post-service outcome logs, delegates rate and environmental calculations
to ImpactEngine, and returns audit-compliant telemetry for dashboards and reports.
"""
from datetime import datetime, timezone
from app.schemas.impact import (
    ImpactEvent,
    ImpactEventCreatePayload,
    ImpactSummaryResponse,
    MonthlyTrendItem,
)
from app.schemas.surplus import SurplusCategory
from app.services.impact_engine import impact_engine


class ImpactService:
    """Service managing post-service impact logs and aggregate ESG analytics."""

    def __init__(self):
        # Longitudinal demonstration historical monthly trends
        self._monthly_trends: list[MonthlyTrendItem] = [
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
        ]

        # Granular demo outcome events (linked to Phases 4-6 operational entities)
        self._events: list[ImpactEvent] = [
            ImpactEvent(
                event_id="IMP-EVT-01",
                timestamp="2026-10-04 14:30 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Lunch",
                meal_date="2026-10-04",
                dish_name="Jeera Pulao (Long Grain Basmati)",
                category=SurplusCategory.COOKED_GRAINS,
                demand_prediction_id="DEM-2026-1001",
                surplus_id="SUR-0921",
                safety_verification_id="SAF-REC-101",
                match_id="MATCH-801",
                dispatch_id="DSP-2026-106",
                recipient_id="REC-DEMO-01",
                recipient_name="Apna Ghar Night Shelter (Demo Node #42)",
                planned_portions=460,
                predicted_demand=430,
                actual_consumed=400,
                meals_prepared=460,
                surplus_portions=60,
                surplus_weight_kg=36.0,
                safely_redistributed_portions=60,
                redistributed_weight_kg=36.0,
                composted_or_discarded_kg=0.0,
                safety_outcome="Verified Safe",
                redistribution_outcome="Verified Handoff",
                pickup_time_minutes=25,
                estimated_co2e_avoided_kg=79.2,
                estimated_water_saved_liters=18000.0,
                is_demo_data=True,
                notes="Delivered on-time; core holding temperature compliant at 65°C.",
            ),
            ImpactEvent(
                event_id="IMP-EVT-02",
                timestamp="2026-10-04 14:40 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Lunch",
                meal_date="2026-10-04",
                dish_name="Yellow Dal Tadka (Arhar & Moong)",
                category=SurplusCategory.CURRY_DAL,
                demand_prediction_id="DEM-2026-1002",
                surplus_id="SUR-0922",
                safety_verification_id="SAF-REC-102",
                match_id="MATCH-802",
                dispatch_id="DSP-2026-105",
                recipient_id="REC-DEMO-02",
                recipient_name="Asha Deep Community Meal Center (Demo Node)",
                planned_portions=450,
                predicted_demand=415,
                actual_consumed=405,
                meals_prepared=450,
                surplus_portions=45,
                surplus_weight_kg=27.0,
                safely_redistributed_portions=45,
                redistributed_weight_kg=27.0,
                composted_or_discarded_kg=0.0,
                safety_outcome="Verified Safe",
                redistribution_outcome="Verified Handoff",
                pickup_time_minutes=22,
                estimated_co2e_avoided_kg=59.4,
                estimated_water_saved_liters=13500.0,
                is_demo_data=True,
                notes="Beneficiary coordinator confirmed warm receipt; OTP verified.",
            ),
            ImpactEvent(
                event_id="IMP-EVT-03",
                timestamp="2026-10-04 10:15 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Breakfast",
                meal_date="2026-10-04",
                dish_name="Breakfast Idli Batch",
                category=SurplusCategory.COOKED_GRAINS,
                demand_prediction_id="DEM-2026-0998",
                surplus_id="SUR-0920",
                safety_verification_id="SAF-REC-098",
                match_id="MATCH-799",
                dispatch_id="DSP-2026-104",
                recipient_id="REC-DEMO-04",
                recipient_name="Vidya Jyoti Children Home (Demo Node)",
                planned_portions=250,
                predicted_demand=225,
                actual_consumed=220,
                meals_prepared=250,
                surplus_portions=30,
                surplus_weight_kg=18.0,
                safely_redistributed_portions=30,
                redistributed_weight_kg=18.0,
                composted_or_discarded_kg=0.0,
                safety_outcome="Verified Safe",
                redistribution_outcome="Verified Handoff",
                pickup_time_minutes=28,
                estimated_co2e_avoided_kg=39.6,
                estimated_water_saved_liters=9000.0,
                is_demo_data=True,
                notes="Morning surplus rescued before ambient holding degradation.",
            ),
            ImpactEvent(
                event_id="IMP-EVT-04",
                timestamp="2026-10-03 21:30 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Dinner",
                meal_date="2026-10-03",
                dish_name="Subz Biryani (Spiced Vegetables & Rice)",
                category=SurplusCategory.COOKED_GRAINS,
                demand_prediction_id="DEM-2026-0980",
                surplus_id="SUR-0915",
                safety_verification_id="SAF-REC-089",
                match_id="MATCH-782",
                dispatch_id="DSP-2026-095",
                recipient_id="REC-DEMO-03",
                recipient_name="Green Park Community Food Hub (Demo Node)",
                planned_portions=380,
                predicted_demand=340,
                actual_consumed=330,
                meals_prepared=380,
                surplus_portions=50,
                surplus_weight_kg=30.0,
                safely_redistributed_portions=50,
                redistributed_weight_kg=30.0,
                composted_or_discarded_kg=0.0,
                safety_outcome="Verified Safe",
                redistribution_outcome="Verified Handoff",
                pickup_time_minutes=18,
                estimated_co2e_avoided_kg=66.0,
                estimated_water_saved_liters=15000.0,
                is_demo_data=True,
                notes="Smooth evening handoff; rapid 18-minute transit.",
            ),
            ImpactEvent(
                event_id="IMP-EVT-05",
                timestamp="2026-10-03 17:15 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Evening Snacks",
                meal_date="2026-10-03",
                dish_name="Samosa & Mint Chutney Batch",
                category=SurplusCategory.VEGETABLES,
                demand_prediction_id="DEM-2026-0975",
                surplus_id="SUR-0912",
                safety_verification_id="SAF-REC-085",
                match_id=None,
                dispatch_id=None,
                recipient_id=None,
                recipient_name=None,
                planned_portions=150,
                predicted_demand=120,
                actual_consumed=110,
                meals_prepared=150,
                surplus_portions=40,
                surplus_weight_kg=24.0,
                safely_redistributed_portions=0,
                redistributed_weight_kg=0.0,
                composted_or_discarded_kg=24.0,
                safety_outcome="Non-Compliant",
                redistribution_outcome="Composted",
                pickup_time_minutes=None,
                estimated_co2e_avoided_kg=0.0,
                estimated_water_saved_liters=0.0,
                is_demo_data=True,
                notes="Safety gate blocked dispatch due to holding temp dropping below safe limits; directed to institutional composting.",
            ),
        ]

    def get_summary(self) -> ImpactSummaryResponse:
        """Compute aggregate ESG summary across all recorded events."""
        return impact_engine.compute_summary_from_events(
            events=self._events,
            monthly_trends=self._monthly_trends,
        )

    def get_events(
        self, kitchen_id: str | None = None, limit: int = 50
    ) -> list[ImpactEvent]:
        """Return chronological impact events with optional kitchen filter."""
        results = self._events
        if kitchen_id:
            results = [e for e in results if e.kitchen_id == kitchen_id]
        return results[:limit]

    def record_event(self, payload: ImpactEventCreatePayload) -> ImpactEvent:
        """Record a completed meal service outcome event and compute its environmental metrics."""
        next_id = f"IMP-EVT-{len(self._events) + 1:02d}"
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        co2e, water = impact_engine.compute_event_environmental_metrics(
            payload.redistributed_weight_kg
        )

        event = ImpactEvent(
            event_id=next_id,
            timestamp=now_str,
            kitchen_id=payload.kitchen_id,
            meal_slot=payload.meal_slot,
            meal_date=payload.meal_date,
            dish_name=payload.dish_name,
            category=payload.category,
            demand_prediction_id=payload.demand_prediction_id,
            surplus_id=payload.surplus_id,
            safety_verification_id=payload.safety_verification_id,
            match_id=payload.match_id,
            dispatch_id=payload.dispatch_id,
            recipient_id=payload.recipient_id,
            recipient_name=payload.recipient_name,
            planned_portions=payload.planned_portions,
            predicted_demand=payload.predicted_demand,
            actual_consumed=payload.actual_consumed,
            meals_prepared=payload.meals_prepared,
            surplus_portions=payload.surplus_portions,
            surplus_weight_kg=payload.surplus_weight_kg,
            safely_redistributed_portions=payload.safely_redistributed_portions,
            redistributed_weight_kg=payload.redistributed_weight_kg,
            composted_or_discarded_kg=payload.composted_or_discarded_kg,
            safety_outcome=payload.safety_outcome,
            redistribution_outcome=payload.redistribution_outcome,
            pickup_time_minutes=payload.pickup_time_minutes,
            estimated_co2e_avoided_kg=co2e,
            estimated_water_saved_liters=water,
            is_demo_data=True,
            notes=payload.notes,
        )

        self._events.insert(0, event)
        return event


impact_service = ImpactService()
