"""Smart Recipient Matching Engine for FoodLoop AI.

Implements an explainable, deterministic baseline matching algorithm:
- Strict Safety Gate: Only 'Verified Safe' and 'redistribution_eligible=True' surplus batches can enter matching.
- Multi-factor Eligibility Filter: Excludes inactive recipients, category mismatches, capacity shortfalls, and out-of-area locations with explicit reason codes.
- Transparent Match Scoring: Configurable weights across proximity, capacity utilization, shelf-life urgency, and partner accreditation.

NOTE: This is an explainable heuristic baseline designed for institutional kitchen logistics,
NOT a machine learning model. No claim of trained ML accuracy is implied.
"""

from typing import Tuple, List, Dict, Any
from app.schemas.surplus import SurplusRecordResponse, SurplusStatus
from app.schemas.recipient import (
    RecipientResponse,
    RecipientMatchResponse,
    MatchStatus,
    UrgencyLevel,
    OrgType,
)


class RecipientMatchingEngine:
    """Deterministic, explainable recipient matching and eligibility engine."""

    # Configurable service thresholds
    MAX_SERVICE_RADIUS_KM: float = 10.0
    MIN_ACCEPTABLE_HOLD_HOURS: float = 0.5  # Batches with <30 mins hold remaining cannot be matched

    # Transparent scoring weights (sum = 1.0)
    WEIGHT_DISTANCE: float = 0.35
    WEIGHT_CAPACITY: float = 0.30
    WEIGHT_URGENCY: float = 0.25
    WEIGHT_RELIABILITY: float = 0.10

    def check_eligibility(
        self, surplus: SurplusRecordResponse, recipient: RecipientResponse
    ) -> Tuple[bool, List[str], List[str]]:
        """Verify strict safety and logistical eligibility requirements.

        Returns (is_eligible, exclusion_reason_codes, explanation_messages).
        """
        reasons: List[str] = []
        notes: List[str] = []

        # 1. Critical Safety Gate: Must be explicitly verified safe
        if not surplus.redistribution_eligible or surplus.status not in (
            SurplusStatus.VERIFIED_SAFE,
            SurplusStatus.MATCHED,
        ):
            reasons.append("SAFETY_VERIFICATION_REQUIRED")
            notes.append(
                f"Surplus '{surplus.dish_name}' status is '{surplus.status.value}'. "
                "Only surplus verified safe under FSSAI hygiene standards is eligible for redistribution."
            )

        # 2. Recipient Operational Status Gate
        if not recipient.is_active or recipient.current_status.lower() != "active":
            reasons.append("RECIPIENT_INACTIVE")
            notes.append(
                f"Recipient '{recipient.name}' is currently flagged as inactive or unavailable."
            )

        # 3. Category Acceptance Gate
        surplus_cat_str = surplus.category.value if hasattr(surplus.category, "value") else str(surplus.category)
        accepted_cats = [
            c.value if hasattr(c, "value") else str(c)
            for c in recipient.accepted_food_categories
        ]
        if surplus_cat_str not in accepted_cats:
            reasons.append("CATEGORY_NOT_ACCEPTED")
            notes.append(
                f"Recipient does not accept '{surplus_cat_str}'. "
                f"Accepted categories: {', '.join(accepted_cats)}."
            )

        # 4. Capacity Gate
        recipient_cap = recipient.daily_demand_capacity or recipient.capacity_meals or 0
        if recipient_cap < surplus.portions_equivalent:
            reasons.append("CAPACITY_INSUFFICIENT")
            notes.append(
                f"Recipient dinner capacity ({recipient_cap} portions) is insufficient "
                f"for surplus volume ({surplus.portions_equivalent} portions)."
            )

        # 5. Service Area / Distance Gate
        if recipient.distance_km > self.MAX_SERVICE_RADIUS_KM:
            reasons.append("OUTSIDE_SERVICE_AREA")
            notes.append(
                f"Recipient distance ({recipient.distance_km} km) exceeds maximum authorized "
                f"service radius ({self.MAX_SERVICE_RADIUS_KM} km)."
            )

        is_eligible = len(reasons) == 0
        if is_eligible:
            reasons.append("ALL_CRITERIA_SATISFIED")
            notes.append("Batch satisfies safety, category, capacity, and proximity criteria.")

        return is_eligible, reasons, notes

    def calculate_match_score(
        self, surplus: SurplusRecordResponse, recipient: RecipientResponse
    ) -> Tuple[int, Dict[str, float], List[str]]:
        """Compute transparent, deterministic match score (0-100)."""
        # Distance score (35%): closer distance yields higher score
        dist_factor = max(0.0, 1.0 - (recipient.distance_km / self.MAX_SERVICE_RADIUS_KM))
        score_distance = round(dist_factor * 100.0, 1)

        # Capacity fit score (30%): ratio of portions to recipient demand
        recipient_cap = recipient.daily_demand_capacity or recipient.capacity_meals or 100
        cap_ratio = min(1.0, surplus.portions_equivalent / max(1, recipient_cap))
        score_capacity = round(cap_ratio * 100.0, 1)

        # Urgency / remaining shelf-life score (25%)
        remaining_hours = surplus.shelf_life_remaining_hours or 2.0
        if remaining_hours <= 1.5:
            # Short safe window: urgent dispatch needed to close recipient
            score_urgency = 98.0 if recipient.distance_km <= 5.0 else 70.0
        elif remaining_hours <= 2.5:
            score_urgency = 88.0
        else:
            score_urgency = 78.0

        # Onboarding verification / compliance score (10%)
        score_reliability = 100.0 if recipient.is_accredited else 75.0

        # Weighted composite score
        composite = (
            score_distance * self.WEIGHT_DISTANCE
            + score_capacity * self.WEIGHT_CAPACITY
            + score_urgency * self.WEIGHT_URGENCY
            + score_reliability * self.WEIGHT_RELIABILITY
        )
        final_score = int(round(min(100.0, max(0.0, composite))))

        breakdown = {
            "distance_score": score_distance,
            "capacity_fit_score": score_capacity,
            "urgency_score": score_urgency,
            "reliability_score": score_reliability,
            "composite_score": float(final_score),
        }

        reasons = [
            f"Proximity: {recipient.distance_km} km ({int(score_distance)}/100)",
            f"Capacity Fit: {surplus.portions_equivalent}/{recipient_cap} portions ({int(score_capacity)}/100)",
            f"Safe Hold Window: {remaining_hours}h remaining ({int(score_urgency)}/100)",
        ]

        return final_score, breakdown, reasons

    def match_surplus_to_recipients(
        self,
        surplus: SurplusRecordResponse,
        recipients: List[RecipientResponse],
    ) -> List[RecipientMatchResponse]:
        """Evaluate surplus against all candidate recipients and return sorted matches."""
        matches: List[RecipientMatchResponse] = []

        for rec in recipients:
            is_eligible, exclusion_codes, explanations = self.check_eligibility(surplus, rec)

            if not is_eligible:
                # Retain in response with eligibility=False for transparency and auditability
                matches.append(
                    RecipientMatchResponse(
                        id=f"MATCH-INELIGIBLE-{surplus.id[-4:]}-{rec.id[-4:]}",
                        match_id=f"MATCH-INELIGIBLE-{surplus.id[-4:]}-{rec.id[-4:]}",
                        surplus_id=surplus.id,
                        dish_name=surplus.dish_name,
                        portions_available=surplus.portions_equivalent,
                        recipient_id=rec.id,
                        recipient_name=rec.name,
                        org_type=rec.org_type,
                        distance_km=rec.distance_km,
                        transit_minutes=int(round(rec.distance_km * 4.5 + 5)),
                        capacity_needed_portions=rec.daily_demand_capacity or rec.capacity_meals or 50,
                        dietary_compatibility=rec.dietary_preference,
                        priority_score=0,
                        match_score=0,
                        urgency_level=UrgencyLevel.FLEXIBLE,
                        match_status=MatchStatus.SUGGESTED,
                        eligibility=False,
                        reasons=exclusion_codes + explanations,
                        rank=999,
                        estimated_pickup_time=None,
                        scoring_breakdown={"ineligible": 1.0},
                        is_demo_data=True,
                    )
                )
                continue

            score, breakdown, score_reasons = self.calculate_match_score(surplus, rec)
            transit_mins = int(round(rec.distance_km * 4.5 + 5))
            urgency = (
                UrgencyLevel.IMMEDIATE
                if (surplus.shelf_life_remaining_hours or 2.0) <= 1.5
                else UrgencyLevel.PRIORITY
                if (surplus.shelf_life_remaining_hours or 2.0) <= 2.5
                else UrgencyLevel.FLEXIBLE
            )

            match_id = f"MATCH-{surplus.id[-4:]}-{rec.id[-4:]}"
            matches.append(
                RecipientMatchResponse(
                    id=match_id,
                    match_id=match_id,
                    surplus_id=surplus.id,
                    dish_name=surplus.dish_name,
                    portions_available=surplus.portions_equivalent,
                    recipient_id=rec.id,
                    recipient_name=rec.name,
                    org_type=rec.org_type,
                    distance_km=rec.distance_km,
                    transit_minutes=transit_mins,
                    capacity_needed_portions=rec.daily_demand_capacity or rec.capacity_meals or 50,
                    dietary_compatibility=f"{rec.dietary_preference} Match",
                    priority_score=score,
                    match_score=score,
                    urgency_level=urgency,
                    match_status=MatchStatus.SUGGESTED,
                    eligibility=True,
                    reasons=score_reasons,
                    rank=1,  # updated after sort
                    estimated_pickup_time=f"+{transit_mins + 10} mins (Demo ETA)",
                    scoring_breakdown=breakdown,
                    is_demo_data=True,
                )
            )

        # Sort: eligible matches by score descending, then ineligible
        eligible_matches = [m for m in matches if m.eligibility]
        ineligible_matches = [m for m in matches if not m.eligibility]

        eligible_matches.sort(key=lambda x: x.priority_score, reverse=True)
        for idx, m in enumerate(eligible_matches, start=1):
            m.rank = idx

        return eligible_matches + ineligible_matches


matching_engine = RecipientMatchingEngine()
