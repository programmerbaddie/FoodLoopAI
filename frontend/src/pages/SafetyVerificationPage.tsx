import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Thermometer,
  Clock,
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  Info,
  RotateCw,
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
import { WorkflowContextBar } from '../components/ui/WorkflowContextBar';

interface SafetyVerificationPageProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const SafetyVerificationPage: React.FC<SafetyVerificationPageProps> = ({
  onNavigateTab,
}) => {
  const [records, setRecords] = useState<SafetyVerificationRecord[]>(DEMO_SAFETY_RECORDS);
  const [surplusList, setSurplusList] = useState<SurplusItem[]>(DEMO_SURPLUS_ITEMS);
  const [loading, setLoading] = useState<boolean>(true);

  // Safety Verification Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [selectedSurplusId, setSelectedSurplusId] = useState<string>('SUR-0923');
  const [coreTemp, setCoreTemp] = useState<number>(64.5);
  const [holdingType, setHoldingType] = useState<
    'Hot Holding' | 'Cold Holding' | 'Room Temperature / Ambient'
  >('Hot Holding');
  const [elapsedHours, setElapsedHours] = useState<number>(1.2);
  const [packagingSealed, setPackagingSealed] = useState<boolean>(true);
  const [inspectorName, setInspectorName] = useState<string>(
    'Chef Rajesh Sharma (Food Safety Lead)'
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
      const pending = surps.find((s) => s.status === 'Pending Verification');
      if (pending) {
        setSelectedSurplusId(pending.id);
        if (pending.holdingTempC) setCoreTemp(pending.holdingTempC);
      }
    } catch {
      setRecords(DEMO_SAFETY_RECORDS);
      setSurplusList(DEMO_SURPLUS_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openFormForSurplus = (surplus: SurplusItem) => {
    setSelectedSurplusId(surplus.id);
    setCoreTemp(surplus.holdingTempC >= 60.0 ? surplus.holdingTempC : 62.5);
    setElapsedHours(1.5);
    setIsFormOpen(true);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
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
      setFormSuccess(
        `Verification completed for ${newRecord.dishName}: ${newRecord.complianceStatus}. ${
          newRecord.redistributionEligible
            ? 'Batch cleared for recipient matching!'
            : 'Batch blocked from redistribution.'
        }`
      );
      setIsFormOpen(false);

      // Refresh surplus list to update pending status
      const updatedSurplus = await getActiveSurplus().catch(() => surplusList);
      setSurplusList(updatedSurplus);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Filter surplus awaiting verification
  const pendingSurplus = surplusList.filter(
    (s) => s.status === 'Pending Verification'
  );

  return (
    <div className="space-y-6">
      {/* Workflow Stepper Bar */}
      <WorkflowContextBar
        stageNumber="STAGE 03 OF 06"
        currentStage="Food Safety Verification Gate"
        purpose="Quantitative thermal probe checks and 4-point sensory protocol. Unverified food is strictly blocked from redistribution."
        previousStage={{ id: 'surplus', label: 'Surplus Inventory' }}
        nextStage={{ id: 'matching', label: 'Recipient Matching' }}
        onNavigateTab={onNavigateTab}
      />

      {/* Header Context Banner */}
      <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border border-foodloop-border dark:border-foodloop-borderDark rounded-xl p-5 shadow-xs transition-colors">
        <SectionHeader
          title="Food Safety & Hygiene Verification Station"
          subtitle="Mandatory quality gate enforcing thermal holding thresholds and sensory inspection before surplus clearance"
          badge="SAFETY GATE"
          actions={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <ActionButton
                variant="outline"
                size="sm"
                icon={RotateCw}
                onClick={fetchData}
                loading={loading}
              >
                Refresh
              </ActionButton>

              <ActionButton
                variant="primary"
                size="sm"
                icon={PlusCircle}
                onClick={() => {
                  setIsFormOpen(!isFormOpen);
                  setFormError(null);
                  setFormSuccess(null);
                }}
              >
                {isFormOpen ? 'Close Sign-Off Form' : 'Conduct Safety Inspection'}
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

        {/* Operational Safety Standards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <span className="font-bold text-emerald-950 dark:text-emerald-300 block mb-0.5 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Hot Holding Standard
            </span>
            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-sm">
              ≥ 60.0°C Core Probe
            </span>
            <p className="text-[11px] text-emerald-900 dark:text-emerald-400/80 mt-1">
              Cooked hot food must maintain at or above 60°C to prevent microbial proliferation.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-blue-50/60 dark:bg-sky-950/20 border border-blue-200 dark:border-sky-800">
            <span className="font-bold text-blue-950 dark:text-sky-300 block mb-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              Safe Holding Ceiling
            </span>
            <span className="font-mono font-bold text-blue-800 dark:text-sky-400 text-sm">
              ≤ 4.0h Hot / ≤ 2.0h Ambient
            </span>
            <p className="text-[11px] text-blue-900 dark:text-sky-400/80 mt-1">
              FoodLoop operational safe holding window. Batches past 4.0h are condemned for composting.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <span className="font-bold text-purple-950 dark:text-purple-300 block mb-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              4-Point Sensory Protocol
            </span>
            <span className="font-mono font-bold text-purple-800 dark:text-purple-400 text-sm">
              All 4 Points Required
            </span>
            <p className="text-[11px] text-purple-900 dark:text-purple-400/80 mt-1">
              Every sensory parameter (odor, visual appearance, texture, vessel hygiene) must pass explicitly.
            </p>
          </div>
        </div>

        {/* Informational Policy Notice */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Strict Business Rule:</strong> Surplus food begins as <em>Pending Verification</em> with redistribution eligibility locked to <code>False</code>. The matching engine will strictly reject any batch that has not passed temperature probe and 4-point sensory verification.
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {formSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-foodloop-green shrink-0" />
            <span>{formSuccess}</span>
          </div>
          <button
            onClick={() => onNavigateTab('matching')}
            className="font-bold text-foodloop-green hover:underline cursor-pointer"
          >
            Go to Matching →
          </button>
        </div>
      )}

      {/* PENDING VERIFICATION QUEUE: Actionable Batches */}
      <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border border-foodloop-border dark:border-foodloop-borderDark rounded-xl p-5 shadow-xs space-y-4 transition-colors">
        <SectionHeader
          title="Pending Verification Queue"
          subtitle="Detected surplus food batches currently locked in quarantine awaiting physical inspection"
          badge={`${pendingSurplus.length} Action Needed`}
        />

        {pendingSurplus.length === 0 ? (
          <div className="p-6 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No Surplus Batches Pending Verification
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All logged kitchen remnants have been verified or resolved. Newly detected remnants will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSurplus.map((item) => {
              const isTempBelow60 = item.holdingTempC < 60.0;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 p-4.5 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                          {item.id}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {item.batchId}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {item.dishName}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.category} • Logged at {item.detectionTimestamp}
                      </div>
                    </div>
                    <StatusBadge
                      status="Pending Verification"
                      variant="warning"
                      size="sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Quantity</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.portionsEquivalent} portions ({item.quantityKg} kg)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Current Probe</span>
                      <span
                        className={`font-mono font-bold ${
                          isTempBelow60
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {item.holdingTempC}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Storage Unit</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                        {item.storageUnit}
                      </span>
                    </div>
                  </div>

                  {isTempBelow60 && (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        Core temp is below 60.0°C. Immediate thermal transfer or supervisor check required before release.
                      </span>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Redistribution locked: <strong>Blocked</strong>
                    </span>
                    <ActionButton
                      variant="primary"
                      size="sm"
                      icon={ShieldCheck}
                      onClick={() => openFormForSurplus(item)}
                    >
                      Verify This Batch
                    </ActionButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Safety Verification Inspection Form Modal / Collapsible */}
      {isFormOpen && (
        <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border-2 border-foodloop-green dark:border-emerald-600 rounded-xl p-6 shadow-md space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-foodloop-border dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-foodloop-green" />
              <div>
                <h3 className="text-base font-bold text-foodloop-navy dark:text-slate-100">
                  Execute Food Safety Inspection Sign-Off
                </h3>
                <p className="text-xs text-foodloop-textMuted dark:text-slate-400">
                  Input actual probe measurements and 4-point sensory results to evaluate redistribution clearance
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitVerification} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Surplus Batch to Verify
                </label>
                <select
                  value={selectedSurplusId}
                  onChange={(e) => {
                    setSelectedSurplusId(e.target.value);
                    const s = surplusList.find((item) => item.id === e.target.value);
                    if (s) setCoreTemp(s.holdingTempC);
                  }}
                  className="w-full p-2.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800 text-foodloop-navy dark:text-slate-100 font-mono"
                  required
                >
                  {surplusList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.dishName} ({s.id} - {s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Measured Core Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={coreTemp}
                  onChange={(e) => setCoreTemp(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800 text-foodloop-navy dark:text-slate-100 tabular-numbers font-mono font-bold"
                  required
                />
                <span
                  className={`text-[10px] mt-1 block font-medium ${
                    coreTemp >= 60.0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {coreTemp >= 60.0
                    ? '✓ Complies with Hot Holding Standard (≥60.0°C)'
                    : '⚠ Below 60.0°C Hot Holding Threshold (Blocked)'}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Thermal Regimen
                </label>
                <select
                  value={holdingType}
                  onChange={(e) => setHoldingType(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800 text-foodloop-navy dark:text-slate-100"
                >
                  <option value="Hot Holding">Hot Holding (≥ 60.0°C Target)</option>
                  <option value="Cold Holding">Cold Holding (≤ 5.0°C Target)</option>
                  <option value="Room Temperature / Ambient">
                    Ambient / Room Temp (Danger Zone)
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Elapsed Time Since Prep (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="12.0"
                  value={elapsedHours}
                  onChange={(e) => setElapsedHours(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800 text-foodloop-navy dark:text-slate-100 tabular-numbers"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Safe Hot Ceiling: 4.0 hours
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspecting Supervisor / Quality Lead
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800 text-foodloop-navy dark:text-slate-100"
                  required
                />
              </div>

              <div className="sm:col-span-2 flex items-center pt-5">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={packagingSealed}
                    onChange={(e) => setPackagingSealed(e.target.checked)}
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Food-grade transit vessel covered & lid seal intact</span>
                </label>
              </div>
            </div>

            {/* 4-Point Sensory Checkboxes */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foodloop-navy dark:text-slate-100 block">
                  Mandatory 4-Point Sensory Soundness Checklist:
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  All 4 points required for clearance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={sensoryChecks.odor_normal}
                    onChange={(e) =>
                      setSensoryChecks({
                        ...sensoryChecks,
                        odor_normal: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    1. Odor Clean & Sound
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={sensoryChecks.color_normal}
                    onChange={(e) =>
                      setSensoryChecks({
                        ...sensoryChecks,
                        color_normal: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    2. Color / Appearance Normal
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={sensoryChecks.texture_normal}
                    onChange={(e) =>
                      setSensoryChecks({
                        ...sensoryChecks,
                        texture_normal: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    3. Texture & Consistency Intact
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={sensoryChecks.sanitary_vessel}
                    onChange={(e) =>
                      setSensoryChecks({
                        ...sensoryChecks,
                        sanitary_vessel: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-foodloop-green rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    4. Sanitary Food Container
                  </span>
                </label>
              </div>
            </div>

            {formError && (
              <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <ActionButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
              >
                Dismiss
              </ActionButton>
              <ActionButton
                type="submit"
                variant="primary"
                size="sm"
                icon={ShieldCheck}
                loading={formLoading}
              >
                Sign Off Food Safety Verification
              </ActionButton>
            </div>
          </form>
        </div>
      )}

      {/* VERIFIED AUDIT LEDGER */}
      <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border border-foodloop-border dark:border-foodloop-borderDark rounded-xl p-5 shadow-xs space-y-4 transition-colors">
        <SectionHeader
          title="Safety Verification Audit Ledger"
          subtitle="Immutable timestamped log of temperature probe evaluations, sensory sign-offs, and redistribution clearances"
          badge={`${records.length} Audit Records`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec) => {
            const isVerifiedSafe =
              rec.complianceStatus === 'Safety Verified' ||
              rec.complianceStatus === 'Verified Safe';
            const isAttention = rec.complianceStatus === 'Attention Required';
            const isDiscard = rec.complianceStatus === 'Non-Compliant (Discard)';

            const borderStyle = isVerifiedSafe
              ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800/80'
              : isAttention
              ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/20'
              : isDiscard
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800/80';

            return (
              <div
                key={rec.id}
                className={`rounded-xl border p-4.5 shadow-xs flex flex-col justify-between transition-colors ${borderStyle}`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{rec.id}</span>
                        <span>•</span>
                        <span>{rec.inspectionTimestamp}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foodloop-navy dark:text-slate-100 mt-0.5">
                        {rec.dishName}
                      </h4>
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        {rec.batchCode}
                      </span>
                    </div>

                    <StatusBadge
                      status={rec.complianceStatus}
                      variant={isVerifiedSafe ? 'safe' : isAttention ? 'warning' : 'critical'}
                      size="sm"
                    />
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <span className="text-[10px] text-foodloop-textMuted dark:text-slate-400 block">Core Temp</span>
                      <span
                        className={`font-mono font-bold ${
                          rec.isTempCompliant
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {rec.coreTempC !== null ? `${rec.coreTempC}°C` : 'Omitted'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-foodloop-textMuted dark:text-slate-400 block">Holding Window</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        {rec.holdTimeElapsedHours}h / max {rec.maxSafeHoldHours}h
                      </span>
                    </div>
                  </div>

                  {/* Sensory Checklist Summary */}
                  <div className="text-[11px] space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Sensory Inspection
                    </span>
                    <div className="flex flex-wrap gap-1 text-[10px] font-medium">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          rec.sensoryInspection.odorNormal
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        Odor {rec.sensoryInspection.odorNormal ? '✓' : '✗'}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          rec.sensoryInspection.colorNormal
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        Color {rec.sensoryInspection.colorNormal ? '✓' : '✗'}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          rec.sensoryInspection.textureNormal
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        Texture {rec.sensoryInspection.textureNormal ? '✓' : '✗'}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          rec.sensoryInspection.sanitaryVessel
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        Vessel {rec.sensoryInspection.sanitaryVessel ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>

                  {/* Observations */}
                  {rec.observations && rec.observations.length > 0 && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200/60 dark:border-slate-700 space-y-1">
                      {rec.observations.map((obs, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-slate-400 shrink-0">•</span>
                          <span>{obs}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Token & Redistribution Eligibility */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <div>
                    {rec.digitalCertificateId ? (
                      <span className="font-mono text-[10px] text-foodloop-green dark:text-emerald-400 font-semibold block">
                        Token: {rec.digitalCertificateId}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-rose-500 block">
                        No Token (Verification Incomplete)
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      By {rec.inspectorName.split(' ')[0]}
                    </span>
                  </div>

                  <span
                    className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                      rec.redistributionEligible
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {rec.redistributionEligible ? 'Eligible to Match' : 'Blocked from Match'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
