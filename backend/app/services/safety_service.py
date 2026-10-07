"""Safety service layer for FoodLoop AI.

Implements FSSAI Schedule 4 safety evaluations, operational holding limits, and internal verification audit tokens.
"""

from app.schemas.safety import (
    ComplianceGrade,
    SensoryInspection,
    SafetyVerificationInput,
    SafetyVerificationRecordResponse,
)
from app.services.safety_engine import safety_engine
from app.services.surplus_service import surplus_service


class SafetyService:
    """Service evaluating food safety parameters and issuing FoodLoop internal audit tokens."""

    def __init__(self):
        self._demo_records: list[SafetyVerificationRecordResponse] = [
            SafetyVerificationRecordResponse(
                id="SAFE-REC-401",
                surplus_id="SUR-0921",
                dish_name="Jeera Pulao (Long Grain Basmati)",
                batch_code="B-LUNCH-RICE-02",
                inspection_timestamp="13:30 IST",
                core_temp_c=66.2,
                temp_standard="≥ 60.0°C (Hot Holding)",
                is_temp_compliant=True,
                hold_time_elapsed_hours=1.25,
                max_safe_hold_hours=4.0,
                sensory_inspection=SensoryInspection(
                    odor_normal=True,
                    color_normal=True,
                    texture_normal=True,
                    sanitary_vessel=True,
                ),
                compliance_status=ComplianceGrade.SAFETY_VERIFIED,
                redistribution_eligible=True,
                regulatory_basis="FSS (Licensing & Registration of Food Businesses) Reg. 2011, Schedule 4",
                operational_rule="Standard 4.0-hour holding ceiling from batch cooking finish",
                reason_codes=["FSSAI_HOT_HOLD_MET", "SENSORY_ATTRIBUTES_SOUND", "SAFETY_VERIFIED_FOR_REDISTRIBUTION"],
                observations=[
                    "Core probe 66.2°C meets FSSAI Schedule 4 hot holding minimum (≥60.0°C).",
                    "Sensory attributes clean and packaging sealed.",
                ],
                inspector_name="Chef Rajesh Sharma (Food Safety Supervisor)",
                digital_certificate_id="FL-VERIFIED-2026-0921-OK",
                fssai_regulation="FSS (Licensing & Registration of Food Businesses) Reg. 2011, Schedule 4",
                is_demo_data=True,
            ),
            SafetyVerificationRecordResponse(
                id="SAFE-REC-402",
                surplus_id="SUR-0922",
                dish_name="Yellow Dal Tadka (Arhar & Moong)",
                batch_code="B-LUNCH-DAL-01",
                inspection_timestamp="13:35 IST",
                core_temp_c=64.0,
                temp_standard="≥ 60.0°C (Hot Holding)",
                is_temp_compliant=True,
                hold_time_elapsed_hours=1.08,
                max_safe_hold_hours=4.0,
                sensory_inspection=SensoryInspection(
                    odor_normal=True,
                    color_normal=True,
                    texture_normal=True,
                    sanitary_vessel=True,
                ),
                compliance_status=ComplianceGrade.SAFETY_VERIFIED,
                redistribution_eligible=True,
                regulatory_basis="FSS (Licensing & Registration of Food Businesses) Reg. 2011, Schedule 4",
                operational_rule="Standard 4.0-hour holding ceiling from batch cooking finish",
                reason_codes=["FSSAI_HOT_HOLD_MET", "SENSORY_ATTRIBUTES_SOUND", "SAFETY_VERIFIED_FOR_REDISTRIBUTION"],
                observations=[
                    "Core probe 64.0°C meets FSSAI hot hold standard.",
                    "Hygienic stainless vessel verified clean.",
                ],
                inspector_name="Chef Rajesh Sharma (Food Safety Supervisor)",
                digital_certificate_id="FL-VERIFIED-2026-0922-OK",
                fssai_regulation="FSS (Licensing & Registration of Food Businesses) Reg. 2011, Schedule 4",
                is_demo_data=True,
            ),
            SafetyVerificationRecordResponse(
                id="SAFE-REC-403",
                surplus_id="SUR-0923",
                dish_name="Whole Wheat Tawa Rotis",
                batch_code="B-LUNCH-ROTI-03",
                inspection_timestamp="13:40 IST",
                core_temp_c=58.0,
                temp_standard="≥ 60.0°C (Hot Holding)",
                is_temp_compliant=False,
                hold_time_elapsed_hours=0.67,
                max_safe_hold_hours=4.0,
                sensory_inspection=SensoryInspection(
                    odor_normal=True,
                    color_normal=True,
                    texture_normal=True,
                    sanitary_vessel=True,
                ),
                compliance_status=ComplianceGrade.ATTENTION_REQUIRED,
                redistribution_eligible=False,
                regulatory_basis="FSS (Licensing & Registration of Food Businesses) Reg. 2011, Schedule 4",
                operational_rule="2.0-hour ambient corrective window applies when below 60.0°C",
                reason_codes=["CORE_TEMP_BELOW_HOT_HOLD_LIMIT", "CORRECTIVE_ACTION_REQUIRED"],
                observations=[
                    "Core probe 58.0°C dropped below 60.0°C threshold.",
                    "Sensory inspection passed, but immediate thermal re-heating or hot-case holding is required.",
                ],
                inspector_name="Quality Lead Sunita Roy",
                digital_certificate_id=None,
                fssai_regulation="Notice: Core temp dropped below 60°C. Immediate thermal transfer required.",
                is_demo_data=True,
            ),
        ]

    def get_all_records(self) -> list[SafetyVerificationRecordResponse]:
        """Return all logged verification audit records."""
        return self._demo_records

    def verify_surplus(
        self, data: SafetyVerificationInput
    ) -> SafetyVerificationRecordResponse:
        """Evaluate temperature and sensory attributes against FSSAI standards."""
        # Find dish metadata from surplus registry if available
        surplus_item = surplus_service.get_surplus_by_id(data.surplus_id)
        dish_name = surplus_item.dish_name if surplus_item else "Surplus Meal Batch"
        batch_code = surplus_item.batch_id if surplus_item else f"B-SUR-{data.surplus_id[-4:]}"

        # Execute formal safety evaluation engine
        result = safety_engine.evaluate(
            data=data,
            dish_name=dish_name,
            batch_code=batch_code,
        )

        # Synchronize status with surplus registry
        surplus_service.mark_safety_result(
            surplus_id=data.surplus_id,
            is_safe=result.redistribution_eligible,
            is_discard=(result.compliance_status == ComplianceGrade.NON_COMPLIANT_DISCARD),
        )

        # Store in verification ledger
        self._demo_records.insert(0, result)
        return result


safety_service = SafetyService()

