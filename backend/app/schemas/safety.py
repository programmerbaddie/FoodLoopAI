"""Safety verification and FSSAI compliance schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field


class ComplianceGrade(str, Enum):
    CERTIFIED_SAFE = "Certified Safe"
    ATTENTION_REQUIRED = "Attention Required"
    NON_COMPLIANT_DISCARD = "Non-Compliant (Discard)"


class SensoryInspection(BaseModel):
    odor_normal: bool = Field(default=True, description="Sensory odor test passed")
    color_normal: bool = Field(default=True, description="Visual appearance test passed")
    texture_normal: bool = Field(
        default=True, description="Consistency and texture test passed"
    )
    sanitary_vessel: bool = Field(
        default=True, description="Holding vessel cleanliness verified"
    )


class SafetyVerificationInput(BaseModel):
    surplus_id: str = Field(..., description="ID of surplus batch being verified")
    core_temp_c: float = Field(..., description="Measured core temperature in °C")
    sensory_inspection: SensoryInspection = Field(
        default_factory=SensoryInspection, description="4-point sensory verification"
    )
    inspector_name: str = Field(..., description="Name of certifying kitchen supervisor")


class SafetyVerificationRecordResponse(BaseModel):
    id: str = Field(..., description="Unique safety record ID")
    surplus_id: str = Field(..., description="Associated surplus ID")
    batch_code: str = Field(..., description="Batch code identifier")
    dish_name: str = Field(..., description="Dish verified")
    inspection_timestamp: str = Field(
        ..., description="Timestamp of safety probe (e.g. 13:30 IST)"
    )
    core_temp_c: float = Field(..., description="Probe temperature reading in °C")
    temp_standard: str = Field(
        default="≥ 60.0°C (Hot Holding)",
        description="Applicable FSSAI temperature standard",
    )
    is_temp_compliant: bool = Field(
        ..., description="Flag indicating temperature meets critical limit"
    )
    hold_time_elapsed_hours: float = Field(
        ..., description="Hours elapsed since preparation completed"
    )
    max_safe_hold_hours: float = Field(
        default=4.0, description="FSSAI statutory room-temperature threshold in hours"
    )
    sensory_inspection: SensoryInspection = Field(
        default_factory=SensoryInspection, description="Sensory checklist results"
    )
    compliance_status: ComplianceGrade = Field(
        ..., description="Final FSSAI safety determination"
    )
    inspector_name: str = Field(..., description="Certifying chef or quality lead")
    digital_certificate_id: str = Field(
        ..., description="Tamper-evident verification token / certificate ID"
    )
    fssai_regulation: str = Field(
        ..., description="Reference standard citation or regulatory condition"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
