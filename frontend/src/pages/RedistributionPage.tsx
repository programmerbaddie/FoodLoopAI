import React, { useState } from 'react';
import {
  Thermometer,
  ShieldCheck,
  KeyRound,
  MapPin,
  Check,
} from 'lucide-react';
import { NavTabId, RedistributionDispatch } from '../types';
import { DEMO_REDISTRIBUTION_DISPATCHES } from '../data/mockData';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ActionButton } from '../components/ui/ActionButton';

interface RedistributionPageProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const RedistributionPage: React.FC<RedistributionPageProps> = ({
  onNavigateTab,
}) => {
  const [dispatches, setDispatches] = useState<RedistributionDispatch[]>(
    DEMO_REDISTRIBUTION_DISPATCHES
  );

  const handleVerifyOtp = (dispatchId: string) => {
    setDispatches((prev) =>
      prev.map((d) =>
        d.dispatchId === dispatchId
          ? {
              ...d,
              stage: 'Verified Handoff',
              isVerified: true,
            }
          : d
      )
    );
  };

  const STAGES_FLOW = [
    'Allocated',
    'Driver En Route',
    'In Transit',
    'Verified Handoff',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs">
        <SectionHeader
          title="Redistribution Logistics & Chain of Custody"
          subtitle="Real-time vehicle tracking, in-transit temperature verification, and cryptographic handoff confirmation"
          badge="STAGE 06: REDISTRIBUTE"
          actions={
            <ActionButton
              variant="primary"
              size="sm"
              icon={ShieldCheck}
              onClick={() => onNavigateTab('impact')}
            >
              Inspect Diverted Impact
            </ActionButton>
          }
        />

        {/* Fleet Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-foodloop-canvas border border-foodloop-border">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Active Vans
            </span>
            <span className="text-xl font-bold text-foodloop-navy tabular-numbers">
              3 Units
            </span>
            <span className="text-[11px] text-slate-500 block">EV & Insulated</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
              Transit Temp Compliance
            </span>
            <span className="text-xl font-bold text-foodloop-green tabular-numbers">
              100%
            </span>
            <span className="text-[11px] text-emerald-700 block">≥ 60°C Hot Hold</span>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">
              Avg. Turnaround
            </span>
            <span className="text-xl font-bold text-blue-800 tabular-numbers">
              22.4 mins
            </span>
            <span className="text-[11px] text-blue-700 block">Kitchen to Shelter</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-700 block">
              Delivery Protocol
            </span>
            <span className="text-xl font-bold text-foodloop-navy tabular-numbers">
              2-Factor OTP
            </span>
            <span className="text-[11px] text-slate-600 block">Recipient Sign-off</span>
          </div>
        </div>
      </div>

      {/* Active Dispatches List */}
      <div className="space-y-4">
        {dispatches.map((dsp) => {
          const isComplete = dsp.stage === 'Verified Handoff';
          const stageIndex = STAGES_FLOW.indexOf(dsp.stage);

          return (
            <div
              key={dsp.dispatchId}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-colors ${
                isComplete ? 'border-foodloop-border' : 'border-emerald-300 ring-1 ring-emerald-500/20'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-foodloop-border gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {dsp.dispatchId}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {dsp.portions} Portions
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foodloop-navy">
                    {dsp.surplusSummary}
                  </h3>
                  <p className="text-xs text-foodloop-textMuted flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-foodloop-orange" />
                    <span>Destination: {dsp.recipientName} ({dsp.destinationAddress})</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={dsp.stage}
                    variant={isComplete ? 'safe' : 'info'}
                  />
                  {!isComplete && (
                    <ActionButton
                      variant="primary"
                      size="sm"
                      icon={KeyRound}
                      onClick={() => handleVerifyOtp(dsp.dispatchId)}
                    >
                      Verify OTP Handover
                    </ActionButton>
                  )}
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-4">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {STAGES_FLOW.map((step, idx) => {
                    const isPassed =
                      stageIndex >= idx || dsp.stage === 'Verified Handoff';
                    const isCurrent = dsp.stage === step;

                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-colors ${
                            isPassed
                              ? 'bg-foodloop-green text-white border-foodloop-green'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`mt-1.5 text-[11px] font-medium leading-tight ${
                            isCurrent
                              ? 'text-foodloop-green font-bold'
                              : isPassed
                              ? 'text-foodloop-navy'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dispatch Logistics Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-foodloop-canvas p-3 rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Assigned Courier & Vehicle
                  </span>
                  <div className="font-medium text-foodloop-navy">{dsp.courierName}</div>
                  <div className="text-[11px] text-slate-500">{dsp.vehicleType}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    In-Transit Sensor Probe
                  </span>
                  <div className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    {dsp.transitTempC}°C (Hot-Holding Compliant)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dispatched: {dsp.dispatchTime} • ETA: {dsp.eta}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Secure Handover Token
                  </span>
                  <div className="font-mono font-bold text-foodloop-navy flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-foodloop-orange" />
                    {dsp.handoverCode}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {dsp.isVerified ? '✓ Verified by recipient coordinator' : 'Pending physical handoff'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
