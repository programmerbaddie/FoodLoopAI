"""Safety verification and FSSAI compliance schemas for FoodLoop AI."""
from enum import Enum
from pydantic import BaseModel, Field


class ComplianceGrade(str, Enum):
    VERIFIED_SAFE = "Verified Safe"
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


class HoldingType(str, Enum):
    HOT_HOLDING = "Hot Holding"
    COLD_HOLDING = "Cold Holding"
    ROOM_TEMPERATURE = "Room Temperature / Ambient"


class SafetyVerificationInput(BaseModel):
    surplus_id: str = Field(..., description="ID of surplus batch being verified")
    core_temp_c: float | None = Field(
        default=None, description="Measured core temperature in °C (None if probe omitted)"
    )
    holding_type: HoldingType = Field(
        default=HoldingType.HOT_HOLDING, description="Target thermal holding regimen"
    )
    hold_time_elapsed_hours: float | None = Field(
        default=None, ge=0.0, description="Hours elapsed since batch preparation completed"
    )
    sensory_inspection: SensoryInspection = Field(
        default_factory=SensoryInspection, description="4-point sensory verification"
    )
    packaging_sealed: bool = Field(
        default=True, description="Food-grade container lid and seal intact"
    )
    inspector_name: str = Field(..., description="Name of inspecting kitchen supervisor")
    inspector_notes: str | None = Field(
        default=None, description="Optional qualitative notes from inspector"
    )


class SafetyVerificationRecordResponse(BaseModel):
    id: str = Field(..., description="Unique safety record ID")
    surplus_id: str = Field(..., description="Associated surplus ID")
    batch_code: str = Field(..., description="Batch code identifier")
    dish_name: str = Field(..., description="Dish verified")
    inspection_timestamp: str = Field(
        ..., description="Timestamp of safety probe (e.g. 13:30 IST)"
    )
    core_temp_c: float | None = Field(
        default=None, description="Probe temperature reading in °C"
    )
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
        default=4.0,
        description="FoodLoop configurable operational safe holding ceiling in hours (operational best practice, not an FSSAI statutory rule)",
    )
    sensory_inspection: SensoryInspection = Field(
        default_factory=SensoryInspection, description="Sensory checklist results"
    )
    compliance_status: ComplianceGrade = Field(
        ..., description="FoodLoop safety compliance determination against FSSAI hygiene standards"
    )
    redistribution_eligible: bool = Field(
        ...,
        description="Mandatory FoodLoop safety gate: Only True if food strictly passed all compliance checks",
    )
    regulatory_basis: str = Field(
        default="FSS (Licensing & Registration of Food Businesses) Reg. 2011, Schedule 4",
        description="Authoritative statutory standard reference",
    )
    operational_rule: str = Field(
        default="Standard 4.0-hour holding ceiling from batch cooking finish",
        description="Configurable operational threshold reference",
    )
    reason_codes: list[str] = Field(
        default_factory=list,
        description="Machine-readable audit reason codes explaining compliance or failure",
    )
    observations: list[str] = Field(
        default_factory=list,
        description="Human-readable inspector findings and thermal log observations",
    )
    inspector_name: str = Field(..., description="Inspecting chef or quality lead")
    digital_certificate_id: str | None = Field(
        default=None,
        description="FoodLoop internal audit token / verification checksum (internal system tracking token, not an official government/FSSAI certificate)",
    )
    fssai_regulation: str = Field(
        ..., description="Reference standard citation or regulatory condition"
    )
    is_demo_data: bool = Field(
        default=True,
        description="Explicit flag indicating mock/demonstration record",
    )
