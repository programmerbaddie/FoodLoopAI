"""Kitchen and facility schemas for FoodLoop AI."""
from pydantic import BaseModel, Field


class KitchenBase(BaseModel):
    name: str = Field(..., description="Institutional facility name")
    facility_type: str = Field(
        default="Institutional Mess",
        description="Type of kitchen (e.g. University Mess, Hospital, Processing Unit)",
    )
    daily_capacity: int = Field(
        ..., gt=0, description="Nominal daily meal preparation capacity"
    )
    license_number: str = Field(..., description="FSSAI or institutional license number")
    location: str = Field(..., description="Physical campus or facility address")
    contact_email: str | None = Field(default=None, description="Operations contact email")


class KitchenResponse(KitchenBase):
    id: str = Field(..., description="Unique kitchen identifier")
    is_active: bool = Field(default=True, description="Operational status flag")
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
