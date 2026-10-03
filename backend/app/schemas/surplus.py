"""Surplus inventory and detection schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field
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


class SurplusRecordResponse(SurplusRecordBase):
    id: str = Field(..., description="Unique surplus tracking ID")
    status: SurplusStatus = Field(
        default=SurplusStatus.DETECTED, description="Operational lifecycle status"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
