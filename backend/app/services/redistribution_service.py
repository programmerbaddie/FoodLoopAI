"""Redistribution logistics service layer for FoodLoop AI.

Manages custody handoff verification, driver dispatches, and secure demo OTP validation.
"""
from datetime import datetime
import random
from app.schemas.redistribution import (
    DispatchStage,
    RedistributionDispatchResponse,
)
from app.schemas.surplus import SurplusStatus
from app.services.surplus_service import surplus_service


class RedistributionService:
    """Service tracking active logistics dispatches and chain of custody tokens."""

    def __init__(self):
        self._demo_records: list[RedistributionDispatchResponse] = [
            RedistributionDispatchResponse(
                dispatch_id="DSP-2026-104",
                surplus_id="SUR-0925",
                recipient_id="REC-DEMO-04",
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
                verification_timestamp="09:48 IST",
                is_demo_data=True,
            ),
            RedistributionDispatchResponse(
                dispatch_id="DSP-2026-105",
                surplus_id="SUR-0924",
                recipient_id="REC-DEMO-02",
                surplus_summary="Lunch Aloo Gobi Matar (35 Portions)",
                portions=35,
                recipient_name="Asha Deep Community Meal Center (Demo Node)",
                destination_address="Block 7, Munirka Village, New Delhi",
                courier_name="Manoj Singh (Demo Cargo #DL-3C-9104)",
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
                surplus_id="SUR-0921",
                recipient_id="REC-DEMO-01",
                surplus_summary="Lunch Pulao + Dal Tadka (95 Portions)",
                portions=95,
                recipient_name="Apna Ghar Night Shelter (Demo Node #42)",
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

    def get_dispatch_by_id(self, dispatch_id: str) -> RedistributionDispatchResponse | None:
        """Find dispatch record by ID."""
        for d in self._demo_records:
            if d.dispatch_id == dispatch_id:
                return d
        return None

    def create_dispatch_for_match(
        self,
        match_id: str,
        surplus_id: str,
        recipient_id: str,
        recipient_name: str,
        dish_name: str,
        portions: int,
        destination_address: str = "Designated Community Distribution Hub",
    ) -> RedistributionDispatchResponse:
        """Initialize a new dispatch record upon match acceptance."""
        now_str = datetime.now().strftime("%H:%M IST")
        otp = f"FL-{random.randint(1000, 9999)}"
        dsp_id = f"DSP-2026-{datetime.now().strftime('%H%M%S')[-3:]}"

        new_dsp = RedistributionDispatchResponse(
            dispatch_id=dsp_id,
            match_id=match_id,
            surplus_id=surplus_id,
            recipient_id=recipient_id,
            surplus_summary=f"{dish_name} ({portions} Portions)",
            portions=portions,
            recipient_name=recipient_name,
            destination_address=destination_address,
            courier_name="Ramesh Sharma (Dedicated FoodLoop Carrier)",
            vehicle_type="Thermal Hot-Holding Cargo Van (EV)",
            dispatch_time=now_str,
            eta="~25 mins",
            stage=DispatchStage.DRIVER_EN_ROUTE,
            transit_temp_compliant=True,
            transit_temp_c=64.0,
            handover_code=otp,
            is_verified=False,
            is_demo_data=True,
        )
        self._demo_records.insert(0, new_dsp)
        return new_dsp

    def verify_handover(self, dispatch_id: str, otp_code: str) -> bool:
        """Validate handover OTP and seal chain of custody."""
        normalized_otp = otp_code.strip().upper()
        for d in self._demo_records:
            if d.dispatch_id == dispatch_id:
                # Accept expected OTP code or demo test token "DEMO"
                if d.handover_code.upper() == normalized_otp or normalized_otp == "DEMO":
                    d.stage = DispatchStage.VERIFIED_HANDOFF
                    d.is_verified = True
                    d.verification_timestamp = datetime.now().strftime("%H:%M IST")
                    # Synchronize surplus status if linked
                    if d.surplus_id:
                        surplus_item = surplus_service.get_surplus_by_id(d.surplus_id)
                        if surplus_item:
                            surplus_item.status = SurplusStatus.DISPATCHED
                    return True
                return False
        return False


redistribution_service = RedistributionService()
