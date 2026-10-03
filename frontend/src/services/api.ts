import {
  TodayOverviewMetrics,
  DemandPredictionItem,
  SurplusItem,
  SurplusDetectionPayload,
  SafetyVerificationRecord,
  SafetyVerificationPayload,
  RecipientMatch,
  RedistributionDispatch,
  ImpactSummary,
} from '../types';
import {
  DEMO_OVERVIEW_METRICS,
  DEMO_DEMAND_PREDICTIONS,
  DEMO_SURPLUS_ITEMS,
  DEMO_SAFETY_RECORDS,
  DEMO_RECIPIENT_MATCHES,
  DEMO_REDISTRIBUTION_DISPATCHES,
  DEMO_IMPACT_SUMMARY,
} from '../data/mockData';

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Health check probe to FastAPI backend.
 */
export async function checkBackendHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch Today's Executive Overview from FastAPI /api/v1/overview/today
 * Falls back to demo baseline if backend is unavailable.
 */
export async function getTodayOverview(): Promise<TodayOverviewMetrics> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/overview/today`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      mealsPlanned: data.meals_planned,
      predictedDemand: data.predicted_demand,
      surplusRiskPortions: data.surplus_risk_portions,
      surplusRiskLevel: data.surplus_risk_level,
      availableForRescue: data.available_for_rescue,
      mealsRescuedToday: data.meals_rescued_today,
      wasteDivertedKg: data.waste_diverted_kg,
      co2eAvoidedKg: data.co2e_avoided_kg,
      activeRedistributionsCount: data.active_redistributions_count,
      lastUpdated: data.last_updated,
    };
  } catch (error) {
    console.warn('Using local demonstration fallback for overview:', error);
    return DEMO_OVERVIEW_METRICS;
  }
}

/**
 * Fetch demand forecasts from FastAPI /api/v1/demand/predictions
 */
export async function getDemandPredictions(): Promise<DemandPredictionItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/demand/predictions`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      mealSlot: d.meal_slot,
      plannedPortions: d.planned_portions,
      predictedPortions: d.predicted_portions,
      recommendedPrepPortions: d.recommended_prep_portions,
      variancePortions: d.variance_portions,
      variancePct: d.variance_pct,
      attendanceProjected: d.attendance_projected,
      historicalBaselinePortions: d.historical_baseline_portions,
      menuHighlights: d.menu_highlights || [],
      keyDrivers: d.key_drivers || [],
      reasonCodes: d.reason_codes || [],
      prepRecommendation: d.prep_recommendation,
      suggestedBatchReductionKg: d.suggested_batch_reduction_kg,
      riskSeverity: d.risk_severity,
      confidenceLevel: d.confidence_level,
      isDemoData: d.is_demo_data ?? true,
    }));
  } catch (error) {
    console.warn('Using local demonstration fallback for demand:', error);
    return DEMO_DEMAND_PREDICTIONS;
  }
}

/**
 * Execute ad-hoc explainable demand prediction via POST /api/v1/demand/predict
 */
export async function predictDemandAdHoc(
  payload: import('../types').DemandInputPayload
): Promise<DemandPredictionItem> {
  const res = await fetch(`${API_BASE_URL}/api/v1/demand/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    const message =
      errorDetails?.detail?.[0]?.msg ||
      errorDetails?.detail ||
      `Prediction failed with status: ${res.status}`;
    throw new Error(message);
  }

  const d = await res.json();
  return {
    id: d.id,
    mealSlot: d.meal_slot,
    plannedPortions: d.planned_portions,
    predictedPortions: d.predicted_portions,
    recommendedPrepPortions: d.recommended_prep_portions,
    variancePortions: d.variance_portions,
    variancePct: d.variance_pct,
    attendanceProjected: d.attendance_projected,
    historicalBaselinePortions: d.historical_baseline_portions,
    menuHighlights: d.menu_highlights || [],
    keyDrivers: d.key_drivers || [],
    reasonCodes: d.reason_codes || [],
    prepRecommendation: d.prep_recommendation,
    suggestedBatchReductionKg: d.suggested_batch_reduction_kg,
    riskSeverity: d.risk_severity,
    confidenceLevel: d.confidence_level,
    isDemoData: d.is_demo_data ?? false,
  };
}

/**
 * Fetch active surplus inventory from FastAPI /api/v1/surplus/active
 */
/**
 * Fetch active surplus inventory from FastAPI /api/v1/surplus/active
 */
export async function getActiveSurplus(): Promise<SurplusItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/surplus/active`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.map((s: any) => ({
      id: s.id,
      batchId: s.batch_id,
      mealSlot: s.meal_slot,
      dishName: s.dish_name,
      category: s.category,
      quantityKg: s.quantity_kg,
      portionsEquivalent: s.portions_equivalent,
      prepTimestamp: s.prep_timestamp,
      holdingTempC: s.holding_temp_c,
      status: s.status,
      storageUnit: s.storage_unit,
      shelfLifeRemainingHours: s.shelf_life_remaining_hours,
      requiresSafetyVerification: s.requires_safety_verification ?? true,
      redistributionEligible: s.redistribution_eligible ?? false,
      detectionTimestamp: s.detection_timestamp,
      reasonCodes: s.reason_codes || [],
      varianceExplanation: s.variance_explanation || '',
      isDemoData: s.is_demo_data ?? true,
    }));
  } catch (error) {
    console.warn('Using local demonstration fallback for surplus:', error);
    return DEMO_SURPLUS_ITEMS;
  }
}

