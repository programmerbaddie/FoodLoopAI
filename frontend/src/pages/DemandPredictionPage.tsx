import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { DEMO_DEMAND_PREDICTIONS } from '../data/mockData';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { ActionButton } from '../components/ui/ActionButton';

export const DemandPredictionPage: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => ({ ...prev, [id]: true }));
  };

  const tableHeaders = [
    'Meal Slot',
    'Planned Portions',
    'Predicted Demand',
    'Variance (Expected Remnant)',
    'Projected Headcount',
    'Batch Prep Cut (kg)',
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
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Total Expected Diners: 1,710</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-mono border border-emerald-200">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Schedule: Friday Standard</span>
              </span>
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

      {/* Meal Slots Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DEMO_DEMAND_PREDICTIONS.map((dp) => {
          const isAck = acknowledged[dp.id];
          return (
            <div
              key={dp.id}
              className={`rounded-xl border p-5 shadow-xs transition-colors bg-white ${
                dp.riskSeverity === 'high'
                  ? 'border-amber-300'
                  : 'border-foodloop-border'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-foodloop-border">
                <div>
                  <h3 className="text-base font-bold text-foodloop-navy">
                    {dp.mealSlot} Service
                  </h3>
                  <p className="text-xs text-foodloop-textMuted">
                    Expected Attendance: {dp.attendanceProjected} students
                  </p>
                </div>
                <StatusBadge
                  status={`${dp.variancePct}% Variance`}
                  variant={dp.riskSeverity === 'high' ? 'warning' : 'neutral'}
                />
              </div>

              {/* Portions Comparison */}
              <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-lg bg-foodloop-canvas text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foodloop-textMuted block">
                    Planned
                  </span>
                  <span className="text-lg font-bold text-foodloop-navy">
                    {dp.plannedPortions}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-foodloop-green block">
                    Predicted
                  </span>
                  <span className="text-lg font-bold text-foodloop-green">
                    {dp.predictedPortions}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-foodloop-orange block">
                    Excess Risk
                  </span>
                  <span className="text-lg font-bold text-foodloop-orange">
                    {Math.abs(dp.variancePortions)}
                  </span>
                </div>
              </div>

              {/* Menu Highlights */}
              <div className="space-y-1 mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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

              {/* Key Forecast Drivers */}
              <div className="space-y-1 mb-4 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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

              {/* Recommendation Callout */}
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 mb-4">
                <span className="font-bold flex items-center gap-1 text-foodloop-orange mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" /> Chef Batch Guidance:
                </span>
                <p className="text-[11px] leading-relaxed">{dp.prepRecommendation}</p>
              </div>

              {/* Chef Sign-off */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
          {DEMO_DEMAND_PREDICTIONS.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 font-semibold text-foodloop-navy whitespace-nowrap">
                {row.mealSlot}
              </td>
              <td className="px-4 py-3 tabular-numbers">{row.plannedPortions}</td>
              <td className="px-4 py-3 tabular-numbers font-medium text-foodloop-green">
                {row.predictedPortions}
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
