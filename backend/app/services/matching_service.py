"""Matching service layer for FoodLoop AI."""
from app.schemas.recipient import (
    OrgType,
    MatchStatus,
    UrgencyLevel,
    RecipientMatchResponse,
)


class MatchingService:
    """Service evaluating beneficiary capacity, distance-decay routing, and dietary compatibility."""

    def __init__(self):
        self._demo_records: list[RecipientMatchResponse] = [
            RecipientMatchResponse(
                id="MATCH-801",
                surplus_id="SUR-0921",
                dish_name="Jeera Pulao + Yellow Dal Tadka",
                portions_available=95,
                recipient_name="Apna Ghar Night Shelter (DUSIB #42)",
                org_type=OrgType.NIGHT_SHELTER,
                distance_km=3.8,
                transit_minutes=18,
                capacity_needed_portions=90,
                dietary_compatibility="100% Vegetarian Match",
                priority_score=96,
                urgency_level=UrgencyLevel.IMMEDIATE,
                match_status=MatchStatus.ACCEPTED,
                is_demo_data=True,
            ),
            RecipientMatchResponse(
                id="MATCH-802",
                surplus_id="SUR-0924",
                dish_name="Aloo Gobi Matar Curry",
                portions_available=35,
                recipient_name="Asha Deep Community Meal Center",
                org_type=OrgType.COMMUNITY_KITCHEN,
                distance_km=4.5,
                transit_minutes=22,
                capacity_needed_portions=40,
                dietary_compatibility="100% Vegetarian Match",
                priority_score=91,
                urgency_level=UrgencyLevel.PRIORITY,
                match_status=MatchStatus.DRIVER_ASSIGNED,
                is_demo_data=True,
            ),
            RecipientMatchResponse(
                id="MATCH-803",
                surplus_id="SUR-0923",
                dish_name="Whole Wheat Rotis",
                portions_available=50,
                recipient_name="Robin Hood Army — Green Park Cluster",
                org_type=OrgType.COMMUNITY_KITCHEN,
                distance_km=2.4,
                transit_minutes=12,
                capacity_needed_portions=60,
                dietary_compatibility="Universal Vegetarian",
                priority_score=88,
                urgency_level=UrgencyLevel.FLEXIBLE,
                match_status=MatchStatus.SUGGESTED,
                is_demo_data=True,
            ),
            RecipientMatchResponse(
                id="MATCH-804",
                surplus_id="SUR-FUTURE-01",
                dish_name="Evening Snacks Batch",
                portions_available=30,
                recipient_name="Vidya Jyoti Children Home",
                org_type=OrgType.CHILDREN_HOME,
                distance_km=5.1,
                transit_minutes=26,
                capacity_needed_portions=35,
                dietary_compatibility="Child-Safe Mild Seasoning",
                priority_score=84,
                urgency_level=UrgencyLevel.FLEXIBLE,
                match_status=MatchStatus.SUGGESTED,
                is_demo_data=True,
            ),
        ]

    def get_candidate_matches(self) -> list[RecipientMatchResponse]:
        """Return prioritized list of suggested beneficiary matches."""
        return sorted(self._demo_records, key=lambda x: x.priority_score, reverse=True)

    def accept_match(self, match_id: str) -> RecipientMatchResponse | None:
        """Confirm a suggested match and transition to driver assignment."""
        for m in self._demo_records:
            if m.id == match_id:
                m.match_status = MatchStatus.DRIVER_ASSIGNED
                return m
        return None


matching_service = MatchingService()
