"""Recipient beneficiary and matching schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field


class OrgType(str, Enum):
    SHELTER_HOME = "Shelter Home"
    COMMUNITY_KITCHEN = "Community Kitchen"
    NIGHT_SHELTER = "Night Shelter"
    CHILDREN_HOME = "Children Home"
    ELDERLY_CARE = "Elderly Care Center"


class MatchStatus(str, Enum):
    SUGGESTED = "Suggested"
    ACCEPTED = "Accepted"
    DRIVER_ASSIGNED = "Driver Assigned"
    COMPLETED = "Completed"


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
        default=True, description="Verified institutional NGO status"
    )


class RecipientResponse(RecipientBase):
    id: str = Field(..., description="Unique recipient organization ID")
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )


class RecipientMatchResponse(BaseModel):
    id: str = Field(..., description="Unique match candidate ID")
    surplus_id: str = Field(..., description="Associated surplus package ID")
    dish_name: str = Field(..., description="Matched food item description")
    portions_available: int = Field(
        ..., description="Available surplus portion volume"
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
    urgency_level: UrgencyLevel = Field(
        ..., description="Urgency prioritization tier"
    )
    match_status: MatchStatus = Field(
        default=MatchStatus.SUGGESTED, description="Operational match status"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