/**
 * Fetch a single surplus batch by ID from FastAPI /api/v1/surplus/{surplus_id}
 */
export async function getSurplusById(surplusId: string): Promise<SurplusItem> {
  const res = await fetch(`${API_BASE_URL}/api/v1/surplus/${surplusId}`);
  if (!res.ok) throw new Error(`Surplus batch not found: ${res.status}`);
  const s = await res.json();
  return {
    id: s.id,
    batchId: s.batch_id,
    mealSlot: s.meal_slot,
    dishName: s.dish_name,
    category: s.category,
    quantityKg: s.quantity_kg,
    portionsEquivalent: s.portions_equivalent,
    prepTimestamp: s.prep_timestamp,
    holdingTempC: s.holding_temp_c,
    status: s.status,
    storageUnit: s.storage_unit,
    shelfLifeRemainingHours: s.shelf_life_remaining_hours,
    requiresSafetyVerification: s.requires_safety_verification ?? true,
    redistributionEligible: s.redistribution_eligible ?? false,
    detectionTimestamp: s.detection_timestamp,
    reasonCodes: s.reason_codes || [],
    varianceExplanation: s.variance_explanation || '',
    isDemoData: s.is_demo_data ?? false,
  };
}

/**
 * Log and detect surplus remnant via POST /api/v1/surplus/detect
 */
export async function detectSurplus(
  payload: SurplusDetectionPayload
): Promise<SurplusItem> {
  const res = await fetch(`${API_BASE_URL}/api/v1/surplus/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    const message =
      errorDetails?.detail?.[0]?.msg ||
      errorDetails?.detail ||
      `Surplus detection failed with status: ${res.status}`;
    throw new Error(message);
  }

  const s = await res.json();
  return {
    id: s.id,
    batchId: s.batch_id,
    mealSlot: s.meal_slot,
    dishName: s.dish_name,
    category: s.category,
    quantityKg: s.quantity_kg,
    portionsEquivalent: s.portions_equivalent,
    prepTimestamp: s.prep_timestamp,
    holdingTempC: s.holding_temp_c,
    status: s.status,
    storageUnit: s.storage_unit,
    shelfLifeRemainingHours: s.shelf_life_remaining_hours,
    requiresSafetyVerification: s.requires_safety_verification ?? true,
    redistributionEligible: s.redistribution_eligible ?? false,
    detectionTimestamp: s.detection_timestamp,
    reasonCodes: s.reason_codes || [],
    varianceExplanation: s.variance_explanation || '',
    isDemoData: s.is_demo_data ?? false,
  };
}

/**
 * Fetch safety records from FastAPI /api/v1/safety/records
 */
export async function getSafetyRecords(): Promise<SafetyVerificationRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/safety/records`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.map((r: any) => ({
      id: r.id,
      surplusId: r.surplus_id,
      dishName: r.dish_name,
      batchCode: r.batch_code,
      inspectionTimestamp: r.inspection_timestamp,
      coreTempC: r.core_temp_c,
      tempStandard: r.temp_standard,
      isTempCompliant: r.is_temp_compliant,
      holdTimeElapsedHours: r.hold_time_elapsed_hours,
      maxSafeHoldHours: r.max_safe_hold_hours,
      sensoryInspection: {
        odorNormal: r.sensory_inspection.odor_normal,
        colorNormal: r.sensory_inspection.color_normal,
        textureNormal: r.sensory_inspection.texture_normal,
        sanitaryVessel: r.sensory_inspection.sanitary_vessel,
      },
      complianceStatus: r.compliance_status,
      redistributionEligible: r.redistribution_eligible ?? (r.compliance_status === 'Verified Safe'),
      regulatoryBasis: r.regulatory_basis || 'FSSAI Schedule 4',
      operationalRule: r.operational_rule || '4.0h Safe Hold Ceiling',
      reasonCodes: r.reason_codes || [],
      observations: r.observations || [],
      inspectorName: r.inspector_name,
      digitalCertificateId: r.digital_certificate_id,
      fssaiRegulation: r.fssai_regulation,
      isDemoData: r.is_demo_data ?? true,
    }));
  } catch (error) {
    console.warn('Using local demonstration fallback for safety records:', error);
    return DEMO_SAFETY_RECORDS;
  }
}

