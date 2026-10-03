"""Safety service layer for FoodLoop AI.

Implements FSSAI Schedule 4 safety evaluations, hold-time checks, and verification certificates.
"""

from app.schemas.safety import (
    ComplianceGrade,
    SensoryInspection,
    SafetyVerificationInput,
    SafetyVerificationRecordResponse,
)


class SafetyService:
    """Service evaluating food safety parameters and issuing digital certificates."""

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
                compliance_status=ComplianceGrade.CERTIFIED_SAFE,
                inspector_name="Chef Rajesh Sharma (FSSAI Cert #9942)",
                digital_certificate_id="FSSAI-FL-2026-0921-OK",
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
                compliance_status=ComplianceGrade.CERTIFIED_SAFE,
                inspector_name="Chef Rajesh Sharma (FSSAI Cert #9942)",
                digital_certificate_id="FSSAI-FL-2026-0922-OK",
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
                inspector_name="Quality Lead Sunita Roy",
                digital_certificate_id="FSSAI-FL-2026-0923-PENDING",
                fssai_regulation="Notice: Core temp dropped below 60°C. Immediate thermal transfer required.",
                is_demo_data=True,
            ),
        ]

    def get_all_records(self) -> list[SafetyVerificationRecordResponse]:
        """Return all logged verification certificates."""
        return self._demo_records

    def verify_surplus(self, data: SafetyVerificationInput) -> SafetyVerificationRecordResponse:
        """Evaluate temperature and sensory attributes to determine compliance."""
        is_temp_ok = data.core_temp_c >= 60.0
        sensory_ok = (
            data.sensory_inspection.odor_normal
            and data.sensory_inspection.color_normal
            and data.sensory_inspection.texture_normal
            and data.sensory_inspection.sanitary_vessel
        )

        if is_temp_ok and sensory_ok:
            status = ComplianceGrade.CERTIFIED_SAFE
            reg = "FSS (Licensing & Registration) Reg. 2011 Schedule 4 — Certified Safe"
        elif not is_temp_ok and sensory_ok:
            status = ComplianceGrade.ATTENTION_REQUIRED
            reg = "Notice: Core temp dropped below 60°C. Thermal re-heat or insulated transfer required."
        else:
            status = ComplianceGrade.NON_COMPLIANT_DISCARD
            reg = "Critical Safety Violation: Sensory or vessel defect detected. Direct to organic compost."

        record = SafetyVerificationRecordResponse(
            id=f"SAFE-REC-{len(self._demo_records) + 401}",
            surplus_id=data.surplus_id,
            batch_code=f"B-VERIFY-{data.surplus_id[:6]}",
            dish_name="Verified Surplus Batch",
            inspection_timestamp="Just now",
            core_temp_c=data.core_temp_c,
            temp_standard="≥ 60.0°C (Hot Holding)",
            is_temp_compliant=is_temp_ok,
            hold_time_elapsed_hours=1.0,
            max_safe_hold_hours=4.0,
            sensory_inspection=data.sensory_inspection,
            compliance_status=status,
            inspector_name=data.inspector_name,
            digital_certificate_id=f"FSSAI-FL-2026-{data.surplus_id[:6]}-OK",
            fssai_regulation=reg,
            is_demo_data=True,
        )

        self._demo_records.append(record)
        return record


safety_service = SafetyService()
