export type OperationalStage =
  | 'KITCHEN_DATA'
  | 'DEMAND_PREDICTION'
  | 'SURPLUS_DETECTION'
  | 'SAFETY_VERIFICATION'
  | 'RECIPIENT_MATCHING'
  | 'PICKUP_DISPATCH'
  | 'IMPACT_TRACKING';

export type NavTabId =
  | 'overview'
  | 'demand'
  | 'surplus'
  | 'safety'
  | 'matching'
  | 'redistribution'
  | 'impact';

export interface TodayOverviewMetrics {
  mealsPlanned: number;
  predictedDemand: number;
  surplusRiskPortions: number;
  surplusRiskLevel: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  availableForRescue: number;
  mealsRescuedToday: number;
  wasteDivertedKg: number;
  co2eAvoidedKg: number;
  activeRedistributionsCount: number;
  lastUpdated: string;
}

export interface DemandPredictionItem {
  id: string;
  mealSlot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Evening Snacks';
  plannedPortions: number;
  predictedPortions: number;
  variancePortions: number;
  variancePct: number;
  attendanceProjected: number;
  historicalBaselinePortions: number;
  menuHighlights: string[];
  keyDrivers: string[];
  prepRecommendation: string;
  suggestedBatchReductionKg: number;
  riskSeverity: 'low' | 'moderate' | 'high';
}

export type SurplusCategory =
  | 'Cooked Grains'
  | 'Curry & Dal'
  | 'Breads & Rotis'
  | 'Vegetables'
  | 'Dairy & Desserts';

export type SurplusStatus =
  | 'Detected'
  | 'Pending Verification'
  | 'Verified Safe'
  | 'Matched'
  | 'Dispatched'
  | 'Composted';

export interface SurplusItem {
  id: string;
  batchId: string;
  mealSlot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  dishName: string;
  category: SurplusCategory;
  quantityKg: number;
  portionsEquivalent: number;
  prepTimestamp: string;
  holdingTempC: number;
  status: SurplusStatus;
  storageUnit: string;
  shelfLifeRemainingHours: number;
}

export type ComplianceGrade =
  | 'Certified Safe'
  | 'Attention Required'
  | 'Non-Compliant (Discard)';

export interface SafetyVerificationRecord {
  id: string;
  surplusId: string;
  dishName: string;
  batchCode: string;
  inspectionTimestamp: string;
  coreTempC: number;
  tempStandard: string;
  isTempCompliant: boolean;
  holdTimeElapsedHours: number;
  maxSafeHoldHours: number;
  sensoryInspection: {
    odorNormal: boolean;
    colorNormal: boolean;
    textureNormal: boolean;
    sanitaryVessel: boolean;
  };
  complianceStatus: ComplianceGrade;
  inspectorName: string;
  digitalCertificateId: string;
  fssaiRegulation: string;
}

export type OrgType =
  | 'Shelter Home'
  | 'Community Kitchen'
  | 'Night Shelter'
  | 'Children Home'
  | 'Elderly Care Center';

export interface RecipientMatch {
  id: string;
  surplusId: string;
  dishName: string;
  portionsAvailable: number;
  recipientName: string;
  orgType: OrgType;
  distanceKm: number;
  transitMinutes: number;
  capacityNeededPortions: number;
  dietaryCompatibility: string;
  priorityScore: number; // 0 to 100
  urgencyLevel: 'Immediate' | 'Priority' | 'Flexible';
  matchStatus: 'Suggested' | 'Accepted' | 'Driver Assigned' | 'Completed';
}

export type DispatchStage =
  | 'Allocated'
  | 'Driver En Route'
  | 'Picked Up'
  | 'In Transit'
  | 'Delivered'
  | 'Verified Handoff';

export interface RedistributionDispatch {
  dispatchId: string;
  surplusSummary: string;
  portions: number;
  recipientName: string;
  destinationAddress: string;
  courierName: string;
  vehicleType: string;
  dispatchTime: string;
  eta: string;
  stage: DispatchStage;
  transitTempCompliant: boolean;
  transitTempC: number;
  handoverCode: string;
  isVerified: boolean;
}

export interface ImpactSummary {
  totalMealsRescued: number;
  totalKgWasteDiverted: number;
  ghgAvoidedCo2eKg: number;
  waterSavedLiters: number;
  beneficiaryCountServed: number;
  averageKitchenSurplusReductionPct: number;
  monthlyTrends: Array<{
    month: string;
    plannedPortions: number;
    actualConsumedPortions: number;
    rescuedPortions: number;
    divertedKg: number;
  }>;
  categoryBreakdown: Array<{
    category: SurplusCategory;
    percentage: number;
    rescuedKg: number;
  }>;
}
