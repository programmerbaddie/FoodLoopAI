import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Thermometer,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  UserCheck,
  RotateCw,
  Server,
  PlusCircle,
  AlertTriangle,
  Info,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  NavTabId,
  SafetyVerificationRecord,
  SafetyVerificationPayload,
  SurplusItem,
} from '../types';
import { DEMO_SAFETY_RECORDS, DEMO_SURPLUS_ITEMS } from '../data/mockData';
import {
  getSafetyRecords,
  getActiveSurplus,
  verifySafety,
} from '../services/api';
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
  const [surplusList, setSurplusList] = useState<SurplusItem[]>(DEMO_SURPLUS_ITEMS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveFromBackend, setIsLiveFromBackend] = useState<boolean>(false);

  // Safety Verification Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedSurplusId, setSelectedSurplusId] = useState<string>('SUR-0923');
  const [coreTemp, setCoreTemp] = useState<number>(63.5);
  const [holdingType, setHoldingType] = useState<
    'Hot Holding' | 'Cold Holding' | 'Room Temperature / Ambient'
  >('Hot Holding');
  const [elapsedHours, setElapsedHours] = useState<number>(1.2);
  const [packagingSealed, setPackagingSealed] = useState<boolean>(true);
  const [inspectorName, setInspectorName] = useState<string>(
    'Chef Rajesh Sharma (Food Safety Supervisor)'
  );
  const [sensoryChecks, setSensoryChecks] = useState({
    odor_normal: true,
    color_normal: true,
    texture_normal: true,
    sanitary_vessel: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recs, surps] = await Promise.all([
        getSafetyRecords(),
        getActiveSurplus(),
      ]);
      setRecords(recs);
      setSurplusList(surps);
      setIsLiveFromBackend(true);
      if (surps.length > 0) {
        // Default to first pending surplus if available
        const pending = surps.find((s) => s.status === 'Pending Verification');
        setSelectedSurplusId(pending ? pending.id : surps[0].id);
      }
    } catch {
      setIsLiveFromBackend(false);
      setRecords(DEMO_SAFETY_RECORDS);
      setSurplusList(DEMO_SURPLUS_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload: SafetyVerificationPayload = {
        surplus_id: selectedSurplusId,
        core_temp_c: coreTemp,
        holding_type: holdingType,
        hold_time_elapsed_hours: elapsedHours,
        sensory_inspection: sensoryChecks,
        packaging_sealed: packagingSealed,
        inspector_name: inspectorName,
      };

      const newRecord = await verifySafety(payload);
      setRecords((prev) => [newRecord, ...prev]);
      setIsFormOpen(false);

      // Refresh surplus list to show updated status
      const updatedSurplus = await getActiveSurplus().catch(() => surplusList);
      setSurplusList(updatedSurplus);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs">
        <SectionHeader
          title="Food Safety & Compliance Verification Station"
          subtitle="Mandatory quantitative safety gate before surplus food is cleared for redistribution under FSSAI Schedule 4 regulations"
          badge="STAGE 04: VERIFY"
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
                    ? 'FastAPI Safety Engine Active'
                    : 'Demonstration / Fallback Cache'}
                </span>
              </span>

              <ActionButton
                variant="outline"
                size="sm"
                icon={RotateCw}
                onClick={fetchData}
                loading={loading}
              >
                Sync
              </ActionButton>

              <ActionButton
                variant="primary"
                size="sm"
                icon={PlusCircle}
                onClick={() => setIsFormOpen(!isFormOpen)}
              >
                {isFormOpen ? 'Close Sign-Off Form' : 'Conduct Safety Sign-Off'}
              </ActionButton>

              <ActionButton
                variant="outline"
                size="sm"
                icon={ShieldCheck}
                onClick={() => onNavigateTab('matching')}
              >
                Proceed to Matching
              </ActionButton>
            </div>
          }
        />

        {/* FSSAI Standard Statutory Guidance Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="font-bold text-emerald-950 block mb-0.5 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
              Statutory Hot Holding Limit
            </span>
            <span className="font-mono font-bold text-emerald-800">
              ≥ 60.0°C Core Probe Temperature
            </span>
            <p className="text-[11px] text-emerald-900 mt-1">
              Source: FSSAI Schedule 4 Catering Guidelines (Hot food microbial inhibition threshold).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200">
            <span className="font-bold text-blue-950 block mb-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Operational Safe Holding Ceiling
            </span>
            <span className="font-mono font-bold text-blue-800">
              ≤ 4.0 Hours Hot / ≤ 2.0 Hours Ambient
            </span>
            <p className="text-[11px] text-blue-900 mt-1">
              FoodLoop configurable operational rule (conservative kitchen holding best practice, not an FSSAI statutory rule).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green" />
              Mandatory Sensory Evaluation
            </span>
            <span className="font-mono font-bold text-slate-800">
              4-Point Hygienic Protocol
            </span>
            <p className="text-[11px] text-slate-600 mt-1">
              Odor, visual color, texture integrity, and sanitary covered container inspection.
            </p>
          </div>
        </div>

        {/* Strict Guardrail Notice */}
        <div className="mt-4 p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>System Safety Guardrail:</strong> FoodLoop enforces an explicit verification barrier. If a temperature probe is missing, or if any sensory parameter fails, the batch is strictly blocked from redistribution. No verification token is issued for unverified food.
          </div>
        </div>
      </div>

      {/* Interactive Safety Verification Inspection Form */}
      {isFormOpen && (
        <div className="bg-foodloop-surface border border-foodloop-greenBorder rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-foodloop-border">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-foodloop-green" />
              <h3 className="text-base font-bold text-foodloop-navy">
                Formal FSSAI Safety Inspection Sign-Off
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              POST /api/v1/safety/verify
            </span>
          </div>

          <form onSubmit={handleSubmitVerification} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Surplus Batch to Verify
                </label>
                <select
                  value={selectedSurplusId}
                  onChange={(e) => setSelectedSurplusId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green font-mono"
                  required
                >
                  {surplusList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.dishName} ({s.batchId} - {s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Measured Core Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={coreTemp}
                  onChange={(e) => setCoreTemp(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers font-mono"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Mandatory Hot Holding Standard: ≥ 60.0°C
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Thermal Holding Regimen
                </label>
                <select
                  value={holdingType}
                  onChange={(e) => setHoldingType(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                >
                  <option value="Hot Holding">Hot Holding (≥ 60.0°C)</option>
                  <option value="Cold Holding">Cold Holding (≤ 5.0°C)</option>
                  <option value="Room Temperature / Ambient">
                    Ambient / Room Temp (Danger Zone)
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Elapsed Time from Cooking (hrs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="12.0"
                  value={elapsedHours}
                  onChange={(e) => setElapsedHours(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Maximum Hot Ceiling: 4.0 hrs
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Inspecting Supervisor / Chef Name
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                  required
                />
              </div>

              <div className="sm:col-span-2 flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={packagingSealed}
                    onChange={(e) => setPackagingSealed(e.target.checked)}
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Food-Grade Holding Vessel Lid & Transit Seal Intact</span>
                </label>
              </div>
            </div>

            {/* 4-Point Sensory Checkboxes */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-foodloop-navy block">
                Mandatory 4-Point Sensory Soundness Protocol (FSSAI Schedule 4):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sensoryChecks.odor_normal}
                    onChange={(e) =>
                      setSensoryChecks({
                        ...sensoryChecks,
                        odor_normal: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Odor Clean / Sound</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sensoryChecks.color_normal}
                    onChange={(e) =>
                      setSensoryChecks({
                        ...sensoryChecks,
                        color_normal: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Color / Appearance Normal</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sensoryChecks.texture_normal}
                    onChange={(e) =>
                      setSensoryChecks({
                        ...sensoryChecks,
                        texture_normal: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Texture / Consistency Intact</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sensoryChecks.sanitary_vessel}
                    onChange={(e) =>
                      setSensoryChecks({
                        ...sensoryChecks,
                        sanitary_vessel: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Sanitary Food-Grade Crate</span>
                </label>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <ActionButton
                type="submit"
                variant="primary"
                size="sm"
                icon={ShieldCheck}
                loading={formLoading}
              >
                Issue FoodLoop Verification Sign-Off
              </ActionButton>
            </div>
          </form>
        </div>
      )}

      {/* Safety Inspection Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {records.map((rec) => {
          const isVerifiedSafe = rec.complianceStatus === 'Verified Safe';
          const isAttention = rec.complianceStatus === 'Attention Required';
          const isDiscard = rec.complianceStatus === 'Non-Compliant (Discard)';

          return (
            <div
              key={rec.id}
              className={`rounded-xl border p-5 shadow-xs bg-white flex flex-col justify-between transition-colors ${
                isVerifiedSafe
                  ? 'border-emerald-300'
                  : isAttention
                  ? 'border-amber-300 ring-2 ring-amber-400/20'
                  : 'border-rose-300 ring-2 ring-rose-400/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-foodloop-border">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {rec.batchCode}
                      </span>
                      {rec.isDemoData && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          Synthetic Record
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-foodloop-navy">
                      {rec.dishName}
                    </h3>
                  </div>
                  <StatusBadge
                    status={rec.complianceStatus}
                    variant={isVerifiedSafe ? 'safe' : isAttention ? 'warning' : 'critical'}
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
                      {rec.coreTempC !== null && rec.coreTempC !== undefined
                        ? `${rec.coreTempC}°C`
                        : 'Omitted'}
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
                      Max {rec.maxSafeHoldHours}h Safe Limit
                    </span>
                  </div>
                </div>

                {/* Redistribution Eligibility Gate */}
                <div
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                    rec.redistributionEligible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : isDiscard
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="font-semibold flex items-center gap-1">
                    {rec.redistributionEligible ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isDiscard ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    Redistribution Gate:
                  </span>
                  <span className="font-mono font-bold">
                    {rec.redistributionEligible
                      ? 'CLEARED FOR DISPATCH'
                      : isDiscard
                      ? 'CONDEMNED / COMPOST'
                      : 'HOLD / INELIGIBLE'}
                  </span>
                </div>

                {/* Sensory Checklist Evaluation */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Sensory Soundness:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      {rec.sensoryInspection.odorNormal ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span>Odor Sound</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      {rec.sensoryInspection.colorNormal ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span>Color Normal</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      {rec.sensoryInspection.textureNormal ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span>Texture Intact</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      {rec.sensoryInspection.sanitaryVessel ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-foodloop-green shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span>Sanitary Crate</span>
                    </div>
                  </div>
                </div>

                {/* Reason Codes */}
                {rec.reasonCodes && rec.reasonCodes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-0.5">
                      <Tag className="w-3 h-3" /> Codes:
                    </span>
                    {rec.reasonCodes.map((code: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                )}

                {/* Regulatory Citation & Internal Audit Token */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-foodloop-navy">
                    <FileCheck2 className="w-3.5 h-3.5 text-foodloop-green" />
                    <span>FoodLoop Internal Audit Token:</span>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-800">
                    {rec.digitalCertificateId
                      ? `${rec.digitalCertificateId} (Internal System Token)`
                      : 'No Token Issued (Unverified)'}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {rec.fssaiRegulation}
                  </p>
                </div>
              </div>

              {/* Inspector Signoff Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-foodloop-textMuted">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] truncate">{rec.inspectorName}</span>
                </div>

                {rec.redistributionEligible ? (
                  <ActionButton
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigateTab('matching')}
                  >
                    Match Recipient
                  </ActionButton>
                ) : (
                  <ActionButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSurplusId(rec.surplusId);
                      setIsFormOpen(true);
                    }}
                  >
                    Re-Verify
                  </ActionButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
