import React, { useState, useEffect } from 'react';
import {
  Utensils,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Award,
  Truck,
  ArrowRight,
  ShieldAlert,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { NavTabId, TodayOverviewMetrics } from '../types';
import {
  DEMO_OVERVIEW_METRICS,
  DEMO_FACILITY,
  DEMO_DEMAND_PREDICTIONS,
  DEMO_SURPLUS_ITEMS,
  DEMO_REDISTRIBUTION_DISPATCHES,
} from '../data/mockData';
import { getTodayOverview } from '../services/api';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ActionButton } from '../components/ui/ActionButton';

interface OverviewPageProps {
  onNavigateTab: (tab: NavTabId) => void;
  health?: any;
  loadingHealth?: boolean;
  onRefreshHealth?: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigateTab }) => {
  const [metrics, setMetrics] = useState<TodayOverviewMetrics>(DEMO_OVERVIEW_METRICS);

  useEffect(() => {
    let isMounted = true;
    getTodayOverview()
      .then((data) => {
        if (isMounted) setMetrics(data);
      })
      .catch(() => {
        if (isMounted) setMetrics(DEMO_OVERVIEW_METRICS);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const m = metrics;
  const pendingSurplusCount = DEMO_SURPLUS_ITEMS.filter(
    (s) => s.status === 'Pending Verification'
  ).length;

  return (
    <div className="space-y-6">
      {/* Facility Header & Operational Status */}
      <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border border-foodloop-border dark:border-foodloop-borderDark rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-foodloop-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Kitchen Operations Active
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {DEMO_FACILITY.licenseNumber}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foodloop-navy dark:text-slate-100">
            {DEMO_FACILITY.name}
          </h1>
          <p className="text-xs text-foodloop-textMuted dark:text-foodloop-textMutedDark flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>{DEMO_FACILITY.location}</span>
            <span>•</span>
            <span>Daily Headcount: {DEMO_FACILITY.dailyHeadcountCapacity.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ActionButton
            variant="primary"
            size="md"
            onClick={() => onNavigateTab('demand')}
            icon={ArrowRight}
          >
            Review Demand Forecast
          </ActionButton>
        </div>
      </div>

      {/* Action Required Banner: Urgent Operational Tasks */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Action Required: Food Safety Verification</span>
                <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-amber-200/60 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-bold">
                  {pendingSurplusCount} Batch Awaiting Sign-Off
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Batch <strong>B-LUNCH-ROTI-03 (Whole Wheat Rotis, 50 portions)</strong> was logged with core temp 58°C. Food cannot enter recipient matching until physical temperature and sensory inspection are signed off.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <ActionButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('safety')}
              icon={ShieldCheck}
            >
              Verify Safety Gate
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid: 6 Core Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Metric 1: Meals Planned */}
        <MetricCard
          label="Planned Portions"
          value={m.mealsPlanned.toLocaleString()}
          unit="meals"
          subtext="Target kitchen production"
          badge={{ text: 'Baseline', variant: 'neutral' }}
          icon={Utensils}
        />

        {/* Metric 2: Predicted Demand */}
        <MetricCard
          label="Predicted Demand"
          value={m.predictedDemand.toLocaleString()}
          unit="diners"
          subtext={`-170 portions recommended cut`}
          badge={{ text: 'AI Forecast', variant: 'purple' }}
          variant="ai"
          icon={TrendingDown}
        />

        {/* Metric 3: Surplus Detected */}
        <MetricCard
          label="Surplus at Risk"
          value={m.surplusRiskPortions}
          unit="portions"
          subtext="Risk Level: Moderate"
          badge={{ text: 'Monitored', variant: 'orange' }}
          variant="warning"
          icon={AlertTriangle}
        />

        {/* Metric 4: Pending Verification */}
        <MetricCard
          label="Pending Safety"
          value={pendingSurplusCount}
          unit="batch"
          subtext="Unverified; blocked from matching"
          badge={{ text: 'Action Needed', variant: 'orange' }}
          variant="warning"
          icon={ShieldAlert}
        />

        {/* Metric 5: Available for Rescue */}
        <MetricCard
          label="Safety Verified"
          value={m.availableForRescue}
          unit="portions"
          subtext="Cleared for recipient matching"
          badge={{ text: 'Rescue Ready', variant: 'green' }}
          variant="highlight"
          icon={ShieldCheck}
        />

        {/* Metric 6: Meals Rescued */}
        <MetricCard
          label="Rescued Today"
          value={m.mealsRescuedToday}
          unit="meals"
          subtext={`${m.wasteDivertedKg} kg diverted from waste`}
          badge={{ text: 'Redistributed', variant: 'green' }}
          variant="highlight"
          icon={Award}
        />
      </div>

      {/* Operational Highlights Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Immediate Kitchen Intervention Queue */}
        <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border border-foodloop-border dark:border-foodloop-borderDark rounded-xl p-5 shadow-xs space-y-4 transition-colors">
          <SectionHeader
            title="Immediate Kitchen Prep Recommendations"
            subtitle="Calculated batch adjustments to prevent excess surplus before cooking begins"
            badge="PHASE 01: PREVENT"
            actions={
              <ActionButton
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('demand')}
              >
                Full Forecast
              </ActionButton>
            }
          />

          <div className="space-y-3">
            {DEMO_DEMAND_PREDICTIONS.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-foodloop-navy dark:text-slate-100">
                    {item.mealSlot} Service
                  </span>
                  <StatusBadge
                    status={item.riskSeverity === 'high' ? 'High Surplus Risk' : 'Batch Adjustment'}
                    variant={item.riskSeverity === 'high' ? 'critical' : 'warning'}
                    size="sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 my-2 text-xs">
                  <div>
                    <span className="text-[10px] text-foodloop-textMuted dark:text-slate-400 block">Planned</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {item.plannedPortions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foodloop-textMuted dark:text-slate-400 block">Predicted</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {item.predictedPortions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foodloop-textMuted dark:text-slate-400 block">Recommended</span>
                    <span className="font-mono font-semibold text-foodloop-green dark:text-emerald-400">
                      {item.recommendedPrepPortions || item.predictedPortions}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug bg-white dark:bg-slate-800 p-2 rounded border border-slate-200/60 dark:border-slate-700 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foodloop-green shrink-0 mt-1" />
                  <span>{item.prepRecommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Logistics & Community Redistribution */}
        <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border border-foodloop-border dark:border-foodloop-borderDark rounded-xl p-5 shadow-xs space-y-4 transition-colors">
          <SectionHeader
            title="Redistribution & Transit Chain"
            subtitle="Live custody transfer tracking and beneficiary delivery dispatches"
            badge="PHASE 05: REDISTRIBUTE"
            actions={
              <ActionButton
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('redistribution')}
              >
                View Dispatches
              </ActionButton>
            }
          />

          <div className="space-y-3">
            {DEMO_REDISTRIBUTION_DISPATCHES.map((dispatch) => (
              <div
                key={dispatch.dispatchId}
                className="p-3.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foodloop-navy dark:text-slate-100">
                      {dispatch.dispatchId}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {dispatch.recipientName}
                    </span>
                  </div>
                  <StatusBadge
                    status={dispatch.stage}
                    variant={
                      dispatch.isVerified || dispatch.stage === 'Verified Handoff'
                        ? 'safe'
                        : dispatch.stage === 'In Transit'
                        ? 'info'
                        : 'warning'
                    }
                    size="sm"
                  />
                </div>

                <div className="text-xs text-foodloop-textMuted dark:text-slate-400 flex items-center gap-2 mb-2">
                  <span>{dispatch.surplusSummary}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {dispatch.portions} portions
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-800 p-2 rounded border border-slate-200/60 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-blue-500" />
                    <span>{dispatch.vehicleType}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Transit Temp: {dispatch.transitTempC}°C</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-foodloop-green" />
                <span>Verified Handover Protocol: Delivery confirmed via secure OTP</span>
              </span>
              <button
                onClick={() => onNavigateTab('redistribution')}
                className="text-foodloop-green dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Handoff Console →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental & ESG Impact Bar */}
      <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border border-foodloop-border dark:border-foodloop-borderDark rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-foodloop-green border border-emerald-200 dark:border-emerald-800">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foodloop-navy dark:text-slate-100">
                Cumulative Environmental Diversion Telemetry
              </h3>
              <p className="text-xs text-foodloop-textMuted dark:text-foodloop-textMutedDark">
                Modelled savings based on 118.0 kg organic waste diverted from municipal landfills today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="text-right">
              <div className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400">
                ~259.6 kg
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Avoided CO₂e</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-bold text-blue-700 dark:text-blue-400">
                59,000 L
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Conserved Water</div>
            </div>
            <ActionButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('impact')}
              icon={ArrowRight}
            >
              Impact Reports
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};
