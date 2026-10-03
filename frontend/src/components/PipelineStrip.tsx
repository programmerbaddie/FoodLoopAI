import React from 'react';
import {
  TrendingUp,
  Sliders,
  CheckCircle2,
  Share2,
  Truck,
  RotateCw,
  ArrowRight,
} from 'lucide-react';

interface Stage {
  key: string;
  name: string;
  step: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'active' | 'upcoming';
}

const STAGES: Stage[] = [
  {
    key: 'predict',
    name: 'PREDICT',
    step: 'Stage 01',
    description: 'Demand forecasting from attendance & menu records',
    icon: TrendingUp,
    status: 'upcoming',
  },
  {
    key: 'prevent',
    name: 'PREVENT',
    step: 'Stage 02',
    description: 'Kitchen batch size and pre-prep recommendations',
    icon: Sliders,
    status: 'upcoming',
  },
  {
    key: 'verify',
    name: 'VERIFY',
    step: 'Stage 03',
    description: 'Food safety, temperature & holding compliance',
    icon: CheckCircle2,
    status: 'upcoming',
  },
  {
    key: 'match',
    name: 'MATCH',
    step: 'Stage 04',
    description: 'Smart recipient routing based on distance & capacity',
    icon: Share2,
    status: 'upcoming',
  },
  {
    key: 'redistribute',
    name: 'REDISTRIBUTE',
    step: 'Stage 05',
    description: 'Pickup validation and chain-of-custody tracking',
    icon: Truck,
    status: 'upcoming',
  },
  {
    key: 'learn',
    name: 'LEARN',
    step: 'Stage 06',
    description: 'Closed-loop variance updates to demand models',
    icon: RotateCw,
    status: 'upcoming',
  },
];

export const PipelineStrip: React.FC = () => {
  return (
    <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-foodloop-border gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-foodloop-navy flex items-center gap-2">
            Operational Lifecycle
          </h2>
          <p className="text-xs text-foodloop-textMuted">
            End-to-end institutional workflow from demand forecasting to closed-loop learning
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 self-start sm:self-auto">
          Phase 1: Architecture Foundation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.key}
              className="relative p-3.5 rounded-lg border border-foodloop-border bg-foodloop-canvas flex flex-col justify-between hover:border-foodloop-greenBorder transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-foodloop-textMuted uppercase">
                    {stage.step}
                  </span>
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-white text-foodloop-green border border-foodloop-border">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-foodloop-navy tracking-tight mb-1">
                  {stage.name}
                </h3>
                <p className="text-[11px] text-foodloop-textMuted leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {idx < STAGES.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
