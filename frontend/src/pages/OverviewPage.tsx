import React, { useState, useEffect } from 'react';
import {
  Utensils,
  TrendingDown,
  AlertTriangle,
  PackageCheck,
  Award,
  Truck,
  ArrowRight,
  ShieldAlert,
  Building,
  ExternalLink,
} from 'lucide-react';
import { NavTabId, TodayOverviewMetrics } from '../types';
import {
  DEMO_OVERVIEW_METRICS,
  DEMO_FACILITY,
  DEMO_DEMAND_PREDICTIONS,
  DEMO_REDISTRIBUTION_DISPATCHES,
} from '../data/mockData';
import { HealthStatus, getTodayOverview, getApiDocsUrl } from '../services/api';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ActionButton } from '../components/ui/ActionButton';

interface OverviewPageProps {
  onNavigateTab: (tab: NavTabId) => void;
  health: HealthStatus | null;
  loadingHealth: boolean;
  onRefreshHealth: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigateTab,
  health,
  loadingHealth,
  onRefreshHealth,
}) => {
  const [metrics, setMetrics] = useState<TodayOverviewMetrics>(DEMO_OVERVIEW_METRICS);

  useEffect(() => {
    let isMounted = true;
    getTodayOverview().then((data) => {
      if (isMounted) setMetrics(data);
    });
    return () => {
      isMounted = false;
    };
  }, [health]);

  const m = metrics;

  return (
    <div className="space-y-6">
      {/* Institutional Context & Shift Notice */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-foodloop-green border border-emerald-200">
              Institutional Kitchen Operations
            </span>
            <span className="text-xs font-mono text-slate-500">
              {DEMO_FACILITY.licenseNumber}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foodloop-navy">
            {DEMO_FACILITY.name}
          </h1>
          <p className="text-xs text-foodloop-textMuted flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>{DEMO_FACILITY.location}</span>
            <span>•</span>
            <span>Daily Headcount Capacity: {DEMO_FACILITY.dailyHeadcountCapacity.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-500">Telemetry Status</div>
            <div className="text-xs font-semibold text-emerald-700">Live Active Operations</div>
          </div>
          <ActionButton
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('demand')}
            icon={ArrowRight}
          >
            Review Demand Forecast
          </ActionButton>
        </div>
      </div>

      {/* Primary KPI Grid: 7 Core Metrics Requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Meals Planned */}
        <MetricCard
          label="Meals Planned Today"
          value={m.mealsPlanned.toLocaleString()}
          unit="portions"
          subtext="Breakfast + Lunch + Dinner batches"
          badge={{ text: 'Target Volume', variant: 'neutral' }}
          icon={Utensils}
        />

        {/* Metric 2: Predicted Demand */}
        <MetricCard
          label="Predicted Consumption"
          value={m.predictedDemand.toLocaleString()}
          unit="portions"
          subtext="Based on headcount & exam departures"
          badge={{ text: '-11.7% Expected Variance', variant: 'orange' }}
          icon={TrendingDown}
          variant="highlight"
        />

        {/* Metric 3: Surplus Risk */}
        <MetricCard
          label="Surplus Prevention Buffer"
          value={`+${m.surplusRiskPortions}`}
          unit="portions at risk"
          subtext="Recommended batch cuts in Lunch/Dinner"
          badge={{ text: `${m.surplusRiskLevel} Risk`, variant: 'orange' }}
          icon={AlertTriangle}
          variant="warning"
        />

        {/* Metric 4: Food Currently Available */}
        <MetricCard
          label="Food Available for Rescue"
          value={m.availableForRescue}
          unit="portions"
          subtext="Verified safe from lunch service"
          badge={{ text: 'Ready for Routing', variant: 'green' }}
          icon={PackageCheck}
        />

        {/* Metric 5: Meals Rescued Today */}
        <MetricCard
          label="Meals Rescued Today"
          value={m.mealsRescuedToday}
          unit="portions"
          subtext="Handoffs to verified partner shelters"
          badge={{ text: '100% Verified', variant: 'green' }}
          icon={Award}
        />

        {/* Metric 6: Waste Diverted */}
        <MetricCard
          label="Organic Waste Diverted"
          value={m.wasteDivertedKg}
          unit="kg"
          subtext={`Avoided ~${m.co2eAvoidedKg} kg CO₂e landfill emissions`}
          badge={{ text: 'Landfill Avoided', variant: 'green' }}
          icon={Award}
        />

        {/* Metric 7: Active Redistribution */}
        <MetricCard
          label="Active Dispatches"
          value={m.activeRedistributionsCount}
          unit="couriers in transit"
          subtext="Equipped with temperature sensors"
          badge={{ text: 'En Route', variant: 'blue' }}
          icon={Truck}
        />

        {/* Metric 8: Backend Diagnostic Status */}
        <div className="rounded-xl border border-foodloop-border bg-foodloop-surface p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foodloop-textMuted">
              Backend Service
            </span>
            <div
              className={`w-2 h-2 rounded-full ${
                health?.status === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-foodloop-navy">
              {health?.status ? `FastAPI ${health.status.toUpperCase()}` : 'Connecting...'}
            </div>
            <div className="text-xs font-mono text-slate-500">
              v{health?.version || '0.1.0'} • {health?.environment || 'dev'}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px]">
            <a
              href={getApiDocsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foodloop-green hover:underline flex items-center gap-1 font-medium"
            >
              <span>Swagger Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onRefreshHealth}
              disabled={loadingHealth}
              className="text-slate-500 hover:text-foodloop-navy underline cursor-pointer"
            >
              Probe
            </button>
          </div>
        </div>
      </div>

      {/* Operational Highlights Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Immediate Kitchen Intervention Queue */}
        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
          <SectionHeader
            title="Immediate Kitchen Prep Recommendations"
            subtitle="Calculated batch adjustments to prevent excess surplus before cooking begins"
            badge="Phase: PREVENT"
            actions={
              <ActionButton
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('demand')}
              >
                Inspect All
              </ActionButton>
            }
          />

          <div className="space-y-3">
            {DEMO_DEMAND_PREDICTIONS.map((dp) => (
              <div
                key={dp.id}
                className="p-3.5 rounded-lg border border-foodloop-border bg-foodloop-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-foodloop-navy">
                      {dp.mealSlot} Batch
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        dp.riskSeverity === 'high'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {dp.variancePct}% Projected
                    </span>
                  </div>
                  <p className="text-xs text-foodloop-textMuted leading-relaxed">
                    {dp.prepRecommendation}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-xs font-mono font-bold text-foodloop-orange block">
                    Save {dp.suggestedBatchReductionKg} kg
                  </span>
                  <span className="text-[10px] text-slate-500">Raw Prep Cap</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Redistribution & Safety Watchboard */}
        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
          <SectionHeader
            title="Active Redistribution & Safety Queue"
            subtitle="Verified food packages currently allocated or dispatched to recipient nodes"
            badge="Phase: REDISTRIBUTE"
            actions={
              <ActionButton
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('redistribution')}
              >
                Dispatch Board
              </ActionButton>
            }
          />

          <div className="space-y-3">
            {DEMO_REDISTRIBUTION_DISPATCHES.map((dsp) => (
              <div
                key={dsp.dispatchId}
                className="p-3.5 rounded-lg border border-foodloop-border bg-foodloop-canvas space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foodloop-navy">
                    {dsp.surplusSummary}
                  </span>
                  <StatusBadge
                    status={dsp.stage}
                    variant={
                      dsp.stage === 'Verified Handoff'
                        ? 'safe'
                        : dsp.stage === 'In Transit'
                        ? 'info'
                        : 'warning'
                    }
                    size="sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-foodloop-textMuted gap-1">
                  <span>To: {dsp.recipientName}</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    Temp: {dsp.transitTempC}°C ({dsp.transitTempCompliant ? 'Compliant' : 'Warning'})
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/80 text-slate-500">
                  <span>Courier: {dsp.courierName}</span>
                  <span className="font-mono font-semibold text-emerald-800">
                    OTP: {dsp.handoverCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demonstration Data Banner */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Institutional Simulation Context:</strong> Telemetry reflects typical operational flow for a 1,800-seat university dining facility. Data structures are pre-configured for live backend ingestion in subsequent phases.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
          {m.lastUpdated}
        </span>
      </div>
    </div>
  );
};
