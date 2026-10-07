"""Deterministic calculation engine for operational and environmental impact metrics.

Translates post-service event logs into transparent, explainable KPIs.
All environmental figures are explicitly qualified as modelled estimates based on
regional lifecycle factors.
"""
from app.schemas.impact import (
    ImpactEvent,
    ImpactSummaryResponse,
    CategoryBreakdownItem,
    MonthlyTrendItem,
    EnvironmentalAssumptions,
)
from app.schemas.surplus import SurplusCategory


class ImpactEngine:
    """Computes operational diversion efficiency and modelled environmental offsets."""

    def __init__(
        self,
        co2e_factor_kg_per_kg: float = 2.2,
        water_factor_liters_per_kg: float = 500.0,
        kg_per_portion: float = 0.6,
    ):
        self.co2e_factor = co2e_factor_kg_per_kg
        self.water_factor = water_factor_liters_per_kg
        self.kg_per_portion = kg_per_portion

    def compute_event_environmental_metrics(
        self, diverted_kg: float
    ) -> tuple[float, float]:
        """Calculate modelled CO2e avoided and virtual water conserved for a given weight."""
        safe_kg = max(0.0, float(diverted_kg))
        co2e = round(safe_kg * self.co2e_factor, 2)
        water = round(safe_kg * self.water_factor, 1)
        return co2e, water

    def compute_summary_from_events(
        self,
        events: list[ImpactEvent],
        monthly_trends: list[MonthlyTrendItem] | None = None,
    ) -> ImpactSummaryResponse:
        """Aggregate operational outcomes and calculate composite rates with zero-safety."""
        if not events:
            return ImpactSummaryResponse(
                total_meals_rescued=0,
                total_kg_waste_diverted=0.0,
                ghg_avoided_co2e_kg=0.0,
                water_saved_liters=0.0,
                beneficiary_count_served=0,
                average_kitchen_surplus_reduction_pct=0.0,
                surplus_rate_pct=0.0,
                rescue_rate_pct=0.0,
                successful_handoff_count=0,
                failed_or_cancelled_count=0,
                average_pickup_time_minutes=0.0,
                monthly_trends=monthly_trends or [],
                category_breakdown=[],
                environmental_assumptions=EnvironmentalAssumptions(
                    co2e_factor_kg_per_kg_food=self.co2e_factor,
                    water_factor_liters_per_kg_food=self.water_factor,
                    kg_per_portion_default=self.kg_per_portion,
                ),
                is_demo_data=True,
            )

        total_meals_rescued = sum(e.safely_redistributed_portions for e in events)
        total_kg_waste_diverted = round(sum(e.redistributed_weight_kg for e in events), 1)
        total_prepared = sum(e.meals_prepared for e in events)
        total_surplus = sum(e.surplus_portions for e in events)

        # Environmental offsets (modelled estimates)
        ghg_avoided_co2e_kg, water_saved_liters = self.compute_event_environmental_metrics(
            total_kg_waste_diverted
        )

        # Rates (safe against zero-division)
        surplus_rate = (
            round((total_surplus / total_prepared) * 100, 1)
            if total_prepared > 0
            else 0.0
        )
        rescue_rate = (
            round((total_meals_rescued / total_surplus) * 100, 1)
            if total_surplus > 0
            else 0.0
        )

        # Successful vs failed handoff counts
        successful_handoffs = sum(
            1 for e in events if e.redistribution_outcome in {"Verified Handoff", "Completed"}
        )
        failed_or_cancelled = sum(
            1
            for e in events
            if e.redistribution_outcome in {"Cancelled", "Failed", "Composted", "Disposed"}
            or e.safety_outcome in {"Non-Compliant", "Disposed"}
        )

        # Average pickup time
        pickup_times = [
            e.pickup_time_minutes for e in events if e.pickup_time_minutes is not None and e.pickup_time_minutes > 0
        ]
        avg_pickup = round(sum(pickup_times) / len(pickup_times), 1) if pickup_times else 0.0

        # Category breakdown
        cat_weights: dict[SurplusCategory, float] = {}
        for e in events:
            cat_weights[e.category] = cat_weights.get(e.category, 0.0) + e.redistributed_weight_kg

        category_breakdown: list[CategoryBreakdownItem] = []
        for cat, weight in cat_weights.items():
            pct = (
                round((weight / total_kg_waste_diverted) * 100, 1)
                if total_kg_waste_diverted > 0
                else 0.0
            )
            category_breakdown.append(
                CategoryBreakdownItem(
                    category=cat,
                    percentage=pct,
                    rescued_kg=round(weight, 1),
                )
            )

        # Sort category breakdown descending by weight
        category_breakdown.sort(key=lambda c: c.rescued_kg, reverse=True)

        # Estimated distinct beneficiaries (institutional assumption: 1.5 portions/person on average)
        beneficiaries = int(total_meals_rescued // 1.5) if total_meals_rescued > 0 else 0

        # Kitchen baseline surplus reduction (modelled demo benchmark: 18.4%)
        reduction_pct = 18.4

        return ImpactSummaryResponse(
            total_meals_rescued=total_meals_rescued,
            total_kg_waste_diverted=total_kg_waste_diverted,
            ghg_avoided_co2e_kg=ghg_avoided_co2e_kg,
            water_saved_liters=water_saved_liters,
            beneficiary_count_served=beneficiaries,
            average_kitchen_surplus_reduction_pct=reduction_pct,
            surplus_rate_pct=surplus_rate,
            rescue_rate_pct=rescue_rate,
            successful_handoff_count=successful_handoffs,
            failed_or_cancelled_count=failed_or_cancelled,
            average_pickup_time_minutes=avg_pickup,
            monthly_trends=monthly_trends or [],
            category_breakdown=category_breakdown,
            environmental_assumptions=EnvironmentalAssumptions(
                co2e_factor_kg_per_kg_food=self.co2e_factor,
                water_factor_liters_per_kg_food=self.water_factor,
                kg_per_portion_default=self.kg_per_portion,
            ),
            is_demo_data=True,
        )


impact_engine = ImpactEngine()
