import React from 'react';
import {
  Database,
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
    id: 'overview',
    stepNum: '01',
    name: 'Kitchen Data',
    subtitle: 'Menu & Headcount Ingestion',
    icon: Database,
    telemetrySummary: '1,450 Planned Portions',
  },
  {
    id: 'demand',
    stepNum: '02',
    name: 'Demand Prediction',
    subtitle: 'Variance & Batch Adjustment',
    icon: TrendingUp,
    telemetrySummary: '1,280 Predicted Demand',
  },
  {
    id: 'surplus',
    stepNum: '03',
    name: 'Surplus Detection',
    subtitle: 'Post-Meal Remnants Tally',
    icon: AlertTriangle,
    telemetrySummary: '170 Portions Monitored',
  },
  {
    id: 'safety',
    stepNum: '04',
    name: 'Safety Verification',
    subtitle: 'Temp Probe & FSSAI Standards',
    icon: ShieldCheck,
    telemetrySummary: '95 Portions Verified Safe',
  },
  {
    id: 'matching',
    stepNum: '05',
    name: 'Recipient Matching',
    subtitle: 'Distance & Capacity Decay',
    icon: Share2,
    telemetrySummary: '4 Beneficiary Nodes',
  },
  {
    id: 'redistribution',
    stepNum: '06',
    name: 'Pickup & Dispatch',
    subtitle: 'Logistics Chain of Custody',
    icon: Truck,
    telemetrySummary: '2 Active Vans in Transit',
  },
  {
    id: 'impact',
    stepNum: '07',
    name: 'Impact Tracking',
    subtitle: 'Closed-Loop Baseline Updates',
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
    <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-foodloop-border gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-foodloop-green" />
          <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-foodloop-navy">
            Closed-Loop Operational Pipeline
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Interactive System Flow
          </span>
        </div>
        <p className="text-xs text-foodloop-textMuted">
          Click any phase to inspect live operational data & stage telemetry
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeTab === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`text-left p-3 rounded-lg border transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'border-foodloop-green bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-foodloop-border bg-foodloop-canvas hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-mono font-bold tracking-wider ${
                      isActive ? 'text-foodloop-green' : 'text-slate-400'
                    }`}
                  >
                    {stage.stepNum}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                      isActive
                        ? 'bg-foodloop-green text-white border-foodloop-green'
                        : 'bg-white text-foodloop-navyMuted border-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xs font-bold text-foodloop-navy leading-tight truncate">
                  {stage.name}
                </div>
                <div className="text-[10px] text-foodloop-textMuted leading-tight mt-0.5 truncate">
                  {stage.subtitle}
                </div>
              </div>

              <div className="mt-2.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-slate-600 truncate">
                  {stage.telemetrySummary}
                </span>
                {idx < STAGES.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-300 hidden lg:inline shrink-0 ml-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
