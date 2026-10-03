"""Redistribution logistics and dispatch schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field


class DispatchStage(str, Enum):
    ALLOCATED = "Allocated"
    DRIVER_EN_ROUTE = "Driver En Route"
    PICKED_UP = "Picked Up"
    IN_TRANSIT = "In Transit"
    DELIVERED = "Delivered"
    VERIFIED_HANDOFF = "Verified Handoff"


class HandoverVerificationInput(BaseModel):
    dispatch_id: str = Field(..., description="ID of dispatch being acknowledged")
    otp_code: str = Field(..., description="Recipient provided verification token")


class RedistributionDispatchResponse(BaseModel):
    dispatch_id: str = Field(..., description="Unique logistics tracking code")
    surplus_summary: str = Field(..., description="Summary of food items in cargo")
    portions: int = Field(..., description="Portion count in consignment")
    recipient_name: str = Field(..., description="Destination recipient facility")
    destination_address: str = Field(..., description="Delivery address")
    courier_name: str = Field(..., description="Assigned transport agent")
    vehicle_type: str = Field(..., description="Transport vehicle specification")
    dispatch_time: str = Field(..., description="Departure timestamp")
    eta: str = Field(..., description="Estimated arrival timestamp")
    stage: DispatchStage = Field(..., description="Current logistical progress")
    transit_temp_compliant: bool = Field(
        ..., description="Indicator that cargo remained within thermal limits"
    )
    transit_temp_c: float = Field(
        ..., description="Latest temperature sensor probe in °C"
    )
    handover_code: str = Field(
        ..., description="OTP authorization code for physical custody transfer"
    )
    is_verified: bool = Field(
        ..., description="Flag indicating recipient signed off with valid OTP"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
