"""Menu and meal plan schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field


class MealSlot(str, Enum):
    BREAKFAST = "Breakfast"
    LUNCH = "Lunch"
    SNACKS = "Evening Snacks"
    DINNER = "Dinner"


class DietaryType(str, Enum):
    VEGETARIAN = "Vegetarian"
    VEGAN = "Vegan"
    NON_VEGETARIAN = "Non-Vegetarian"
    EGG_VEG = "Egg-Vegetarian"


class MenuItem(BaseModel):
    item_name: str = Field(..., description="Name of prepared dish")
    category: str = Field(
        ..., description="Culinary category (e.g. Cooked Grains, Dal, Curry, Bakery)"
    )
    portion_size_grams: int = Field(
        ..., gt=0, description="Standard single portion serving weight in grams"
    )
    dietary_type: DietaryType = Field(
        default=DietaryType.VEGETARIAN, description="Dietary classification"
    )


class MealPlanBase(BaseModel):
    kitchen_id: str = Field(..., description="Associated kitchen ID")
    plan_date: str = Field(..., description="Date of meal service (YYYY-MM-DD)")
    meal_slot: MealSlot = Field(..., description="Target service time slot")
    target_portions: int = Field(
        ..., gt=0, description="Nominal number of portions planned to prepare"
    )
    menu_items: list[MenuItem] = Field(
        default_factory=list, description="List of dishes scheduled for this slot"
    )


class MealPlanResponse(MealPlanBase):
    id: str = Field(..., description="Unique meal plan identifier")
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