/**
 * Submit safety verification sign-off via POST /api/v1/safety/verify
 */
export async function verifySafety(
  payload: SafetyVerificationPayload
): Promise<SafetyVerificationRecord> {
  const res = await fetch(`${API_BASE_URL}/api/v1/safety/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    const message =
      errorDetails?.detail?.[0]?.msg ||
      errorDetails?.detail ||
      `Safety verification failed with status: ${res.status}`;
    throw new Error(message);
  }

  const r = await res.json();
  return {
    id: r.id,
    surplusId: r.surplus_id,
    dishName: r.dish_name,
    batchCode: r.batch_code,
    inspectionTimestamp: r.inspection_timestamp,
    coreTempC: r.core_temp_c,
    tempStandard: r.temp_standard,
    isTempCompliant: r.is_temp_compliant,
    holdTimeElapsedHours: r.hold_time_elapsed_hours,
    maxSafeHoldHours: r.max_safe_hold_hours,
    sensoryInspection: {
      odorNormal: r.sensory_inspection.odor_normal,
      colorNormal: r.sensory_inspection.color_normal,
      textureNormal: r.sensory_inspection.texture_normal,
      sanitaryVessel: r.sensory_inspection.sanitary_vessel,
    },
    complianceStatus: r.compliance_status,
    redistributionEligible: r.redistribution_eligible ?? (r.compliance_status === 'Verified Safe'),
    regulatoryBasis: r.regulatory_basis,
    operationalRule: r.operational_rule,
    reasonCodes: r.reason_codes || [],
    observations: r.observations || [],
    inspectorName: r.inspector_name,
    digitalCertificateId: r.digital_certificate_id,
    fssaiRegulation: r.fssai_regulation,
    isDemoData: r.is_demo_data ?? false,
  };
}

/**
 * Fetch candidate beneficiary matches from FastAPI /api/v1/matching/suggested
 */
export async function getRecipientMatches(surplusId?: string): Promise<RecipientMatch[]> {
  try {
    const url = surplusId
      ? `${API_BASE_URL}/api/v1/matching/suggested?surplus_id=${encodeURIComponent(surplusId)}`
      : `${API_BASE_URL}/api/v1/matching/suggested`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.map((m: any) => ({
      id: m.id,
      matchId: m.match_id || m.id,
      surplusId: m.surplus_id,
      dishName: m.dish_name,
      portionsAvailable: m.portions_available,
      recipientId: m.recipient_id || 'REC-DEMO-01',
      recipientName: m.recipient_name,
      orgType: m.org_type,
      distanceKm: m.distance_km,
      transitMinutes: m.transit_minutes,
      capacityNeededPortions: m.capacity_needed_portions,
      dietaryCompatibility: m.dietary_compatibility,
      priorityScore: m.priority_score,
      matchScore: m.match_score ?? m.priority_score,
      urgencyLevel: m.urgency_level,
      matchStatus: m.match_status,
      eligibility: m.eligibility ?? true,
      reasons: m.reasons || [],
      rank: m.rank ?? 1,
      estimatedPickupTime: m.estimated_pickup_time,
      scoringBreakdown: m.scoring_breakdown,
      isDemoData: m.is_demo_data ?? true,
    }));
  } catch (error) {
    console.warn('Using local demonstration fallback for matches:', error);
    return DEMO_RECIPIENT_MATCHES;
  }
}

/**
 * Accept a suggested match and trigger driver assignment via POST /api/v1/matching/{match_id}/accept
 */
export async function acceptRecipientMatch(matchId: string): Promise<RecipientMatch> {
  const res = await fetch(`${API_BASE_URL}/api/v1/matching/${encodeURIComponent(matchId)}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    const message =
      errorDetails?.detail?.[0]?.msg ||
      errorDetails?.detail ||
      `Failed to accept match candidate (HTTP ${res.status})`;
    throw new Error(message);
  }

  const m = await res.json();
  return {
    id: m.id,
    matchId: m.match_id || m.id,
    surplusId: m.surplus_id,
    dishName: m.dish_name,
    portionsAvailable: m.portions_available,
    recipientId: m.recipient_id,
    recipientName: m.recipient_name,
    orgType: m.org_type,
    distanceKm: m.distance_km,
    transitMinutes: m.transit_minutes,
    capacityNeededPortions: m.capacity_needed_portions,
    dietaryCompatibility: m.dietary_compatibility,
    priorityScore: m.priority_score,
    matchScore: m.match_score ?? m.priority_score,
    urgencyLevel: m.urgency_level,
    matchStatus: m.match_status,
    eligibility: m.eligibility ?? true,
    reasons: m.reasons || [],
    rank: m.rank ?? 1,
    estimatedPickupTime: m.estimated_pickup_time,
    scoringBreakdown: m.scoring_breakdown,
    isDemoData: m.is_demo_data ?? true,
  };
}

