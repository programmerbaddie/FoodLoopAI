"""Matching service layer for FoodLoop AI.

Coordinates candidate recipient registries, deterministic algorithmic match generation,
and match acceptance handoff into redistribution logistics.
"""

from typing import List, Optional
from app.schemas.recipient import (
    OrgType,
    MatchStatus,
    UrgencyLevel,
    RecipientResponse,
    RecipientMatchResponse,
)
from app.schemas.surplus import SurplusStatus
from app.services.matching_engine import matching_engine
from app.services.surplus_service import surplus_service
from app.services.redistribution_service import redistribution_service


class MatchingService:
    """Service evaluating beneficiary capacity, distance-decay routing, and dietary compatibility."""

    def __init__(self):
        # Master candidate beneficiary registry (Explicitly labeled Demonstration Nodes)
        self._demo_recipients: list[RecipientResponse] = [
            RecipientResponse(
                id="REC-DEMO-01",
                recipient_id="REC-DEMO-01",
                name="Apna Ghar Night Shelter (Demo Node #42)",
                organization_name="Apna Ghar Night Shelter (Demo Node #42)",
                org_type=OrgType.NIGHT_SHELTER,
                address="Sarojini Nagar Terminal Cluster, New Delhi",
                contact_person="Ramesh Chander (Shelter Caretaker)",
                phone="+91 98110 02931",
                daily_demand_capacity=90,
                capacity_meals=90,
                dietary_preference="100% Vegetarian Match",
                is_accredited=True,
                service_area="South Delhi - Central Zone",
                approximate_location="Sarojini Nagar (Demo Coord)",
                distance_km=3.8,
                accepted_food_categories=["Cooked Grains", "Curry & Dal", "Vegetables", "Breads & Rotis"],
                current_status="Active",
                is_active=True,
                eligibility_status="Eligible",
                is_demo_data=True,
            ),
            RecipientResponse(
                id="REC-DEMO-02",
                recipient_id="REC-DEMO-02",
                name="Asha Deep Community Meal Center (Demo Node)",
                organization_name="Asha Deep Community Meal Center (Demo Node)",
                org_type=OrgType.COMMUNITY_KITCHEN,
                address="Block 7, Munirka Village, New Delhi",
                contact_person="Sister Mary Kurian",
                phone="+91 98711 44520",
                daily_demand_capacity=100,
                capacity_meals=100,
                dietary_preference="100% Vegetarian Match",
                is_accredited=True,
                service_area="South West Delhi - Munirka",
                approximate_location="Munirka Hub (Demo Coord)",
                distance_km=4.5,
                accepted_food_categories=["Cooked Grains", "Curry & Dal", "Vegetables", "Breads & Rotis"],
                current_status="Active",
                is_active=True,
                eligibility_status="Eligible",
                is_demo_data=True,
            ),
            RecipientResponse(
                id="REC-DEMO-03",
                recipient_id="REC-DEMO-03",
                name="Green Park Community Food Hub (Demo Node)",
                organization_name="Green Park Community Food Hub (Demo Node)",
                org_type=OrgType.COMMUNITY_KITCHEN,
                address="Near Metro Gate 2, Green Park, New Delhi",
                contact_person="Kavita Iyer (Cluster Lead)",
                phone="+91 98991 77312",
                daily_demand_capacity=120,
                capacity_meals=120,
                dietary_preference="Universal Vegetarian",
                is_accredited=True,
                service_area="South Delhi - Green Park",
                approximate_location="Green Park (Demo Coord)",
                distance_km=2.4,
                accepted_food_categories=["Cooked Grains", "Curry & Dal", "Vegetables", "Breads & Rotis"],
                current_status="Active",
                is_active=True,
                eligibility_status="Eligible",
                is_demo_data=True,
            ),
            RecipientResponse(
                id="REC-DEMO-04",
                recipient_id="REC-DEMO-04",
                name="Vidya Jyoti Children Home (Demo Node)",
                organization_name="Vidya Jyoti Children Home (Demo Node)",
                org_type=OrgType.CHILDREN_HOME,
                address="Sector 3, RK Puram, New Delhi",
                contact_person="Father Thomas Varghese",
                phone="+91 98101 22894",
                daily_demand_capacity=50,
                capacity_meals=50,
                dietary_preference="Child-Safe Mild Seasoning",
                is_accredited=True,
                service_area="South Delhi - RK Puram",
                approximate_location="RK Puram (Demo Coord)",
                distance_km=5.1,
                accepted_food_categories=["Cooked Grains", "Breads & Rotis", "Dairy & Desserts"],
                current_status="Active",
                is_active=True,
                eligibility_status="Eligible",
                is_demo_data=True,
            ),
            RecipientResponse(
                id="REC-DEMO-05",
                recipient_id="REC-DEMO-05",
                name="Daryaganj Food Bank & Shelter (Demo Node - Inactive)",
                organization_name="Daryaganj Food Bank & Shelter (Demo Node - Inactive)",
                org_type=OrgType.SHELTER,
                address="Asaf Ali Road, Daryaganj, Old Delhi",
                contact_person="Mohammad Shamim",
                phone="+91 98119 55431",
                daily_demand_capacity=40,
                capacity_meals=40,
                dietary_preference="Vegetarian & Non-Vegetarian",
                is_accredited=False,
                service_area="Central Delhi - Daryaganj",
                approximate_location="Daryaganj (Demo Coord)",
                distance_km=14.5,
                accepted_food_categories=["Cooked Grains"],
                current_status="Inactive",
                is_active=False,
                eligibility_status="Ineligible",
                is_demo_data=True,
            ),
        ]

        # Initial baseline demo matches
        self._matches_cache: list[RecipientMatchResponse] = [
            RecipientMatchResponse(
                id="MATCH-801",
                match_id="MATCH-801",
                surplus_id="SUR-0921",
                dish_name="Jeera Pulao (Long Grain Basmati)",
                portions_available=60,
                recipient_id="REC-DEMO-01",
                recipient_name="Apna Ghar Night Shelter (Demo Node #42)",
                org_type=OrgType.NIGHT_SHELTER,
                distance_km=3.8,
                transit_minutes=18,
                capacity_needed_portions=90,
                dietary_compatibility="100% Vegetarian Match",
                priority_score=96,
                match_score=96,
                urgency_level=UrgencyLevel.IMMEDIATE,
                match_status=MatchStatus.SUGGESTED,
                eligibility=True,
                reasons=[
                    "Safety Gate: Safety Verified with valid holding temp (66°C)",
                    "Proximity: 3.8 km radial distance (~18 mins transit)",
                    "Capacity: 60 portions fit shelter capacity of 90 meals",
                ],
                rank=1,
                estimated_pickup_time="+20 mins (Demo ETA)",
                is_demo_data=True,
            ),
            RecipientMatchResponse(
                id="MATCH-802",
                match_id="MATCH-802",
                surplus_id="SUR-0922",
                dish_name="Yellow Dal Tadka (Arhar & Moong)",
                portions_available=45,
                recipient_id="REC-DEMO-02",
                recipient_name="Asha Deep Community Meal Center (Demo Node)",
                org_type=OrgType.COMMUNITY_KITCHEN,
                distance_km=4.5,
                transit_minutes=22,
                capacity_needed_portions=100,
                dietary_compatibility="100% Vegetarian Match",
                priority_score=91,
                match_score=91,
                urgency_level=UrgencyLevel.PRIORITY,
                match_status=MatchStatus.SUGGESTED,
                eligibility=True,
                reasons=[
                    "Safety Gate: Safety Verified with valid holding temp (64°C)",
                    "Proximity: 4.5 km radial distance (~22 mins transit)",
                    "Capacity: 45 portions fit meal center demand",
                ],
                rank=2,
                estimated_pickup_time="+25 mins (Demo ETA)",
                is_demo_data=True,
            ),
            RecipientMatchResponse(
                id="MATCH-803",
                match_id="MATCH-803",
                surplus_id="SUR-0921",
                dish_name="Jeera Pulao (Long Grain Basmati)",
                portions_available=60,
                recipient_id="REC-DEMO-03",
                recipient_name="Green Park Community Food Hub (Demo Node)",
                org_type=OrgType.COMMUNITY_KITCHEN,
                distance_km=2.4,
                transit_minutes=12,
                capacity_needed_portions=120,
                dietary_compatibility="Universal Vegetarian",
                priority_score=94,
                match_score=94,
                urgency_level=UrgencyLevel.IMMEDIATE,
                match_status=MatchStatus.SUGGESTED,
                eligibility=True,
                reasons=[
                    "Safety Gate: Safety Verified",
                    "Closest proximity: 2.4 km radial distance (~12 mins)",
                    "High distribution volume capacity",
                ],
                rank=1,
                estimated_pickup_time="+15 mins (Demo ETA)",
                is_demo_data=True,
            ),
        ]

    def get_recipients(self) -> list[RecipientResponse]:
        """Return full registry of candidate beneficiary organizations."""
        return self._demo_recipients

    def get_candidate_matches(
        self, surplus_id: Optional[str] = None
    ) -> list[RecipientMatchResponse]:
        """Return prioritized list of suggested beneficiary matches.

        If surplus_id is specified, computes live deterministic matches for that surplus batch.
        """
        if surplus_id:
            surplus = surplus_service.get_surplus_by_id(surplus_id)
            if not surplus:
                return []
            return matching_engine.match_surplus_to_recipients(surplus, self._demo_recipients)

        # If active verified surplus exists, evaluate dynamic matching
        active_verified = [
            s for s in surplus_service.get_all_surplus()
            if s.redistribution_eligible and s.status == SurplusStatus.VERIFIED_SAFE
        ]

        if active_verified:
            dynamic_matches: list[RecipientMatchResponse] = []
            for s in active_verified:
                generated = matching_engine.match_surplus_to_recipients(s, self._demo_recipients)
                dynamic_matches.extend(generated)
            # Filter and sort
            dynamic_matches.sort(key=lambda x: (x.eligibility, x.priority_score), reverse=True)
            return dynamic_matches

        return sorted(self._matches_cache, key=lambda x: x.priority_score, reverse=True)

    def accept_match(self, match_id: str) -> tuple[bool, Optional[RecipientMatchResponse], Optional[str]]:
        """Confirm a suggested match, validate safety gate, and initialize logistics dispatch."""
        # Find candidate match
        target_match: Optional[RecipientMatchResponse] = None
        for m in self._matches_cache:
            if m.id == match_id or m.match_id == match_id:
                target_match = m
                break

        # Check dynamic matches if not found in cache
        if not target_match:
            all_matches = self.get_candidate_matches()
            for m in all_matches:
                if m.id == match_id or m.match_id == match_id:
                    target_match = m
                    break

        if not target_match:
            return False, None, f"Match candidate '{match_id}' not found."

        # Validate associated surplus safety eligibility
        surplus = surplus_service.get_surplus_by_id(target_match.surplus_id)
        if not surplus:
            return False, None, f"Surplus record '{target_match.surplus_id}' no longer exists."

        if not surplus.redistribution_eligible or surplus.status not in (
            SurplusStatus.VERIFIED_SAFE,
            SurplusStatus.MATCHED,
        ):
            return (
                False,
                None,
                f"Surplus '{surplus.dish_name}' is not eligible for redistribution (Current status: {surplus.status.value}). Safety verification required.",
            )

        # Validate recipient status
        recipient = next((r for r in self._demo_recipients if r.id == target_match.recipient_id), None)
        if recipient and not recipient.is_active:
            return False, None, f"Recipient '{recipient.name}' is inactive and cannot accept dispatches."

        # Transition match state
        target_match.match_status = MatchStatus.DRIVER_ASSIGNED

        # Transition surplus state to Matched
        surplus_service.update_status(surplus.id, SurplusStatus.MATCHED)

        # Automatically create logistics dispatch
        dispatch = redistribution_service.create_dispatch_for_match(
            match_id=target_match.id,
            surplus_id=surplus.id,
            recipient_id=target_match.recipient_id,
            recipient_name=target_match.recipient_name,
            dish_name=target_match.dish_name,
            portions=target_match.portions_available,
            destination_address=recipient.address if recipient else "Designated Community Distribution Hub",
        )

        return True, target_match, f"Match confirmed. Dispatch '{dispatch.dispatch_id}' assigned with demo OTP: {dispatch.handover_code}"


matching_service = MatchingService()
