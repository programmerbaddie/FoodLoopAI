"""Recipient beneficiary and matching schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field


class OrgType(str, Enum):
    NGO = "NGO"
    COMMUNITY_KITCHEN = "Community Kitchen"
    SHELTER = "Shelter"
    SHELTER_HOME = "Shelter Home"
    FOOD_DISTRIBUTION_CENTER = "Food Distribution Center"
    NIGHT_SHELTER = "Night Shelter"
    CHILDREN_HOME = "Children Home"
    ELDERLY_CARE = "Elderly Care Center"


class MatchStatus(str, Enum):
    SUGGESTED = "Suggested"
    ACCEPTED = "Accepted"
    DRIVER_ASSIGNED = "Driver Assigned"
    PICKUP_IN_PROGRESS = "Pickup In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class UrgencyLevel(str, Enum):
    IMMEDIATE = "Immediate"
    PRIORITY = "Priority"
    FLEXIBLE = "Flexible"


class RecipientBase(BaseModel):
    name: str = Field(..., description="Organization name")
    org_type: OrgType = Field(..., description="Beneficiary category")
    address: str = Field(..., description="Physical drop-off address")
    contact_person: str = Field(..., description="Coordinator on duty")
    phone: str = Field(..., description="Contact phone number")
    daily_demand_capacity: int = Field(
        ..., gt=0, description="Typical meal acceptance capacity per meal slot"
    )
    dietary_preference: str = Field(
        default="Vegetarian", description="Dietary acceptance constraints"
    )
    is_accredited: bool = Field(
        default=True, description="Demonstration onboarding verification status (simulation)"
    )
    service_area: str = Field(
        default="South Delhi - Zone 4", description="Authorized geographic service sector"
    )
    approximate_location: str = Field(
        default="Demo Coordinate Cluster", description="Approximate location for matching"
    )
    distance_km: float = Field(
        default=3.5, description="Radial distance from kitchen in km"
    )
    accepted_food_categories: list[str] = Field(
        default_factory=lambda: ["Cooked Grains", "Curry & Dal", "Breads & Rotis", "Vegetables"],
        description="List of acceptable surplus food categories",
    )
    current_status: str = Field(
        default="Active", description="Operational availability status"
    )
    is_active: bool = Field(
        default=True, description="Active status flag"
    )
    eligibility_status: str = Field(
        default="Eligible", description="Pre-qualification eligibility state"
    )


class RecipientResponse(RecipientBase):
    id: str = Field(..., description="Unique recipient organization ID")
    recipient_id: str | None = Field(default=None, description="Alternative recipient identifier")
    organization_name: str | None = Field(default=None, description="Alternative organization name")
    capacity_meals: int | None = Field(default=None, description="Available portion capacity")
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )


class RecipientMatchResponse(BaseModel):
    id: str = Field(..., description="Unique match candidate ID")
    match_id: str | None = Field(default=None, description="Standardized match candidate ID")
    surplus_id: str = Field(..., description="Associated surplus package ID")
    dish_name: str = Field(..., description="Matched food item description")
    portions_available: int = Field(
        ..., description="Available surplus portion volume"
    )
    recipient_id: str = Field(
        default="REC-DEMO-01", description="Assigned recipient organization ID"
    )
    recipient_name: str = Field(..., description="Assigned recipient organization")
    org_type: OrgType = Field(..., description="Recipient category")
    distance_km: float = Field(
        ..., description="Radial travel distance from kitchen to recipient in km"
    )
    transit_minutes: int = Field(
        ..., description="Estimated travel time based on local traffic"
    )
    capacity_needed_portions: int = Field(
        ..., description="Total diner requirement requested by recipient"
    )
    dietary_compatibility: str = Field(
        ..., description="Evaluation of food type vs recipient dietary needs"
    )
    priority_score: int = Field(
        ..., ge=0, le=100, description="Algorithmic match score (0-100)"
    )
    match_score: int | None = Field(
        default=None, description="Normalized match score baseline (0-100)"
    )
    urgency_level: UrgencyLevel = Field(
        ..., description="Urgency prioritization tier"
    )
    match_status: MatchStatus = Field(
        default=MatchStatus.SUGGESTED, description="Operational match status"
    )
    eligibility: bool = Field(
        default=True, description="Flag indicating safety and logistical match eligibility"
    )
    reasons: list[str] = Field(
        default_factory=list, description="Explainable matching factors and rationale"
    )
    rank: int = Field(
        default=1, description="Priority rank among eligible recipients"
    )
    estimated_pickup_time: str | None = Field(
        default=None, description="Estimated dispatch departure window (Demo)"
    )
    scoring_breakdown: dict[str, float] = Field(
        default_factory=dict, description="Transparent component scores for matching audit"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
