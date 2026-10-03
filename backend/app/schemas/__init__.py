"""Pydantic schemas package for FoodLoop AI."""
from app.schemas.health import HealthCheckResponse
from app.schemas.kitchen import KitchenBase, KitchenResponse
from app.schemas.menu import MealSlot, DietaryType, MenuItem, MealPlanBase, MealPlanResponse
from app.schemas.attendance import AttendanceForecastBase, AttendanceForecastResponse
from app.schemas.demand import RiskSeverity, DemandInput, DemandPredictionResponse
from app.schemas.surplus import SurplusCategory, SurplusStatus, SurplusRecordBase, SurplusRecordResponse
from app.schemas.safety import (
    ComplianceGrade,
    SensoryInspection,
    SafetyVerificationInput,
    SafetyVerificationRecordResponse,
)
from app.schemas.recipient import (
    OrgType,
    MatchStatus,
    UrgencyLevel,
    RecipientBase,
    RecipientResponse,
    RecipientMatchResponse,
)
from app.schemas.redistribution import (
    DispatchStage,
    HandoverVerificationInput,
    RedistributionDispatchResponse,
)
from app.schemas.impact import MonthlyTrendItem, CategoryBreakdownItem, ImpactSummaryResponse
from app.schemas.overview import TodayOverviewResponse

__all__ = [
    "HealthCheckResponse",
    "KitchenBase",
    "KitchenResponse",
    "MealSlot",
    "DietaryType",
    "MenuItem",
    "MealPlanBase",
    "MealPlanResponse",
    "AttendanceForecastBase",
    "AttendanceForecastResponse",
    "RiskSeverity",
    "DemandInput",
    "DemandPredictionResponse",
    "SurplusCategory",
    "SurplusStatus",
    "SurplusRecordBase",
    "SurplusRecordResponse",
    "ComplianceGrade",
    "SensoryInspection",
    "SafetyVerificationInput",
    "SafetyVerificationRecordResponse",
    "OrgType",
    "MatchStatus",
    "UrgencyLevel",
    "RecipientBase",
    "RecipientResponse",
    "RecipientMatchResponse",
    "DispatchStage",
    "HandoverVerificationInput",
    "RedistributionDispatchResponse",
    "MonthlyTrendItem",
    "CategoryBreakdownItem",
    "ImpactSummaryResponse",
    "TodayOverviewResponse",
]
