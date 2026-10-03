import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Info,
  Calculator,
  RotateCw,
  Server,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { DemandPredictionItem, DemandInputPayload } from '../types';
import { DEMO_DEMAND_PREDICTIONS } from '../data/mockData';
import { getDemandPredictions, predictDemandAdHoc } from '../services/api';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { ActionButton } from '../components/ui/ActionButton';

export const DemandPredictionPage: React.FC = () => {
  const [predictions, setPredictions] = useState<DemandPredictionItem[]>(
    DEMO_DEMAND_PREDICTIONS
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveFromBackend, setIsLiveFromBackend] = useState<boolean>(false);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  // Ad-hoc calculation form state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [calcForm, setCalcForm] = useState<DemandInputPayload>({
    kitchen_id: 'KITCHEN-IITD-01',
    meal_slot: 'Dinner',
    plan_date: new Date().toISOString().split('T')[0],
    registered_headcount: 600,
    planned_portions: 530,
    confirmed_leaves: 62,
    historical_consumption_rate: 0.82,
    special_events: ['Friday weekend departures'],
    weather_context: 'Clear',
  });
  const [calcLoading, setCalcLoading] = useState<boolean>(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [calcResult, setCalcResult] = useState<DemandPredictionItem | null>(null);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const data = await getDemandPredictions();
      setPredictions(data);
      // If we got items from backend
      setIsLiveFromBackend(true);
    } catch {
      setIsLiveFromBackend(false);
      setPredictions(DEMO_DEMAND_PREDICTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => ({ ...prev, [id]: true }));
  };

  const handleRunAdHocPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcLoading(true);
    setCalcError(null);
    try {
      const res = await predictDemandAdHoc(calcForm);
      setCalcResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Calculation failed';
      setCalcError(msg);
    } finally {
      setCalcLoading(false);
    }
  };

  const tableHeaders = [
    'Meal Slot',
    'Planned Portions',
    'Predicted Demand',
    'Recommended Cook Batch',
    'Variance (Expected Remnant)',
    'Projected Headcount',
    'Batch Prep Cut (kg)',
    'Quality Signal',
    'Kitchen Action',
  ];

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs">
        <SectionHeader
          title="Demand Prediction & Surplus Prevention Engine"
          subtitle="Pre-cooking forecast calculated from student attendance registers, confirmed leave requests, and calendar indicators"
          badge="STAGE 02: PREVENT"
          actions={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono ${
                  isLiveFromBackend
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>
                  {isLiveFromBackend
                    ? 'FastAPI Engine Active'
                    : 'Demonstration / Fallback Cache'}
                </span>
              </span>

              <ActionButton
                variant="outline"
                size="sm"
                icon={RotateCw}
                onClick={fetchPredictions}
                loading={loading}
              >
                Sync
              </ActionButton>

              <ActionButton
                variant="primary"
                size="sm"
                icon={Calculator}
                onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              >
                {isCalculatorOpen ? 'Hide Calculator' : 'Custom Service Calculator'}
              </ActionButton>
            </div>
          }
        />

        {/* Explainable Methodology Notice */}
        <div className="mt-4 p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Transparent Multi-Factor Model:</strong> Predictions are generated using historical meal attendance decay vectors adjusted for verifiable external inputs (e.g. portal mess leaves, campus events, and weather). Kitchen supervisors retain full manual override control over all batch sizes.
          </div>
        </div>
      </div>

      {/* Interactive Ad-Hoc Service Calculator Section */}
      {isCalculatorOpen && (
        <div className="bg-foodloop-surface border border-foodloop-greenBorder rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-foodloop-border">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-foodloop-green" />
              <h3 className="text-base font-bold text-foodloop-navy">
                Live Meal Slot Demand Calculator
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              POST /api/v1/demand/predict
            </span>
          </div>

          <form onSubmit={handleRunAdHocPredict} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Meal Slot
                </label>
                <select
                  value={calcForm.meal_slot}
                  onChange={(e) =>
                    setCalcForm({
                      ...calcForm,
                      meal_slot: e.target.value as any,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snacks">Evening Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Service Date
                </label>
                <input
                  type="date"
                  value={calcForm.plan_date}
                  onChange={(e) =>
                    setCalcForm({ ...calcForm, plan_date: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Registered Headcount
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={calcForm.registered_headcount}
                  onChange={(e) =>
                    setCalcForm({
                      ...calcForm,
                      registered_headcount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Baseline Planned Portions
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={calcForm.planned_portions}
                  onChange={(e) =>
                    setCalcForm({
                      ...calcForm,
                      planned_portions: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Verified Portal Leaves
                </label>
                <input
                  type="number"
                  min="0"
                  max={calcForm.registered_headcount}
                  value={calcForm.confirmed_leaves || 0}
                  onChange={(e) =>
                    setCalcForm({
                      ...calcForm,
                      confirmed_leaves: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Historical Turnout Rate (0.1 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1.0"
                  value={calcForm.historical_consumption_rate || 0.85}
                  onChange={(e) =>
                    setCalcForm({
                      ...calcForm,
                      historical_consumption_rate: parseFloat(e.target.value) || 0.85,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Special Campus Event
                </label>
                <input
                  type="text"
                  placeholder="e.g. Symposium, Sports meet, Exams"
                  value={calcForm.special_events?.[0] || ''}
                  onChange={(e) =>
                    setCalcForm({
                      ...calcForm,
                      special_events: e.target.value ? [e.target.value] : [],
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Weather Condition
                </label>
                <select
                  value={calcForm.weather_context || 'Clear'}
                  onChange={(e) =>
                    setCalcForm({ ...calcForm, weather_context: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                >
                  <option value="Clear">Clear Sky / Normal</option>
                  <option value="Rain">Rain / Inclement</option>
                  <option value="Heatwave">Extreme Heat</option>
                </select>
              </div>
            </div>

            {calcError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{calcError}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <ActionButton
                type="submit"
                variant="primary"
                size="sm"
                icon={Sparkles}
                loading={calcLoading}
              >
                Compute Demand Forecast
              </ActionButton>
            </div>
          </form>

          {/* Ad-hoc Result Card */}
          {calcResult && (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 mt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-emerald-200 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-foodloop-navy">
                    Forecast Result: {calcResult.mealSlot} ({calcResult.id})
                  </span>
                  <StatusBadge
                    status={calcResult.confidenceLevel || 'High Signal'}
                    variant="safe"
                    size="sm"
                  />
                </div>
                <span className="text-xs font-mono font-bold text-foodloop-navy">
                  Batch Prep Target: {calcResult.recommendedPrepPortions || calcResult.predictedPortions} Portions
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    Planned
                  </span>
                  <span className="text-lg font-bold text-foodloop-navy">
                    {calcResult.plannedPortions}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-foodloop-green uppercase block font-semibold">
                    Predicted Diners
                  </span>
                  <span className="text-lg font-bold text-foodloop-green">
                    {calcResult.predictedPortions}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-foodloop-orange uppercase block font-semibold">
                    Variance
                  </span>
                  <span className="text-lg font-bold text-foodloop-orange font-mono">
                    {calcResult.variancePortions} ({calcResult.variancePct}%)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    Recommended Batch Cut
                  </span>
                  <span className="text-lg font-bold text-foodloop-orange font-mono">
                    -{calcResult.suggestedBatchReductionKg} kg
                  </span>
                </div>
              </div>

              {calcResult.reasonCodes && calcResult.reasonCodes.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" /> Factor Codes:
                  </span>
                  {calcResult.reasonCodes.map((code: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-slate-200"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              )}

              <div className="p-3 rounded-lg bg-white border border-emerald-100 text-xs text-slate-700 leading-relaxed">
                <strong>Actionable Guidance: </strong>
                {calcResult.prepRecommendation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Meal Slots Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {predictions.map((dp) => {
          const isAck = acknowledged[dp.id];
          return (
            <div
              key={dp.id}
              className={`rounded-xl border p-5 shadow-xs transition-colors bg-white flex flex-col justify-between ${
                dp.riskSeverity === 'high'
                  ? 'border-amber-300'
                  : 'border-foodloop-border'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-foodloop-border">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-foodloop-navy">
                        {dp.mealSlot} Service
                      </span>
                      {dp.isDemoData && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          Synthetic Baseline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foodloop-textMuted">
                      Expected Attendance: {dp.attendanceProjected} students
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <StatusBadge
                      status={`${dp.variancePct}% Variance`}
                      variant={dp.riskSeverity === 'high' ? 'warning' : 'neutral'}
                    />
                  </div>
                </div>

                {/* Portions Comparison Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-foodloop-canvas text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-foodloop-textMuted block">
                      Planned
                    </span>
                    <span className="text-lg font-bold text-foodloop-navy tabular-numbers">
                      {dp.plannedPortions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-foodloop-green block">
                      Predicted
                    </span>
                    <span className="text-lg font-bold text-foodloop-green tabular-numbers">
                      {dp.predictedPortions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-foodloop-orange block">
                      Recommended Prep
                    </span>
                    <span className="text-lg font-bold text-slate-800 tabular-numbers">
                      {dp.recommendedPrepPortions || Math.round(dp.predictedPortions * 1.04)}
                    </span>
                  </div>
                </div>

                {/* Menu Highlights */}
                {dp.menuHighlights && dp.menuHighlights.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Menu Items:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dp.menuHighlights.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-foodloop-navy border border-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Drivers */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Identified Variance Drivers:
                  </span>
                  <ul className="space-y-1 text-foodloop-textMuted text-[11px]">
                    {dp.keyDrivers.map((driver, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reason Codes Pill Strip */}
                {dp.reasonCodes && dp.reasonCodes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Reason Codes:
                    </span>
                    {dp.reasonCodes.map((code: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommendation Callout */}
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold flex items-center gap-1 text-foodloop-orange mb-0.5">
                    <Sparkles className="w-3.5 h-3.5" /> Chef Batch Guidance:
                  </span>
                  <p className="text-[11px] leading-relaxed">{dp.prepRecommendation}</p>
                </div>
              </div>

              {/* Chef Sign-off Action Bar */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
                <span className="text-xs font-mono font-semibold text-slate-700">
                  Target Cut: {dp.suggestedBatchReductionKg} kg
                </span>
                <ActionButton
                  variant={isAck ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleAcknowledge(dp.id)}
                  disabled={isAck}
                  icon={isAck ? CheckCircle2 : undefined}
                >
                  {isAck ? 'Batch Adjusted' : 'Apply Batch Prep Cap'}
                </ActionButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Batch Table */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
        <SectionHeader
          title="Daily Service Variance & Prevention Matrix"
          subtitle="Detailed breakdown of portions planned, estimated consumption, and recommended pre-cook reductions"
        />

        <DataTable headers={tableHeaders}>
          {predictions.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 font-semibold text-foodloop-navy whitespace-nowrap">
                {row.mealSlot}
              </td>
              <td className="px-4 py-3 tabular-numbers">{row.plannedPortions}</td>
              <td className="px-4 py-3 tabular-numbers font-medium text-foodloop-green">
                {row.predictedPortions}
              </td>
              <td className="px-4 py-3 tabular-numbers font-bold text-slate-800">
                {row.recommendedPrepPortions || Math.round(row.predictedPortions * 1.04)}
              </td>
              <td className="px-4 py-3 tabular-numbers font-mono text-foodloop-orange">
                {row.variancePortions} ({row.variancePct}%)
              </td>
              <td className="px-4 py-3 tabular-numbers text-slate-600">
                {row.attendanceProjected}
              </td>
              <td className="px-4 py-3 tabular-numbers font-bold text-slate-700">
                {row.suggestedBatchReductionKg} kg
              </td>
              <td className="px-4 py-3">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {row.confidenceLevel || 'Standard'}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={row.riskSeverity === 'high' ? 'Prep Cap Required' : 'Standard Prep'}
                  variant={row.riskSeverity === 'high' ? 'warning' : 'safe'}
                  size="sm"
                />
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
};
