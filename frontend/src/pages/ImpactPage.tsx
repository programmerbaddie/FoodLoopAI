import React, { useState, useEffect } from 'react';
import {
  Award,
  Leaf,
  Droplets,
  Users,
  RotateCw,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Scale,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  NavTabId,
  ImpactSummary,
  ImpactEvent,
  DemandPerformanceSummary,
  LearningSignal,
} from '../types';
import {
  getImpactSummary,
  getImpactEvents,
  getDemandPerformance,
  getLearningSignals,
} from '../services/api';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { DataTable } from '../components/ui/DataTable';
import { ActionButton } from '../components/ui/ActionButton';
import { WorkflowContextBar } from '../components/ui/WorkflowContextBar';

interface ImpactPageProps {
  onNavigateTab?: (tab: NavTabId) => void;
}

export const ImpactPage: React.FC<ImpactPageProps> = ({ onNavigateTab }) => {
  const [summary, setSummary] = useState<ImpactSummary | null>(null);
  const [events, setEvents] = useState<ImpactEvent[]>([]);
  const [demandPerf, setDemandPerf] = useState<DemandPerformanceSummary | null>(null);
  const [signals, setSignals] = useState<LearningSignal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [sumData, evtData, perfData, sigData] = await Promise.all([
        getImpactSummary(),
        getImpactEvents(),
        getDemandPerformance(),
        getLearningSignals(),
      ]);
      setSummary(sumData);
      setEvents(evtData);
      setDemandPerf(perfData);
      setSignals(sigData);
    } catch (err) {
      console.warn('Failed to load live impact data, using local fallback:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  if (isLoading && !summary) {
    return (
      <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
        Loading impact telemetry and closed-loop learning parameters...
      </div>
    );
  }

  const imp = summary!;
  const perf = demandPerf;

  // Food Waste Flow calculations from events
  const totalPreparedPortions = events.reduce((acc, e) => acc + e.mealsPrepared, 0);
  const totalConsumedPortions = events.reduce((acc, e) => acc + e.actualConsumed, 0);
  const totalSurplusPortions = events.reduce((acc, e) => acc + e.surplusPortions, 0);
  const totalSafePortions = events
    .filter((e) => e.safetyOutcome === 'Verified Safe' || e.safetyOutcome === 'Safety Verified')
    .reduce((acc, e) => acc + e.surplusPortions, 0);
  const totalRedistributedPortions = events.reduce(
    (acc, e) => acc + e.safelyRedistributedPortions,
    0
  );
  const totalCompostedPortions = events
    .filter((e) => e.redistributionOutcome === 'Composted')
    .reduce((acc, e) => acc + e.surplusPortions, 0);

  const monthlyHeaders = [
    'Month',
    'Total Planned Portions',
    'Actual Diner Consumption',
    'Portions Rescued & Redistributed',
    'Organic Waste Diverted (kg)',
    'Institutional Efficiency',
  ];

  const demandPerfHeaders = [
    'Meal Slot / Date',
    'Dish Name',
    'Planned Portions',
    'Predicted Diners',
    'Actual Diners',
    'Variance (Error)',
    'Forecast Bias',
    'Surplus Generated',
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Navigation Context */}
      <WorkflowContextBar
        currentStage="LEARN"
        purpose="Post-service outcome accounting, food waste diversion telemetry, and closed-loop demand forecast calibration."
        prev={{ tab: 'redistribution', label: 'REDISTRIBUTE: Logistics' }}
        next={{ tab: 'overview', label: 'Overview: Operations' }}
        onNavigate={onNavigateTab}
      />

      {/* Header Banner */}
      <div className="bg-foodloop-surface dark:bg-slate-900 border border-foodloop-border dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
        <SectionHeader
          title="Impact Telemetry & Closed-Loop Learning"
          subtitle="Post-service outcome accounting, demand prediction calibration, and curated feedback datasets"
          badge="STAGE 07: LEARN"
          actions={
            <ActionButton
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadAllData}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Telemetry'}
            </ActionButton>
          }
        />

        <div className="mt-4 p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
          <RotateCw className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>The Closed-Loop Feedback Principle:</strong> Every post-service variance logged today connects historical actual consumption back to demand forecasts. This structures clean outcome datasets that calibrate future prep multipliers and ML weights without manual guesswork.
          </div>
        </div>
      </div>

      {/* 1. Today's Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Meals Rescued"
          value={imp.totalMealsRescued.toLocaleString()}
          unit="portions"
          subtext="Nutritious meals delivered to verified demonstration shelters"
          badge={{ text: 'Verified Handoffs', variant: 'green' }}
          icon={Award}
          variant="highlight"
        />

        <MetricCard
          label="Organic Waste Diverted"
          value={`${imp.totalKgWasteDiverted.toLocaleString()} kg`}
          subtext="Diverted entirely from municipal landfills"
          badge={{ text: 'Zero Landfill', variant: 'green' }}
          icon={Leaf}
        />

        <MetricCard
          label="Redistribution Rescue Rate"
          value={`${imp.rescueRatePct ?? 88.5}%`}
          subtext={`${imp.successfulHandoffCount ?? 4} verified handoffs / ${(imp.successfulHandoffCount ?? 4) + (imp.failedOrCancelledCount ?? 1)} total consignments`}
          badge={{ text: 'Handoff Success', variant: 'green' }}
          icon={CheckCircle2}
        />

        <MetricCard
          label="Avg Pickup & Delivery Transit"
          value={`${imp.averagePickupTimeMinutes ?? 23.2} min`}
          subtext="Elapsed dispatch to shelter handoff confirmation"
          badge={{ text: 'Thermal Window Maintained', variant: 'blue' }}
          icon={Clock}
        />
      </div>

      {/* 2. Food Waste Flow (Sankey-style linear progression) */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foodloop-navy">
              Operational Food Mass Flow (Logged Service Cycles)
            </h3>
            <p className="text-xs text-slate-500">
              End-to-end portion accountability from kitchen stove to verified recipient delivery
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
            {events.length} Demo Service Logs Evaluated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Step 1: Prepared */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              1. Prepared
            </span>
            <span className="text-lg font-bold text-foodloop-navy font-mono">
              {totalPreparedPortions.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 block">Cooked Portions</span>
          </div>

          {/* Step 2: Consumed */}
          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">
              2. Consumed
            </span>
            <span className="text-lg font-bold text-blue-900 font-mono">
              {totalConsumedPortions.toLocaleString()}
            </span>
            <span className="text-[11px] text-blue-700 block">
              {totalPreparedPortions > 0
                ? `${((totalConsumedPortions / totalPreparedPortions) * 100).toFixed(1)}% Eaten`
                : '0% Eaten'}
            </span>
          </div>

          {/* Step 3: Surplus */}
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">
              3. Surplus
            </span>
            <span className="text-lg font-bold text-amber-900 font-mono">
              {totalSurplusPortions.toLocaleString()}
            </span>
            <span className="text-[11px] text-amber-700 block">Post-Service Excess</span>
          </div>

          {/* Step 4: Safety Verified */}
          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
              4. Safety Verified
            </span>
            <span className="text-lg font-bold text-foodloop-green font-mono">
              {totalSafePortions.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-700 block">Passed Safety & Thermal Criteria</span>
          </div>

          {/* Step 5: Redistributed */}
          <div className="p-3 rounded-lg bg-emerald-100/50 border border-emerald-300 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-900 block">
              5. Rescued
            </span>
            <span className="text-lg font-bold text-emerald-950 font-mono">
              {totalRedistributedPortions.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-800 block">Shelter Deliveries</span>
          </div>

          {/* Step 6: Composted / Blocked */}
          <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-800 block">
              6. Composted
            </span>
            <span className="text-lg font-bold text-rose-900 font-mono">
              {totalCompostedPortions.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-700 block">Non-Compliant Diverted</span>
          </div>
        </div>
      </div>

      {/* 3. Demand Performance Evaluation (Predicted vs Actual) */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <SectionHeader
              title="Demand Forecast Accuracy & Variance Analysis"
              subtitle="Closed-loop verification comparing AI predictions against checkout turnstiles"
            />
          </div>
          {perf && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-foodloop-navy border border-slate-200 font-mono">
                MAE: <strong>{perf.meanAbsoluteError} portions</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-foodloop-navy border border-slate-200 font-mono">
                MAPE: <strong>{perf.meanPercentageError}%</strong>
              </span>
            </div>
          )}
        </div>

        {perf && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Balanced Predictions (within ±5%):</span>
              <span className="font-bold font-mono text-foodloop-green">
                {perf.balancedCount} / {perf.totalEvaluatedMeals} meals
              </span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 flex items-center justify-between">
              <span className="text-amber-800">Over-Predictions (Prep Excess):</span>
              <span className="font-bold font-mono text-amber-900">
                {perf.overPredictionCount} meals
              </span>
            </div>
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center justify-between">
              <span className="text-blue-800">Under-Predictions (Demand Surges):</span>
              <span className="font-bold font-mono text-blue-900">
                {perf.underPredictionCount} meals
              </span>
            </div>
          </div>
        )}

        {perf && perf.records.length > 0 && (
          <DataTable headers={demandPerfHeaders}>
            {perf.records.map((r) => (
              <tr key={r.recordId} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="px-4 py-3 font-medium text-foodloop-navy">
                  <div>{r.mealSlot}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{r.planDate}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-foodloop-navy">
                  {r.dishName}
                </td>
                <td className="px-4 py-3 tabular-numbers text-slate-600 font-mono">
                  {r.plannedPortions}
                </td>
                <td className="px-4 py-3 tabular-numbers font-mono text-blue-700">
                  {r.predictedDiners}
                </td>
                <td className="px-4 py-3 tabular-numbers font-mono font-bold text-foodloop-navy">
                  {r.actualDiners}
                </td>
                <td className="px-4 py-3 tabular-numbers font-mono">
                  <span
                    className={
                      r.absoluteError === 0
                        ? 'text-foodloop-green font-bold'
                        : r.bias === 'Over-Prediction'
                        ? 'text-amber-700 font-semibold'
                        : 'text-blue-700 font-semibold'
                    }
                  >
                    {r.bias === 'Over-Prediction' ? `+${r.absoluteError}` : `-${r.absoluteError}`} ({r.percentageError}%)
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      r.bias === 'Balanced'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : r.bias === 'Over-Prediction'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    {r.bias}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-numbers font-mono font-semibold text-slate-700">
                  {r.actualSurplusPortions} portions
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>

      {/* 4 & 5. Learning Signals & Operational Feedback Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Operational Learning Signals (2 cols) */}
        <div className="lg:col-span-2 bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Curated Operational Learning Signals"
              subtitle="Automated alerts and parameter adjustments curated for kitchen planning"
            />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              Training Pipeline Ready
            </span>
          </div>

          <div className="space-y-3">
            {signals.map((sig) => {
              const isOverPrep = sig.signalType === 'OVER_PREPARATION';
              const isHighSurplus = sig.signalType === 'HIGH_SURPLUS_MEAL';
              const isSafetyFail = sig.signalType === 'SAFETY_FAILURE';
              const isAccepted = sig.signalType === 'RECIPIENT_ACCEPTED';
              const isPickupDelay = sig.signalType === 'PICKUP_DELAY';

              return (
                <div
                  key={sig.signalId}
                  className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-colors ${
                    isSafetyFail
                      ? 'bg-rose-50/60 border-rose-200'
                      : isOverPrep || isHighSurplus
                      ? 'bg-amber-50/50 border-amber-200'
                      : isAccepted
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isPickupDelay
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500">
                        {sig.signalId}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          isSafetyFail
                            ? 'bg-rose-100 text-rose-800'
                            : isOverPrep || isHighSurplus
                            ? 'bg-amber-100 text-amber-800'
                            : isAccepted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPickupDelay
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {sig.signalType.replace(/_/g, ' ')}
                      </span>
                      {sig.dishName && (
                        <span className="font-semibold text-foodloop-navy truncate max-w-xs">
                          {sig.dishName}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {sig.timestamp}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{sig.description}</p>

                  <div className="pt-1 flex items-start gap-1 text-[11px] text-slate-600 bg-white/70 p-2 rounded border border-slate-200/60">
                    <strong className="text-foodloop-navy shrink-0">Suggested Action:</strong>
                    <span>{sig.suggestedAction}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-500 border border-slate-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong>Model Training Notice:</strong> These signal records are structured into normalized training vectors for scheduled batch model retraining. FoodLoop does not perform unverified real-time autonomous parameter shifts without supervisor review.
            </span>
          </div>
        </div>

        {/* Right: Category Composition & Demographics (1 col) */}
        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
          <SectionHeader
            title="Diverted Food Categories"
            subtitle="Composition of rescued food by culinary type"
          />

          <div className="space-y-3">
            {imp.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foodloop-navy">{cat.category}</span>
                  <span className="font-mono text-slate-500">
                    {cat.percentage}% ({cat.rescuedKg} kg)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-foodloop-green h-2 rounded-full transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-foodloop-green" />
                <span>Estimated Beneficiaries:</span>
              </span>
              <span className="font-bold text-foodloop-navy tabular-numbers">
                {imp.beneficiaryCountServed.toLocaleString()} people
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>Measured Surplus Rate:</span>
              </span>
              <span className="font-bold text-foodloop-navy tabular-numbers font-mono">
                {imp.surplusRatePct ?? 11.8}% of prepared
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Modelled Environmental Estimates (with Configurable Assumptions) */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <SectionHeader
              title="Modelled Environmental Offsets"
              subtitle="Calculated greenhouse gas avoidance and virtual irrigation water conservation"
            />
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
            Modelled Assumption Factors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-foodloop-canvas border border-foodloop-border space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-700" />
              <h4 className="text-xs font-bold text-foodloop-navy uppercase">
                Modelled GHG Emissions Avoided
              </h4>
            </div>
            <div className="text-2xl font-bold font-mono text-foodloop-navy">
              {imp.ghgAvoidedCo2eKg.toLocaleString()} kg CO₂e
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Calculated using standard organic waste methane diversion assumption of{' '}
              <strong>
                {imp.environmentalAssumptions?.co2eFactorKgPerKgFood ?? 2.2} kg CO₂e
              </strong>{' '}
              per kg of cooked organic mass diverted from anaerobic municipal landfill decomposition.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-foodloop-canvas border border-foodloop-border space-y-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-700" />
              <h4 className="text-xs font-bold text-foodloop-navy uppercase">
                Modelled Virtual Water Footprint Preserved
              </h4>
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-900">
              {(imp.waterSavedLiters / 1000000).toFixed(2)}M Liters
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Conserves embedded agricultural irrigation water calculated at an assumed rate of{' '}
              <strong>
                {imp.environmentalAssumptions?.waterFactorLitersPerKgFood ?? 500} Liters
              </strong>{' '}
              per kg of prepared grains and pulses preserved.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Methodology & Scientific Integrity Statement</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {imp.environmentalAssumptions?.methodologyNote ??
              'Modelled estimates derived from published institutional catering lifecycle factors; not certified physical field measurements.'}
            These metrics communicate directional ecological benefit for institutional reporting and should not be construed as verified carbon credit issuance.
          </p>
        </div>
      </div>

      {/* 7. Part 7 — Technical Closed-Loop Visualization */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
        <SectionHeader
          title="FoodLoop Closed-Loop Learning Architecture"
          subtitle="How operational outcomes continuously inform future kitchen demand baselines"
        />

        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto">
          <div className="min-w-[760px] space-y-4">
            <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">
              OPERATIONAL LIFECYCLE & FEEDBACK CONDUIT (PREDICT → PREVENT → VERIFY → MATCH → REDISTRIBUTE → LEARN)
            </div>

            {/* Stage Row 1: Forward Execution */}
            <div className="grid grid-cols-6 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-sans">INPUT</span>
                <span className="font-bold text-white">Historical Data</span>
              </div>
              <div className="p-2.5 rounded bg-blue-950/80 border border-blue-800 text-blue-200">
                <span className="text-[10px] text-blue-300 block font-sans">STAGE 01</span>
                <span className="font-bold">Demand Prediction</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-sans">STAGE 02</span>
                <span className="font-bold text-white">Kitchen Prep</span>
              </div>
              <div className="p-2.5 rounded bg-amber-950/80 border border-amber-800 text-amber-200">
                <span className="text-[10px] text-amber-300 block font-sans">STAGE 03</span>
                <span className="font-bold">Surplus Detect</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-200">
                <span className="text-[10px] text-emerald-300 block font-sans">STAGE 04</span>
                <span className="font-bold">Safety Verify</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-900/80 border border-emerald-700 text-emerald-100">
                <span className="text-[10px] text-emerald-300 block font-sans">STAGE 05-06</span>
                <span className="font-bold">Dispatch & Handoff</span>
              </div>
            </div>

            {/* Arrow Divider */}
            <div className="flex items-center justify-between px-6 text-slate-500 text-xs">
              <div className="w-full flex items-center justify-center gap-2">
                <span className="h-px bg-slate-700 flex-1" />
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  Physical Execution Completed <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="h-px bg-slate-700 flex-1" />
              </div>
            </div>

            {/* Stage Row 2: Backward Feedback Loop */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">OUTCOME LOG</span>
                <span className="font-bold">Actual Diners & Surplus</span>
              </div>
              <div className="p-2.5 rounded bg-amber-950/60 border border-amber-800 text-amber-200">
                <span className="text-[10px] text-amber-300 block font-sans">VARIANCE AUDIT</span>
                <span className="font-bold">Prediction Error (MAE/MAPE)</span>
              </div>
              <div className="p-2.5 rounded bg-blue-950/60 border border-blue-800 text-blue-200">
                <span className="text-[10px] text-blue-300 block font-sans">SIGNAL CURATION</span>
                <span className="font-bold">Prep Adjustment Multiplier</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-200">
                <span className="text-[10px] text-emerald-300 block font-sans">CLOSED-LOOP TARGET</span>
                <span className="font-bold">Future Forecast Calibration</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800 font-sans">
              <strong>Closed-Loop Operational Policy:</strong> Actual consumption variances automatically update baseline statistical priors.
              In future phases, this curated outcome dataset directly feeds training for gradient-boosted demand models.
            </div>
          </div>
        </div>
      </div>

      {/* 8. Longitudinal Monthly Trend Table */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
        <SectionHeader
          title="Monthly Waste Reduction & Consumption Baseline"
          subtitle="Demonstrating progressive baseline accuracy improvements over demonstration months"
        />

        <DataTable headers={monthlyHeaders}>
          {imp.monthlyTrends.map((row) => {
            const efficiency = (
              (row.actualConsumedPortions / row.plannedPortions) *
              100
            ).toFixed(1);

            return (
              <tr key={row.month} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="px-4 py-3 font-semibold text-foodloop-navy">
                  {row.month}
                </td>
                <td className="px-4 py-3 tabular-numbers text-slate-600 font-mono">
                  {row.plannedPortions.toLocaleString()}
                </td>
                <td className="px-4 py-3 tabular-numbers font-medium text-foodloop-navy font-mono">
                  {row.actualConsumedPortions.toLocaleString()}
                </td>
                <td className="px-4 py-3 tabular-numbers text-foodloop-green font-semibold font-mono">
                  {row.rescuedPortions.toLocaleString()}
                </td>
                <td className="px-4 py-3 tabular-numbers font-mono text-slate-700">
                  {row.divertedKg} kg
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                    {efficiency}% Efficiency
                  </span>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </div>
  );
};
