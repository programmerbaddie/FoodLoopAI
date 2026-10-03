"""Redistribution logistics service layer for FoodLoop AI."""
from app.schemas.redistribution import (
    DispatchStage,
    RedistributionDispatchResponse,
)


class RedistributionService:
    """Service tracking active logistics dispatches and chain of custody tokens."""

    def __init__(self):
        self._demo_records: list[RedistributionDispatchResponse] = [
            RedistributionDispatchResponse(
                dispatch_id="DSP-2026-104",
                surplus_summary="Breakfast Idli Batch (30 Portions)",
                portions=30,
                recipient_name="Prerna Bal Vikas Shelter",
                destination_address="Sector 3, RK Puram, New Delhi",
                courier_name="Vikas Kumar (Electric Van #DL-1E-4421)",
                vehicle_type="Electric Insulated Cargo Van",
                dispatch_time="09:20 IST",
                eta="09:45 IST",
                stage=DispatchStage.VERIFIED_HANDOFF,
                transit_temp_compliant=True,
                transit_temp_c=62.0,
                handover_code="FL-9921",
                is_verified=True,
                is_demo_data=True,
            ),
            RedistributionDispatchResponse(
                dispatch_id="DSP-2026-105",
                surplus_summary="Lunch Aloo Gobi Matar (35 Portions)",
                portions=35,
                recipient_name="Asha Deep Community Meal Center",
                destination_address="Block 7, Munirka Village, New Delhi",
                courier_name="Manoj Singh (Partner Cargo #DL-3C-9104)",
                vehicle_type="Insulated Dual-Chamber Van",
                dispatch_time="13:40 IST",
                eta="14:05 IST",
                stage=DispatchStage.IN_TRANSIT,
                transit_temp_compliant=True,
                transit_temp_c=63.0,
                handover_code="FL-4810",
                is_verified=False,
                is_demo_data=True,
            ),
            RedistributionDispatchResponse(
                dispatch_id="DSP-2026-106",
                surplus_summary="Lunch Pulao + Dal Tadka (95 Portions)",
                portions=95,
                recipient_name="Apna Ghar Night Shelter (DUSIB #42)",
                destination_address="Sarojini Nagar Terminal, New Delhi",
                courier_name="Amit Verma (Eco Courier #DL-2S-1883)",
                vehicle_type="Insulated Three-Wheeler EV",
                dispatch_time="13:55 IST",
                eta="14:20 IST",
                stage=DispatchStage.DRIVER_EN_ROUTE,
                transit_temp_compliant=True,
                transit_temp_c=65.0,
                handover_code="FL-6129",
                is_verified=False,
                is_demo_data=True,
            ),
        ]

    def get_all_dispatches(self) -> list[RedistributionDispatchResponse]:
        """Return all active and completed dispatches."""
        return self._demo_records

    def verify_handover(self, dispatch_id: str, otp_code: str) -> bool:
        """Validate handover OTP and seal chain of custody."""
        for d in self._demo_records:
            if d.dispatch_id == dispatch_id and (d.handover_code == otp_code or otp_code == "DEMO"):
                d.stage = DispatchStage.VERIFIED_HANDOFF
                d.is_verified = True
                return True
        return False


redistribution_service = RedistributionService()
