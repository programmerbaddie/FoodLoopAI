import React, { useState } from 'react';
import {
  ShieldCheck,
  Thermometer,
  Clock,
  CheckCircle2,
  FileCheck2,
  UserCheck,
} from 'lucide-react';
import { NavTabId, SafetyVerificationRecord } from '../types';
import { DEMO_SAFETY_RECORDS } from '../data/mockData';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ActionButton } from '../components/ui/ActionButton';

interface SafetyVerificationPageProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const SafetyVerificationPage: React.FC<SafetyVerificationPageProps> = ({
  onNavigateTab,
}) => {
  const [records, setRecords] = useState<SafetyVerificationRecord[]>(DEMO_SAFETY_RECORDS);

  const handleResolveWarning = (id: string) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? {
              ...rec,
              coreTempC: 62.5,
              isTempCompliant: true,
              complianceStatus: 'Certified Safe',
              digitalCertificateId: 'FSSAI-FL-2026-0923-RESOLVED',
              fssaiRegulation:
                'Re-thermalized to 62.5°C and sealed in thermal container. Certified Safe.',
            }
          : rec
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs">
        <SectionHeader
          title="Food Safety & Compliance Verification Station"
          subtitle="Mandatory quantitative inspection protocol before any surplus food is cleared for beneficiary allocation"
          badge="STAGE 04: VERIFY"
          actions={
            <ActionButton
              variant="primary"
              size="sm"
              icon={ShieldCheck}
              onClick={() => onNavigateTab('matching')}
            >
              Proceed to Matching
            </ActionButton>
          }
        />

        {/* FSSAI Standard Regulatory Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="font-bold text-emerald-900 block mb-0.5">
              Hot Holding Critical Limit
            </span>
            <span className="font-mono text-emerald-700">
              ≥ 60.0°C Core Temperature
            </span>
            <p className="text-[11px] text-emerald-800 mt-1">
              Maintains microbial suppression throughout transit.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
            <span className="font-bold text-blue-900 block mb-0.5">
              Maximum Safe Elapsed Window
            </span>
            <span className="font-mono text-blue-700">
              ≤ 4.0 Hours from Cooking
            </span>
            <p className="text-[11px] text-blue-800 mt-1">
              FSSAI strict ambient ceiling before mandatory disposal.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-0.5">
              Sensory Checklist & Seal
            </span>
            <span className="font-mono text-slate-700">
              4-Point Hygienic Protocol
            </span>
            <p className="text-[11px] text-slate-600 mt-1">
              Odor, visual color, texture integrity, and vessel sanitation.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Inspection Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {records.map((rec) => {
          const isCertified = rec.complianceStatus === 'Certified Safe';
          return (
            <div
              key={rec.id}
              className={`rounded-xl border p-5 shadow-xs bg-white flex flex-col justify-between ${
                isCertified ? 'border-emerald-300' : 'border-amber-300 ring-2 ring-amber-400/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-foodloop-border">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {rec.batchCode}
                    </span>
                    <h3 className="text-sm font-bold text-foodloop-navy">
                      {rec.dishName}
                    </h3>
                  </div>
                  <StatusBadge
                    status={rec.complianceStatus}
                    variant={isCertified ? 'safe' : 'warning'}
                    size="sm"
                  />
                </div>

                {/* Quantitative Gauges */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div
                    className={`p-3 rounded-lg border ${
                      rec.isTempCompliant
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-500 block flex items-center justify-center gap-1">
                      <Thermometer className="w-3 h-3" /> Core Probe
                    </span>
                    <span className="text-lg font-bold font-mono">
                      {rec.coreTempC}°C
                    </span>
                    <span className="text-[10px] block mt-0.5">
                      {rec.tempStandard}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-foodloop-canvas border border-foodloop-border text-foodloop-navy">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> Elapsed Time
                    </span>
                    <span className="text-lg font-bold font-mono">
                      {rec.holdTimeElapsedHours}h
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Max {rec.maxSafeHoldHours}h Allowed
                    </span>
                  </div>
                </div>

                {/* Sensory Checklist Evaluation */}
                <div className="space-y-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Sensory & Vessel Verification:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green shrink-0" />
                      <span>Odor Clean</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green shrink-0" />
                      <span>Natural Color</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green shrink-0" />
                      <span>Normal Texture</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green shrink-0" />
                      <span>Sanitary Crate</span>
                    </div>
                  </div>
                </div>

                {/* Regulatory Citation */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-foodloop-navy">
                    <FileCheck2 className="w-3.5 h-3.5 text-foodloop-green" />
                    <span>Inspection Audit Certificate:</span>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-800">
                    {rec.digitalCertificateId}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {rec.fssaiRegulation}
                  </p>
                </div>
              </div>

              {/* Inspector Signoff Card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-foodloop-textMuted">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] truncate">{rec.inspectorName}</span>
                </div>

                {!isCertified ? (
                  <ActionButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleResolveWarning(rec.id)}
                  >
                    Thermal Re-Check
                  </ActionButton>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Route
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
