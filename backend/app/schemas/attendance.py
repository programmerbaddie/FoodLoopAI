"""Attendance and headcount schemas for FoodLoop AI."""
from pydantic import BaseModel, Field
from app.schemas.menu import MealSlot


class AttendanceForecastBase(BaseModel):
    kitchen_id: str = Field(..., description="Target kitchen ID")
    forecast_date: str = Field(..., description="Service date (YYYY-MM-DD)")
    meal_slot: MealSlot = Field(..., description="Meal service slot")
    registered_headcount: int = Field(
        ..., ge=0, description="Total registered institutional roster count"
    )
    expected_present: int = Field(
        ..., ge=0, description="Estimated attendees present on campus"
    )
    leave_count_verified: int = Field(
        default=0, ge=0, description="Confirmed mess leave requests logged on portal"
    )
    historical_opt_out_pct: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Historical non-attendance opt-out percentage for this weekday",
    )


class AttendanceForecastResponse(AttendanceForecastBase):
    id: str = Field(..., description="Forecast record ID")
    net_expected_diners: int = Field(
        ..., description="Calculated expected diners after leave deductions"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
