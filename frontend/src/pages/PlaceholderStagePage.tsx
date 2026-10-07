import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface StageSpec {
  title: string;
  phase: string;
  description: string;
  expectedInputs: string[];
  expectedOutputs: string[];
  targetCapabilities: string[];
}

const STAGE_SPECS: Record<string, StageSpec> = {
  demand: {
    title: 'Demand Prediction & Historical Consumption Profiling',
    phase: 'Phase 2',
    description:
      'Predictive model that ingests institutional menu data, student/staff attendance projections, day-of-week variables, and historical meal consumption patterns.',
    expectedInputs: [
      'Daily menu schedule with dish composition',
      'Institutional headcount / attendance registrations',
      'Historical daily consumption & remnant records',
      'Calendar context (holidays, exams, seasonal shifts)',
    ],
    expectedOutputs: [
      'Estimated portion count per menu item',
      'Batch cooking volume recommendation',
      'Variance bounds for kitchen preparation staff',
    ],
    targetCapabilities: [
      'Explainable multi-variate regression',
      'Rolling average consumption baseline',
      'Zero-black-box auditing for kitchen chefs',
    ],
  },
  verification: {
    title: 'Food Safety & Holding Verification',
    phase: 'Phase 3',
    description:
      'Quantitative food safety compliance checks before any prepared surplus is authorized for external redistribution.',
    expectedInputs: [
      'Preparation completion timestamp',
      'Holding temperature logs (Hot holding >= 60°C, Cold <= 5°C)',
      'Visual sensory inspection checklist',
      'Allergen declarations and packaging status',
    ],
    expectedOutputs: [
      'Safety verification token / QR pass',
      'Safe redistribution window (countdown timer)',
      'Immediate composting / discard flag if threshold breached',
    ],
    targetCapabilities: [
      'FSSAI food safety guideline enforcement',
      'Hold time validation (<= 4 hour room-temp limit)',
      'Mandatory checklist signoff protocol',
    ],
  },
  recipients: {
    title: 'Smart Recipient Matching Engine',
    phase: 'Phase 4',
    description:
      'Algorithmic allocation engine matching verified surplus food to local beneficiary organizations based on proximity, diet preference, and storage capacity.',
    expectedInputs: [
      'Available verified surplus volume (portions, meal type)',
      'Verified recipient registry (NGOs, shelters, community kitchens)',
      'Live capacity and feeding headcount per recipient',
      'Geographic transit distance and transit time estimate',
    ],
    expectedOutputs: [
      'Optimized match order prioritizing highest urgency and shortest transit',
      'Surplus reservation notification',
      'Handoff confirmation code',
    ],
    targetCapabilities: [
      'Distance-decay routing logic',
      'Dietary compatibility filter (Veg / Non-veg / Special diet)',
      'Equitable distribution balancing to prevent donor fatigue',
    ],
  },
  logistics: {
    title: 'Redistribution Logistics & Chain of Custody',
    phase: 'Phase 5',
    description:
      'Field dispatch workflow tracking volunteer pickup, transit temperature maintenance, and recipient delivery acknowledgment.',
    expectedInputs: [
      'Pickup confirmation from designated courier/volunteer',
      'Handoff verification timestamp',
      'Arrival confirmation at recipient facility',
    ],
    expectedOutputs: [
      'Complete chain-of-custody audit log',
      'Recipient meal receipt receipt record',
      'Actual consumption telemetry feedback',
    ],
    targetCapabilities: [
      'Mobile-friendly dispatch confirmation',
      'Real-time status tracking',
      'Audit log generation for regulatory transparency',
    ],
  },
  system: {
    title: 'System Diagnostics & Operational Logs',
    phase: 'Foundation Diagnostic',
    description:
      'Runtime telemetry, API route registry, database connectivity checks, and event logs for the FoodLoop AI ecosystem.',
    expectedInputs: [
      'Operational server logs',
      'Network latency probes',
      'Scheduled task worker states',
    ],
    expectedOutputs: [
      'Real-time health status',
      'Route latency metrics',
      'Dependency diagnostic matrix',
    ],
    targetCapabilities: [
      'Application runtime process monitoring',
      'CORS and proxy validation',
      'Structured logging viewer',
    ],
  },
};

interface PlaceholderStagePageProps {
  stageKey: string;
}

export const PlaceholderStagePage: React.FC<PlaceholderStagePageProps> = ({
  stageKey,
}) => {
  const spec = STAGE_SPECS[stageKey] || {
    title: 'Module Specification',
    phase: 'Upcoming Phase',
    description: 'Detailed specification pending Phase 1 completion.',
    expectedInputs: [],
    expectedOutputs: [],
    targetCapabilities: [],
  };

  return (
    <div className="space-y-6">
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-foodloop-border">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-foodloop-green border border-foodloop-greenBorder">
                {spec.phase}
              </span>
              <span className="text-xs text-foodloop-textMuted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Scheduled Implementation
              </span>
            </div>
            <h2 className="text-xl font-bold text-foodloop-navy">{spec.title}</h2>
          </div>
        </div>

        <p className="text-sm text-foodloop-navyMuted mt-4 leading-relaxed">
          {spec.description}
        </p>

        <div className="mt-6 p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-foodloop-orange shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Implementation Boundary Rule: </span>
            This module will be developed in its respective implementation phase. FoodLoop AI strictly avoids placeholder predictions, simulated accuracies, or dummy statistical charts. Real data pipelines and models will be wired in following sprints.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foodloop-navy">
            Expected Inputs
          </h3>
          <ul className="space-y-2 text-xs text-foodloop-textMuted">
            {spec.expectedInputs.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foodloop-green mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foodloop-navy">
            Operational Outputs
          </h3>
          <ul className="space-y-2 text-xs text-foodloop-textMuted">
            {spec.expectedOutputs.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foodloop-navy mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foodloop-navy">
            Target Capabilities
          </h3>
          <ul className="space-y-2 text-xs text-foodloop-textMuted">
            {spec.targetCapabilities.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foodloop-orange mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
