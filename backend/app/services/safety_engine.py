"""Food Safety Verification Engine for FoodLoop AI.

Implements rigorous, explainable verification against statutory standards:
- FSSAI Schedule 4 (General Hygienic & Sanitary Practices for FBOs)
- FSSAI Safe Food & Surplus Food Distribution Regulations, 2019

Strict Safety Guardrail: Food is NEVER marked eligible for redistribution
without explicit, successful temperature and sensory verification.
"""

from datetime import datetime
from app.schemas.safety import (
    SafetyVerificationInput,
    SafetyVerificationRecordResponse,
    ComplianceGrade,
    HoldingType,
)


class FoodSafetyVerificationEngine:
    """Evaluates surplus food safety parameters against FSSAI regulatory and operational thresholds."""

    # Authoritative statutory references
    REGULATORY_CITATION = (
        "FSS (Licensing and Registration of Food Businesses) Regulations, 2011, Schedule 4; "
        "and FSS (Recovery and Distribution of Surplus Food) Regulations, 2019."
    )

    # Statutory temperature thresholds (FSSAI Schedule 4)
    FSSAI_HOT_HOLD_MIN_TEMP_C: float = 60.0   # Mandatory minimum hot holding temperature
    FSSAI_COLD_HOLD_MAX_TEMP_C: float = 5.0   # Mandatory maximum cold holding temperature

    # Configurable operational holding thresholds
    MAX_HOT_HOLD_HOURS: float = 4.0          # Operational ceiling for hot held cooked food
    MAX_AMBIENT_DANGER_HOURS: float = 2.0    # FSSAI 2-hour corrective action threshold for ambient hold

    def evaluate(
        self,
        data: SafetyVerificationInput,
        dish_name: str = "Surplus Batch",
        batch_code: str = "B-SURPLUS-UNKNOWN",
    ) -> SafetyVerificationRecordResponse:
        """Execute full FSSAI compliance verification for a surplus food batch."""
        reason_codes: list[str] = []
        observations: list[str] = []
        hold_hours = data.hold_time_elapsed_hours if data.hold_time_elapsed_hours is not None else 1.0

        # 1. Sensory Inspection (Critical prerequisite)
        sensory = data.sensory_inspection
        if (
            sensory is None
            or sensory.odor_normal is None
            or sensory.color_normal is None
            or sensory.texture_normal is None
            or sensory.sanitary_vessel is None
        ):
            missing_checks: list[str] = []
            if sensory is None:
                missing_checks.append("All 4 sensory check fields missing")
            else:
                if sensory.odor_normal is None:
                    missing_checks.append("Odor check omitted")
                if sensory.color_normal is None:
                    missing_checks.append("Color/appearance check omitted")
                if sensory.texture_normal is None:
                    missing_checks.append("Texture check omitted")
                if sensory.sanitary_vessel is None:
                    missing_checks.append("Sanitary vessel check omitted")

            reason_codes.append("INCOMPLETE_SENSORY_INSPECTION")
            reason_codes.append("SAFETY_HOLD_REQUIRED")
            observations.extend(missing_checks)
            observations.append("Incomplete Protocol: All 4 sensory points (odor, appearance, texture, sanitary vessel) must be explicitly recorded.")

            return SafetyVerificationRecordResponse(
                id=f"SAFE-EVAL-{datetime.now().strftime('%H%M%S')}",
                surplus_id=data.surplus_id,
                batch_code=batch_code,
                dish_name=dish_name,
                inspection_timestamp=datetime.now().strftime("%H:%M IST"),
                core_temp_c=data.core_temp_c,
                temp_standard=f"≥ {self.FSSAI_HOT_HOLD_MIN_TEMP_C}°C (Hot Holding)",
                is_temp_compliant=False,
                hold_time_elapsed_hours=hold_hours,
                max_safe_hold_hours=self.MAX_HOT_HOLD_HOURS,
                sensory_inspection=sensory or SensoryInspection(),
                compliance_status=ComplianceGrade.ATTENTION_REQUIRED,
                redistribution_eligible=False,
                regulatory_basis=self.REGULATORY_CITATION,
                operational_rule="Mandatory 4-point sensory protocol required before safety signoff.",
                reason_codes=reason_codes,
                observations=observations,
                inspector_name=data.inspector_name,
                digital_certificate_id=None,
                fssai_regulation="Pending: Incomplete sensory verification checklist.",
                is_demo_data=False,
            )

        sensory_ok = (
            sensory.odor_normal is True
            and sensory.color_normal is True
            and sensory.texture_normal is True
            and sensory.sanitary_vessel is True
        )

        if not sensory_ok:
            failed_sensory: list[str] = []
            if sensory.odor_normal is False:
                failed_sensory.append("Off-odor or sour aroma detected")
            if sensory.color_normal is False:
                failed_sensory.append("Unnatural discoloration / oxidation observed")
            if sensory.texture_normal is False:
                failed_sensory.append("Abnormal texture, curding, or sliminess")
            if sensory.sanitary_vessel is False:
                failed_sensory.append("Holding vessel or lid compromised / unwashed")

            reason_codes.append("SENSORY_DEFECT_DETECTED")
            reason_codes.append("MANDATORY_COMPOST_DISPOSAL")
            observations.extend(failed_sensory)
            observations.append("Critical Failure: Food fails operational hygiene sensory soundness requirements.")

            return SafetyVerificationRecordResponse(
                id=f"SAFE-EVAL-{datetime.now().strftime('%H%M%S')}",
                surplus_id=data.surplus_id,
                batch_code=batch_code,
                dish_name=dish_name,
                inspection_timestamp=datetime.now().strftime("%H:%M IST"),
                core_temp_c=data.core_temp_c,
                temp_standard=f"≥ {self.FSSAI_HOT_HOLD_MIN_TEMP_C}°C (Hot Holding)",
                is_temp_compliant=False,
                hold_time_elapsed_hours=hold_hours,
                max_safe_hold_hours=self.MAX_HOT_HOLD_HOURS,
                sensory_inspection=sensory,
                compliance_status=ComplianceGrade.NON_COMPLIANT_DISCARD,
                redistribution_eligible=False,
                regulatory_basis=self.REGULATORY_CITATION,
                operational_rule="Immediate organic compost redirection upon sensory failure.",
                reason_codes=reason_codes,
                observations=observations,
                inspector_name=data.inspector_name,
                digital_certificate_id=None,  # No verification token for failed food
                fssai_regulation="Non-Compliant: Failed sensory inspection. Not safe for redistribution.",
                is_demo_data=False,
            )

        reason_codes.append("SENSORY_ATTRIBUTES_SOUND")
        observations.append("4-point sensory checklist verified normal (odor, visual, texture, sanitary vessel).")

        # 2. Packaging seal check
        if not data.packaging_sealed:
            reason_codes.append("CONTAINER_SEAL_COMPROMISED")
            observations.append("Warning: Food vessel lid or seal was not securely clamped.")

        # 3. Core Temperature Verification
        if data.core_temp_c is None:
            reason_codes.append("PROBE_TEMPERATURE_MISSING")
            reason_codes.append("SAFETY_HOLD_REQUIRED")
            observations.append("Core temperature probe measurement was omitted. Cannot clear food without thermal log.")

            return SafetyVerificationRecordResponse(
                id=f"SAFE-EVAL-{datetime.now().strftime('%H%M%S')}",
                surplus_id=data.surplus_id,
                batch_code=batch_code,
                dish_name=dish_name,
                inspection_timestamp=datetime.now().strftime("%H:%M IST"),
                core_temp_c=None,
                temp_standard=f"≥ {self.FSSAI_HOT_HOLD_MIN_TEMP_C}°C (Hot Holding)",
                is_temp_compliant=False,
                hold_time_elapsed_hours=hold_hours,
                max_safe_hold_hours=self.MAX_HOT_HOLD_HOURS,
                sensory_inspection=sensory,
                compliance_status=ComplianceGrade.ATTENTION_REQUIRED,
                redistribution_eligible=False,
                regulatory_basis=self.REGULATORY_CITATION,
                operational_rule="Missing temperature probe reading requires manual supervisor thermal check.",
                reason_codes=reason_codes,
                observations=observations,
                inspector_name=data.inspector_name,
                digital_certificate_id=None,
                fssai_regulation="Pending: Physical core temperature reading required before clearance.",
                is_demo_data=False,
            )

        core_temp = data.core_temp_c
        is_temp_compliant = False
        temp_standard_str = ""

        if data.holding_type == HoldingType.HOT_HOLDING:
            temp_standard_str = f"≥ {self.FSSAI_HOT_HOLD_MIN_TEMP_C}°C (Hot Holding)"
            is_temp_compliant = core_temp >= self.FSSAI_HOT_HOLD_MIN_TEMP_C
            if is_temp_compliant:
                reason_codes.append("HOT_HOLD_STANDARD_MET")
                observations.append(f"Core probe {core_temp}°C meets hot holding minimum (≥60.0°C).")
            else:
                reason_codes.append("CORE_TEMP_BELOW_HOT_HOLD_LIMIT")
                observations.append(
                    f"Core probe {core_temp}°C is below statutory hot holding minimum (60.0°C). Food is in danger zone."
                )

        elif data.holding_type == HoldingType.COLD_HOLDING:
            temp_standard_str = f"≤ {self.FSSAI_COLD_HOLD_MAX_TEMP_C}°C (Cold Holding)"
            is_temp_compliant = core_temp <= self.FSSAI_COLD_HOLD_MAX_TEMP_C
            if is_temp_compliant:
                reason_codes.append("COLD_HOLD_STANDARD_MET")
                observations.append(f"Chilled probe {core_temp}°C meets cold holding maximum (≤5.0°C).")
            else:
                reason_codes.append("COLD_HOLD_TEMP_EXCEEDED")
                observations.append(f"Temperature {core_temp}°C exceeded chilled limit (≤5.0°C).")

        else:  # ROOM_TEMPERATURE / AMBIENT
            temp_standard_str = "≤ 2.0h Ambient Elapsed (Corrective Window)"
            is_temp_compliant = False
            reason_codes.append("AMBIENT_DANGER_ZONE_HOLDING")
            observations.append("Food held at ambient room temperature (5°C - 60°C danger zone).")

        # 4. Elapsed Time Evaluation
        if hold_hours > self.MAX_HOT_HOLD_HOURS:
            reason_codes.append("MAX_HOLD_WINDOW_EXCEEDED")
            observations.append(
                f"Elapsed time of {hold_hours}h exceeds maximum permissible holding ceiling of {self.MAX_HOT_HOLD_HOURS}h."
            )
            compliance_status = ComplianceGrade.NON_COMPLIANT_DISCARD
            redistribution_eligible = False
            cert_id = None
            reg_text = f"Critical Expiry: Batch held {hold_hours}h (>4.0h max). Mandatorily condemned for composting."

        elif not is_temp_compliant:
            if hold_hours <= self.MAX_AMBIENT_DANGER_HOURS and data.packaging_sealed:
                compliance_status = ComplianceGrade.ATTENTION_REQUIRED
                redistribution_eligible = False
                cert_id = None
                reason_codes.append("CORRECTIVE_ACTION_REQUIRED")
                observations.append(
                    f"Thermal re-heating to ≥60°C or immediate local dispatch required within remaining {round(self.MAX_AMBIENT_DANGER_HOURS - hold_hours, 1)}h."
                )
                reg_text = "Notice: Core temp dropped below 60°C. Re-thermalization required before clearance."
            else:
                compliance_status = ComplianceGrade.NON_COMPLIANT_DISCARD
                redistribution_eligible = False
                cert_id = None
                reason_codes.append("DANGER_ZONE_WINDOW_ELAPSED")
                observations.append(
                    f"Held below 60°C for {hold_hours}h (>2.0h ambient threshold). Risk of microbial proliferation."
                )
                reg_text = "Non-Compliant: Food remained in temperature danger zone beyond 2-hour corrective limit."

        elif not data.packaging_sealed:
            compliance_status = ComplianceGrade.ATTENTION_REQUIRED
            redistribution_eligible = False
            cert_id = None
            reg_text = "Notice: Container seal compromised. Re-pack in sanitized food-grade vessel before dispatch."

        else:
            # Fully compliant
            compliance_status = ComplianceGrade.SAFETY_VERIFIED
            redistribution_eligible = True
            cert_id = f"FL-VERIFIED-{datetime.now().strftime('%Y%m%d')}-{datetime.now().strftime('%H%M%S')}"
            reason_codes.append("SAFETY_VERIFIED_FOR_REDISTRIBUTION")
            observations.append("All operational safety and hygiene standards satisfied. Cleared for recipient allocation.")
            reg_text = "FoodLoop Safety Verified: Evaluated compliant with operational hygiene standards and temperature holding thresholds."

        return SafetyVerificationRecordResponse(
            id=f"SAFE-REC-{datetime.now().strftime('%H%M%S')}",
            surplus_id=data.surplus_id,
            batch_code=batch_code,
            dish_name=dish_name,
            inspection_timestamp=datetime.now().strftime("%H:%M IST"),
            core_temp_c=core_temp,
            temp_standard=temp_standard_str,
            is_temp_compliant=is_temp_compliant,
            hold_time_elapsed_hours=hold_hours,
            max_safe_hold_hours=self.MAX_HOT_HOLD_HOURS,
            sensory_inspection=sensory,
            compliance_status=compliance_status,
            redistribution_eligible=redistribution_eligible,
            regulatory_basis=self.REGULATORY_CITATION,
            operational_rule=f"FoodLoop operational ceiling: {self.MAX_HOT_HOLD_HOURS}h hot-holding ceiling and {self.MAX_AMBIENT_DANGER_HOURS}h ambient corrective window (operational best practice, not an FSSAI statutory rule).",
            reason_codes=reason_codes,
            observations=observations,
            inspector_name=data.inspector_name,
            digital_certificate_id=cert_id,
            fssai_regulation=reg_text,
            is_demo_data=False,
        )


safety_engine = FoodSafetyVerificationEngine()
