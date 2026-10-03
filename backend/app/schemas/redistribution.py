"""Redistribution logistics and dispatch schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field


class DispatchStage(str, Enum):
    MATCHED = "Matched"
    ALLOCATED = "Allocated"
    DRIVER_ASSIGNED = "Driver Assigned"
    DRIVER_EN_ROUTE = "Driver En Route"
    PICKUP_IN_PROGRESS = "Pickup In Progress"
    PICKED_UP = "Picked Up"
    IN_TRANSIT = "In Transit"
    DELIVERED = "Delivered"
    OTP_VERIFIED = "OTP Verified"
    VERIFIED_HANDOFF = "Verified Handoff"
    REDISTRIBUTED = "Redistributed"
    CANCELLED = "Cancelled"


class HandoverVerificationInput(BaseModel):
    dispatch_id: str = Field(..., description="ID of dispatch being acknowledged")
    otp_code: str = Field(..., description="Recipient provided verification token (Demo OTP)")


class RedistributionDispatchResponse(BaseModel):
    dispatch_id: str = Field(..., description="Unique logistics tracking code")
    match_id: str | None = Field(default=None, description="Originating match identifier")
    surplus_id: str | None = Field(default=None, description="Originating surplus batch ID")
    recipient_id: str | None = Field(default=None, description="Destination recipient facility ID")
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
        ..., description="Demo OTP authorization code for physical custody transfer"
    )
    is_verified: bool = Field(
        ..., description="Flag indicating recipient signed off with valid OTP"
    )
    verification_timestamp: str | None = Field(
        default=None, description="Timestamp when OTP verification succeeded"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