/**
 * Fetch active dispatches from FastAPI /api/v1/redistribution/dispatches
 */
export async function getRedistributionDispatches(): Promise<RedistributionDispatch[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/redistribution/dispatches`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.map((d: any) => ({
      dispatchId: d.dispatch_id,
      matchId: d.match_id,
      surplusId: d.surplus_id,
      recipientId: d.recipient_id,
      surplusSummary: d.surplus_summary,
      portions: d.portions,
      recipientName: d.recipient_name,
      destinationAddress: d.destination_address,
      courierName: d.courier_name,
      vehicleType: d.vehicle_type,
      dispatchTime: d.dispatch_time,
      eta: d.eta,
      stage: d.stage,
      transitTempCompliant: d.transit_temp_compliant,
      transitTempC: d.transit_temp_c,
      handoverCode: d.handover_code,
      isVerified: d.is_verified,
      verificationTimestamp: d.verification_timestamp,
      isDemoData: d.is_demo_data ?? true,
    }));
  } catch (error) {
    console.warn('Using local demonstration fallback for dispatches:', error);
    return DEMO_REDISTRIBUTION_DISPATCHES;
  }
}

/**
 * Submit demo handover OTP code for custody confirmation via POST /api/v1/redistribution/verify-otp
 */
export async function verifyHandoverOtp(
  dispatchId: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/redistribution/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      dispatch_id: dispatchId,
      otp_code: otpCode,
    }),
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    const message =
      errorDetails?.detail?.[0]?.msg ||
      errorDetails?.detail ||
      `OTP verification failed with status: ${res.status}`;
    throw new Error(message);
  }

  const data = await res.json();
  return {
    success: data.status === 'success',
    message: data.message,
  };
}

/**
 * Fetch impact summary from FastAPI /api/v1/impact/summary
 */
export async function getImpactSummary(): Promise<ImpactSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/impact/summary`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      totalMealsRescued: data.total_meals_rescued,
      totalKgWasteDiverted: data.total_kg_waste_diverted,
      ghgAvoidedCo2eKg: data.ghg_avoided_co2e_kg,
      waterSavedLiters: data.water_saved_liters,
      beneficiaryCountServed: data.beneficiary_count_served,
      averageKitchenSurplusReductionPct: data.average_kitchen_surplus_reduction_pct,
      monthlyTrends: data.monthly_trends.map((t: any) => ({
        month: t.month,
        plannedPortions: t.planned_portions,
        actualConsumedPortions: t.actual_consumed_portions,
        rescuedPortions: t.rescued_portions,
        divertedKg: t.diverted_kg,
      })),
      categoryBreakdown: data.category_breakdown.map((c: any) => ({
        category: c.category,
        percentage: c.percentage,
        rescuedKg: c.rescued_kg,
      })),
    };
  } catch (error) {
    console.warn('Using local demonstration fallback for impact:', error);
    return DEMO_IMPACT_SUMMARY;
  }
}
