"""Closed-loop learning and operational feedback service layer for FoodLoop AI.

Analyzes the variance between demand forecasts and actual diner consumption,
computes statistical error metrics, and generates structured learning signals.
Curates standardized outcome datasets for future model calibration without claiming
autonomous real-time model retraining.
"""
from datetime import datetime, timezone
from app.schemas.learning import (
    PredictionBias,
    LearningSignalType,
    DemandPerformanceRecord,
    LearningSignal,
    LearningFeedbackCreatePayload,
    LearningFeedbackResponse,
    DemandPerformanceSummary,
)


class LearningService:
    """Service evaluating demand forecast accuracy and producing operational learning signals."""

    def __init__(self):
        # Initial demonstration performance records
        self._records: list[DemandPerformanceRecord] = [
            DemandPerformanceRecord(
                record_id="DEM-PERF-01",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Lunch",
                plan_date="2026-10-04",
                dish_name="Jeera Pulao (Long Grain Basmati)",
                registered_headcount=500,
                planned_portions=460,
                predicted_diners=430,
                actual_diners=400,
                absolute_error=30,
                percentage_error=7.5,
                bias=PredictionBias.OVER_PREDICTION,
                surplus_risk_predicted="Moderate",
                actual_surplus_portions=60,
                reason_codes=["RAIN_ATTENDANCE_DROP", "POST_EXAM_RESIDENCE_LEAVE"],
                is_demo_data=True,
            ),
            DemandPerformanceRecord(
                record_id="DEM-PERF-02",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Lunch",
                plan_date="2026-10-04",
                dish_name="Yellow Dal Tadka (Arhar & Moong)",
                registered_headcount=500,
                planned_portions=450,
                predicted_diners=415,
                actual_diners=405,
                absolute_error=10,
                percentage_error=2.5,
                bias=PredictionBias.BALANCED,
                surplus_risk_predicted="Low",
                actual_surplus_portions=45,
                reason_codes=["BASELINE_ACCURATE"],
                is_demo_data=True,
            ),
            DemandPerformanceRecord(
                record_id="DEM-PERF-03",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Dinner",
                plan_date="2026-10-03",
                dish_name="Subz Biryani (Spiced Vegetables & Rice)",
                registered_headcount=450,
                planned_portions=380,
                predicted_demand=340,
                predicted_diners=340,
                actual_diners=330,
                absolute_error=10,
                percentage_error=3.0,
                bias=PredictionBias.BALANCED,
                surplus_risk_predicted="Low",
                actual_surplus_portions=50,
                reason_codes=["BASELINE_ACCURATE", "WEEKEND_STABLE"],
                is_demo_data=True,
            ),
            DemandPerformanceRecord(
                record_id="DEM-PERF-04",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Evening Snacks",
                plan_date="2026-10-03",
                dish_name="Samosa & Mint Chutney Batch",
                registered_headcount=200,
                planned_portions=150,
                predicted_diners=120,
                actual_diners=110,
                absolute_error=10,
                percentage_error=9.1,
                bias=PredictionBias.OVER_PREDICTION,
                surplus_risk_predicted="Elevated",
                actual_surplus_portions=40,
                reason_codes=["ATTENDANCE_OVERESTIMATION", "TEMPERATURE_HOLD_DEVIATION"],
                is_demo_data=True,
            ),
            DemandPerformanceRecord(
                record_id="DEM-PERF-05",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Breakfast",
                plan_date="2026-10-03",
                dish_name="Breakfast Idli Batch",
                registered_headcount=300,
                planned_portions=250,
                predicted_diners=225,
                actual_diners=220,
                absolute_error=5,
                percentage_error=2.3,
                bias=PredictionBias.BALANCED,
                surplus_risk_predicted="Low",
                actual_surplus_portions=30,
                reason_codes=["BASELINE_ACCURATE"],
                is_demo_data=True,
            ),
        ]

        # Initial demonstration learning signals
        self._signals: list[LearningSignal] = [
            LearningSignal(
                signal_id="SIG-2026-01",
                signal_type=LearningSignalType.OVER_PREPARATION,
                severity="moderate",
                timestamp="2026-10-04 14:45 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Lunch",
                dish_name="Jeera Pulao (Long Grain Basmati)",
                description=(
                    "Forecast overestimated diner turnout by 30 portions (7.5% error) "
                    "following unexpected light rainfall on Friday afternoon."
                ),
                metric_observed=7.5,
                target_threshold=5.0,
                suggested_action=(
                    "Recommend reducing baseline prep multiplier by 6% for rainy Friday lunch shifts "
                    "in upcoming weekly menu plans."
                ),
                feedback_dataset_ready=True,
                is_demo_data=True,
            ),
            LearningSignal(
                signal_id="SIG-2026-02",
                signal_type=LearningSignalType.HIGH_SURPLUS_MEAL,
                severity="moderate",
                timestamp="2026-10-04 14:50 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Lunch",
                dish_name="Jeera Pulao (Long Grain Basmati)",
                description=(
                    "Surplus portions (60) reached 13.0% of total cooked batch. "
                    "Safely routed to Apna Ghar Night Shelter (Demo Node #42)."
                ),
                metric_observed=13.0,
                target_threshold=10.0,
                suggested_action=(
                    "Trigger surplus early warning notification to kitchen prep supervisors "
                    "at 13:00 IST when diner turnstile velocity slows."
                ),
                feedback_dataset_ready=True,
                is_demo_data=True,
            ),
            LearningSignal(
                signal_id="SIG-2026-03",
                signal_type=LearningSignalType.SAFETY_FAILURE,
                severity="high",
                timestamp="2026-10-03 17:30 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Evening Snacks",
                dish_name="Samosa & Mint Chutney Batch",
                description=(
                    "Holding temperature probe registered 54°C (below mandatory 60°C hot-holding threshold). "
                    "Batch blocked from redistribution and diverted to composting."
                ),
                metric_observed=54.0,
                target_threshold=60.0,
                suggested_action=(
                    "Re-calibrate Bain-Marie heating elements in Sector 2 servery and verify thermal gaskets."
                ),
                feedback_dataset_ready=True,
                is_demo_data=True,
            ),
            LearningSignal(
                signal_id="SIG-2026-04",
                signal_type=LearningSignalType.RECIPIENT_ACCEPTED,
                severity="low",
                timestamp="2026-10-04 14:35 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Lunch",
                dish_name="Yellow Dal Tadka (Arhar & Moong)",
                description=(
                    "Matched recipient Asha Deep Community Meal Center (Demo Node) accepted consignment within 4 minutes. "
                    "Physical handover verified via one-time passcode."
                ),
                metric_observed=4.0,
                target_threshold=15.0,
                suggested_action=(
                    "Maintain high compatibility weight for Asha Deep Hub on pulse & curry surpluses."
                ),
                feedback_dataset_ready=True,
                is_demo_data=True,
            ),
            LearningSignal(
                signal_id="SIG-2026-05",
                signal_type=LearningSignalType.PICKUP_DELAY,
                severity="low",
                timestamp="2026-10-04 10:20 IST",
                kitchen_id="KITCHEN-IITD-01",
                meal_slot="Breakfast",
                dish_name="Breakfast Idli Batch",
                description=(
                    "Morning transit elapsed time was 28 minutes due to Ring Road congestion. "
                    "Consignment remained thermally safe (62°C) inside insulated container."
                ),
                metric_observed=28.0,
                target_threshold=25.0,
                suggested_action=(
                    "Adjust morning route buffer by +5 minutes for peak-hour south corridor dispatches."
                ),
                feedback_dataset_ready=True,
                is_demo_data=True,
            ),
        ]

    def get_demand_performance(self) -> DemandPerformanceSummary:
        """Calculate statistical summary of prediction errors and bias classification."""
        if not self._records:
            return DemandPerformanceSummary(
                total_evaluated_meals=0,
                mean_absolute_error=0.0,
                mean_percentage_error=0.0,
                over_prediction_count=0,
                under_prediction_count=0,
                balanced_count=0,
                records=[],
            )

        total = len(self._records)
        mae = round(sum(r.absolute_error for r in self._records) / total, 1)
        mape = round(sum(r.percentage_error for r in self._records) / total, 1)
        over_count = sum(1 for r in self._records if r.bias == PredictionBias.OVER_PREDICTION)
        under_count = sum(1 for r in self._records if r.bias == PredictionBias.UNDER_PREDICTION)
        balanced_count = sum(1 for r in self._records if r.bias == PredictionBias.BALANCED)

        return DemandPerformanceSummary(
            total_evaluated_meals=total,
            mean_absolute_error=mae,
            mean_percentage_error=mape,
            over_prediction_count=over_count,
            under_prediction_count=under_count,
            balanced_count=balanced_count,
            records=self._records,
        )

    def get_feedback_signals(
        self,
        signal_type: LearningSignalType | None = None,
        severity: str | None = None,
    ) -> list[LearningSignal]:
        """Query learning signals with optional type and severity filtering."""
        results = self._signals
        if signal_type:
            results = [s for s in results if s.signal_type == signal_type]
        if severity:
            results = [s for s in results if s.severity.lower() == severity.lower()]
        return results

    def record_feedback(
        self, payload: LearningFeedbackCreatePayload
    ) -> LearningFeedbackResponse:
        """Ingest actual meal service outcomes and generate explainable learning signals."""
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M IST")
        next_rec_id = f"DEM-PERF-{len(self._records) + 1:02d}"

        # Error metrics (safe against zero division)
        safe_actual = max(payload.actual_consumed, 1)
        abs_err = abs(payload.predicted_portions - payload.actual_consumed)
        pct_err = round((abs_err / safe_actual) * 100, 1)

        # Bias classification (tolerance margin ±5%)
        tolerance_portion = safe_actual * 0.05
        if (payload.predicted_portions - payload.actual_consumed) > tolerance_portion:
            bias = PredictionBias.OVER_PREDICTION
        elif (payload.actual_consumed - payload.predicted_portions) > tolerance_portion:
            bias = PredictionBias.UNDER_PREDICTION
        else:
            bias = PredictionBias.BALANCED

        reason_codes: list[str] = []
        if payload.reason_notes:
            reason_codes.append("SUPERVISOR_NOTE_ATTACHED")
        if bias == PredictionBias.OVER_PREDICTION:
            reason_codes.append("POST_SERVICE_OVERPREP")
        elif bias == PredictionBias.UNDER_PREDICTION:
            reason_codes.append("POST_SERVICE_SURGE")
        else:
            reason_codes.append("BASELINE_SATISFIED")

        perf_record = DemandPerformanceRecord(
            record_id=next_rec_id,
            kitchen_id=payload.kitchen_id,
            meal_slot=payload.meal_slot,
            plan_date=payload.plan_date,
            dish_name=payload.dish_name,
            registered_headcount=payload.registered_headcount,
            planned_portions=payload.planned_portions,
            predicted_diners=payload.predicted_portions,
            actual_diners=payload.actual_consumed,
            absolute_error=abs_err,
            percentage_error=pct_err,
            bias=bias,
            surplus_risk_predicted="Moderate" if payload.actual_surplus > 30 else "Low",
            actual_surplus_portions=payload.actual_surplus,
            reason_codes=reason_codes,
            is_demo_data=True,
        )

        self._records.insert(0, perf_record)

        # Generate rule-based operational learning signals
        new_signals: list[LearningSignal] = []

        if payload.actual_surplus >= 35:
            sig_id = f"SIG-{len(self._signals) + len(new_signals) + 1:04d}"
            new_signals.append(
                LearningSignal(
                    signal_id=sig_id,
                    signal_type=LearningSignalType.HIGH_SURPLUS_MEAL,
                    severity="moderate",
                    timestamp=now_str,
                    kitchen_id=payload.kitchen_id,
                    meal_slot=payload.meal_slot,
                    dish_name=payload.dish_name,
                    description=(
                        f"Post-service surplus reached {payload.actual_surplus} portions for {payload.dish_name}."
                    ),
                    metric_observed=float(payload.actual_surplus),
                    target_threshold=25.0,
                    suggested_action="Recommend decreasing batch prep size by 8-12% for subsequent matching slots.",
                    feedback_dataset_ready=True,
                    is_demo_data=True,
                )
            )

        if bias == PredictionBias.OVER_PREDICTION and abs_err >= 25:
            sig_id = f"SIG-{len(self._signals) + len(new_signals) + 1:04d}"
            new_signals.append(
                LearningSignal(
                    signal_id=sig_id,
                    signal_type=LearningSignalType.OVER_PREPARATION,
                    severity="moderate",
                    timestamp=now_str,
                    kitchen_id=payload.kitchen_id,
                    meal_slot=payload.meal_slot,
                    dish_name=payload.dish_name,
                    description=(
                        f"Demand forecast over-predicted by {abs_err} portions ({pct_err}% error)."
                    ),
                    metric_observed=pct_err,
                    target_threshold=5.0,
                    suggested_action="Evaluate student leave rosters and outdoor weather before setting next week's prep baseline.",
                    feedback_dataset_ready=True,
                    is_demo_data=True,
                )
            )

        # Append new signals to store
        for sig in new_signals:
            self._signals.insert(0, sig)

        return LearningFeedbackResponse(
            status="recorded",
            message=f"Logged post-service outcome for {payload.dish_name}. Generated {len(new_signals)} learning signal(s).",
            recorded_performance=perf_record,
            generated_signals=new_signals,
        )


learning_service = LearningService()
