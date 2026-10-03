"""Surplus inventory and detection schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from app.schemas.menu import MealSlot


class SurplusCategory(str, Enum):
    COOKED_GRAINS = "Cooked Grains"
    CURRY_DAL = "Curry & Dal"
    BREADS_ROTIS = "Breads & Rotis"
    VEGETABLES = "Vegetables"
    DAIRY_DESSERTS = "Dairy & Desserts"


class SurplusStatus(str, Enum):
    DETECTED = "Detected"
    PENDING_VERIFICATION = "Pending Verification"
    VERIFIED_SAFE = "Verified Safe"
    MATCHED = "Matched"
    DISPATCHED = "Dispatched"
    COMPOSTED = "Composted"


class SurplusRecordBase(BaseModel):
    batch_id: str = Field(..., description="Kitchen cooking batch identifier")
    kitchen_id: str = Field(..., description="Reporting kitchen ID")
    meal_slot: MealSlot = Field(..., description="Meal service slot")
    dish_name: str = Field(..., description="Dish or recipe name")
    category: SurplusCategory = Field(..., description="Food category")
    quantity_kg: float = Field(..., gt=0.0, description="Measured surplus weight in kilograms")
    portions_equivalent: int = Field(
        ..., gt=0, description="Estimated edible portion equivalents"
    )
    prep_timestamp: str = Field(
        ..., description="Timestamp when cooking completed (e.g. 12:15 IST)"
    )
    holding_temp_c: float = Field(
        ..., description="Temperature recorded at surplus declaration (°C)"
    )
    storage_unit: str = Field(
        ..., description="Current holding vessel or cabinet identifier"
    )
    shelf_life_remaining_hours: float = Field(
        ..., ge=0.0, description="Safe remaining holding window in hours"
    )


class SurplusDetectionInput(BaseModel):
    """Structured input for recording post-service surplus remnants."""
    kitchen_id: str = Field(
        default="KITCHEN-IITD-01", description="Target institutional kitchen identifier"
    )
    meal_slot: MealSlot = Field(..., description="Meal service slot")
    dish_name: str = Field(..., description="Name of dish or food item")
    category: SurplusCategory = Field(..., description="Food category")
    planned_portions: int = Field(..., gt=0, description="Original planned portions")
    cooked_portions: int = Field(..., gt=0, description="Actual portions cooked")
    consumed_portions: int = Field(..., ge=0, description="Actual portions consumed by diners")
    cooked_weight_kg: float | None = Field(
        default=None, gt=0.0, description="Total cooked batch weight in kg"
    )
    remaining_weight_kg: float | None = Field(
        default=None, ge=0.0, description="Direct kitchen scale reading of remnant in kg"
    )
    prep_timestamp: str = Field(
        ..., description="Cooking completion timestamp (e.g. 12:30 IST)"
    )
    holding_temp_c: float = Field(
        ..., description="Observed holding temperature in °C"
    )
    storage_unit: str = Field(
        default="Insulated Hot-Holding Cabinet", description="Storage vessel or holding equipment"
    )

    @field_validator("consumed_portions")
    @classmethod
    def validate_consumed(cls, v: int, info) -> int:
        cooked = info.data.get("cooked_portions")
        if cooked is not None and v > cooked:
            raise ValueError("Consumed portions cannot exceed actual cooked portions.")
        return v


class SurplusRecordResponse(SurplusRecordBase):
    id: str = Field(..., description="Unique surplus tracking ID")
    status: SurplusStatus = Field(
        default=SurplusStatus.DETECTED, description="Operational lifecycle status"
    )
    requires_safety_verification: bool = Field(
        default=True,
        description="Mandatory food safety gate: surplus cannot be matched until verified safe",
    )
    redistribution_eligible: bool = Field(
        default=False,
        description="Whether this surplus has passed safety verification and is cleared for dispatch",
    )
    detection_timestamp: str = Field(
        default="Just now", description="Timestamp when surplus was detected/logged"
    )
    reason_codes: list[str] = Field(
        default_factory=list,
        description="Machine-readable rule codes explaining the surplus variance",
    )
    variance_explanation: str = Field(
        default="",
        description="Human-readable explanation of cooked vs consumed disparity",
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
