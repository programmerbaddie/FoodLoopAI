import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Share2,
  Truck,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { NavTabId } from '../../types';

interface StageConfig {
  id: NavTabId;
  stepNum: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  telemetrySummary: string;
}

const STAGES: StageConfig[] = [
  {
    id: 'demand',
    stepNum: '01',
    name: 'Plan & Prevent',
    subtitle: 'Demand Forecast & Batch Cut',
    icon: TrendingUp,
    telemetrySummary: '1,280 Portions Forecasted',
  },
  {
    id: 'surplus',
    stepNum: '02',
    name: 'Detect Surplus',
    subtitle: 'Post-Meal Remnants Tally',
    icon: AlertTriangle,
    telemetrySummary: '170 Portions Monitored',
  },
  {
    id: 'safety',
    stepNum: '03',
    name: 'Verify Safety',
    subtitle: 'Probe Temp & Sensory Sign-off',
    icon: ShieldCheck,
    telemetrySummary: '95 Portions Safety Verified',
  },
  {
    id: 'matching',
    stepNum: '04',
    name: 'Match Beneficiary',
    subtitle: 'Proximity & Capacity Allocation',
    icon: Share2,
    telemetrySummary: '4 Demo Recipient Nodes',
  },
  {
    id: 'redistribution',
    stepNum: '05',
    name: 'Redistribute',
    subtitle: 'Chain of Custody & OTP Handoff',
    icon: Truck,
    telemetrySummary: '2 Active Vans in Transit',
  },
  {
    id: 'impact',
    stepNum: '06',
    name: 'Measure & Learn',
    subtitle: 'Diverted Waste & Feedback Loop',
    icon: BarChart3,
    telemetrySummary: '118 kg Diverted Today',
  },
];

interface PipelineProps {
  activeTab: NavTabId;
  onSelectStage: (tab: NavTabId) => void;
}

export const Pipeline: React.FC<PipelineProps> = ({ activeTab, onSelectStage }) => {
  return (
    <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border border-foodloop-border dark:border-foodloop-borderDark rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3.5 border-b border-foodloop-border dark:border-foodloop-borderDark gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-foodloop-green" />
          <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-foodloop-navy dark:text-slate-100">
            FoodLoop Operational Pipeline
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            6 Operational Stages
          </span>
        </div>
        <p className="text-xs text-foodloop-textMuted dark:text-foodloop-textMutedDark">
          Click any stage to view and manage that phase of food rescue
        </p>
      </div>

      {/* Responsive Horizontal Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const isActive = activeTab === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`relative text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? 'border-foodloop-green bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-foodloop-green text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                    }`}
                  >
                    {stage.stepNum}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-foodloop-green'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                </div>

                <div
                  className={`text-xs font-bold leading-tight truncate ${
                    isActive
                      ? 'text-emerald-950 dark:text-emerald-300'
                      : 'text-foodloop-navy dark:text-slate-100'
                  }`}
                >
                  {stage.name}
                </div>
                <div className="text-[10px] text-foodloop-textMuted dark:text-foodloop-textMutedDark truncate mt-0.5">
                  {stage.subtitle}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {stage.telemetrySummary}
                </span>
                <ChevronRight
                  className={`w-3 h-3 ${
                    isActive ? 'text-foodloop-green' : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
