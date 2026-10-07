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
  recommendedPrepPortions?: number;
  variancePortions: number;
  variancePct: number;
  attendanceProjected: number;
  historicalBaselinePortions: number;
  menuHighlights: string[];
  keyDrivers: string[];
  reasonCodes?: string[];
  prepRecommendation: string;
  suggestedBatchReductionKg: number;
  riskSeverity: 'low' | 'moderate' | 'high';
  confidenceLevel?: string;
  isDemoData?: boolean;
}

export interface DemandInputPayload {
  kitchen_id?: string;
  meal_slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Evening Snacks';
  plan_date: string;
  registered_headcount: number;
  planned_portions: number;
  confirmed_leaves?: number;
  historical_consumption_rate?: number | null;
  day_of_week?: string | null;
  special_events?: string[];
  weather_context?: string | null;
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
  | 'Safety Verified'
  | 'Verified Safe'
  | 'Matched'
  | 'Dispatched'
  | 'Composted';

export interface SurplusItem {
  id: string;
  batchId: string;
  mealSlot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Evening Snacks' | 'Snacks';
  dishName: string;
  category: SurplusCategory;
  quantityKg: number;
  portionsEquivalent: number;
  prepTimestamp: string;
  holdingTempC: number;
  status: SurplusStatus;
  storageUnit: string;
  shelfLifeRemainingHours: number;
  requiresSafetyVerification?: boolean;
  redistributionEligible?: boolean;
  detectionTimestamp?: string;
  reasonCodes?: string[];
  varianceExplanation?: string;
  isDemoData?: boolean;
}

export interface SurplusDetectionPayload {
  kitchen_id?: string;
  meal_slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Evening Snacks';
  dish_name: string;
  category: SurplusCategory;
  planned_portions: number;
  cooked_portions: number;
  consumed_portions: number;
  cooked_weight_kg?: number;
  remaining_weight_kg?: number;
  prep_timestamp: string;
  holding_temp_c: number;
  storage_unit?: string;
}

export type ComplianceGrade =
  | 'Safety Verified'
  | 'Verified Safe'
  | 'Attention Required'
  | 'Non-Compliant (Discard)';

export interface SafetyVerificationRecord {
  id: string;
  surplusId: string;
  dishName: string;
  batchCode: string;
  inspectionTimestamp: string;
  coreTempC?: number | null;
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
  redistributionEligible?: boolean;
  regulatoryBasis?: string;
  operationalRule?: string;
  reasonCodes?: string[];
  observations?: string[];
  inspectorName: string;
  digitalCertificateId?: string | null;
  fssaiRegulation: string;
  isDemoData?: boolean;
}

export interface SafetyVerificationPayload {
  surplus_id: string;
  core_temp_c?: number | null;
  holding_type?: 'Hot Holding' | 'Cold Holding' | 'Room Temperature / Ambient';
  hold_time_elapsed_hours?: number;
  sensory_inspection: {
    odor_normal: boolean;
    color_normal: boolean;
    texture_normal: boolean;
    sanitary_vessel: boolean;
  };
  packaging_sealed?: boolean;
  inspector_name: string;
  inspector_notes?: string;
}

export type OrgType =
  | 'NGO'
  | 'Community Kitchen'
  | 'Shelter'
  | 'Shelter Home'
  | 'Food Distribution Center'
  | 'Night Shelter'
  | 'Children Home'
  | 'Elderly Care Center';

export interface RecipientMatch {
  id: string;
  matchId?: string;
  surplusId: string;
  dishName: string;
  portionsAvailable: number;
  recipientId?: string;
  recipientName: string;
  orgType: OrgType;
  distanceKm: number;
  transitMinutes: number;
  capacityNeededPortions: number;
  dietaryCompatibility: string;
  priorityScore: number; // 0 to 100
  matchScore?: number;
  urgencyLevel: 'Immediate' | 'Priority' | 'Flexible';
  matchStatus: 'Suggested' | 'Accepted' | 'Driver Assigned' | 'Pickup In Progress' | 'Completed' | 'Cancelled';
  eligibility?: boolean;
  reasons?: string[];
  rank?: number;
  estimatedPickupTime?: string | null;
  scoringBreakdown?: Record<string, number>;
  isDemoData?: boolean;
}

export type DispatchStage =
  | 'Matched'
  | 'Allocated'
  | 'Driver Assigned'
  | 'Driver En Route'
  | 'Pickup In Progress'
  | 'Picked Up'
  | 'In Transit'
  | 'Delivered'
  | 'OTP Verified'
  | 'Verified Handoff'
  | 'Redistributed'
  | 'Cancelled';

export interface RedistributionDispatch {
  dispatchId: string;
  matchId?: string;
  surplusId?: string;
  recipientId?: string;
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
  verificationTimestamp?: string | null;
  isDemoData?: boolean;
}

export interface EnvironmentalAssumptions {
  co2eFactorKgPerKgFood: number;
  waterFactorLitersPerKgFood: number;
  kgPerPortionDefault: number;
  methodologyNote: string;
}

export interface ImpactSummary {
  totalMealsRescued: number;
  totalKgWasteDiverted: number;
  ghgAvoidedCo2eKg: number;
  waterSavedLiters: number;
  beneficiaryCountServed: number;
  averageKitchenSurplusReductionPct: number;
  surplusRatePct?: number;
  rescueRatePct?: number;
  successfulHandoffCount?: number;
  failedOrCancelledCount?: number;
  averagePickupTimeMinutes?: number;
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
  environmentalAssumptions?: EnvironmentalAssumptions;
  isDemoData?: boolean;
}

export interface ImpactEvent {
  eventId: string;
  timestamp: string;
  kitchenId: string;
  mealSlot: string;
  mealDate: string;
  dishName: string;
  category: SurplusCategory;
  demandPredictionId?: string | null;
  surplusId?: string | null;
  safetyVerificationId?: string | null;
  matchId?: string | null;
  dispatchId?: string | null;
  recipientId?: string | null;
  recipientName?: string | null;
  plannedPortions: number;
  predictedDemand: number;
  actualConsumed: number;
  mealsPrepared: number;
  surplusPortions: number;
  surplusWeightKg: number;
  safelyRedistributedPortions: number;
  redistributedWeightKg: number;
  compostedOrDiscardedKg: number;
  safetyOutcome: string;
  redistributionOutcome: string;
  pickupTimeMinutes?: number | null;
  estimatedCo2eAvoidedKg: number;
  estimatedWaterSavedLiters: number;
  isDemoData?: boolean;
  notes?: string | null;
}

export type PredictionBias = 'Over-Prediction' | 'Under-Prediction' | 'Balanced';

export interface DemandPerformanceRecord {
  recordId: string;
  kitchenId: string;
  mealSlot: string;
  planDate: string;
  dishName: string;
  registeredHeadcount: number;
  plannedPortions: number;
  predictedDiners: number;
  actualDiners: number;
  absoluteError: number;
  percentageError: number;
  bias: PredictionBias;
  surplusRiskPredicted: string;
  actualSurplusPortions: number;
  reasonCodes: string[];
  isDemoData?: boolean;
}

export interface DemandPerformanceSummary {
  totalEvaluatedMeals: number;
  meanAbsoluteError: number;
  meanPercentageError: number;
  overPredictionCount: number;
  underPredictionCount: number;
  balancedCount: number;
  records: DemandPerformanceRecord[];
  disclaimer: string;
}

export type LearningSignalType =
  | 'OVER_PREPARATION'
  | 'UNDER_PREPARATION'
  | 'HIGH_SURPLUS_MEAL'
  | 'PICKUP_DELAY'
  | 'RECIPIENT_REJECTION'
  | 'RECIPIENT_ACCEPTED'
  | 'SAFETY_FAILURE'
  | 'SAFETY_PASSED';

export interface LearningSignal {
  signalId: string;
  signalType: LearningSignalType;
  severity: 'low' | 'moderate' | 'high';
  timestamp: string;
  kitchenId: string;
  mealSlot: string;
  dishName?: string | null;
  description: string;
  metricObserved: number;
  targetThreshold: number;
  suggestedAction: string;
  feedbackDatasetReady: boolean;
  isDemoData?: boolean;
}

export interface LearningFeedbackPayload {
  kitchen_id: string;
  meal_slot: string;
  plan_date: string;
  dish_name: string;
  registered_headcount?: number;
  planned_portions?: number;
  predicted_portions: number;
  actual_consumed: number;
  actual_surplus?: number;
  reason_notes?: string;
}
