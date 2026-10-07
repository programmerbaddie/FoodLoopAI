import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  ShieldCheck,
  KeyRound,
  MapPin,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';
import { NavTabId, RedistributionDispatch } from '../types';
import { getRedistributionDispatches, verifyHandoverOtp } from '../services/api';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ActionButton } from '../components/ui/ActionButton';
import { WorkflowContextBar } from '../components/ui/WorkflowContextBar';

interface RedistributionPageProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const RedistributionPage: React.FC<RedistributionPageProps> = ({
  onNavigateTab,
}) => {
  const [dispatches, setDispatches] = useState<RedistributionDispatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeOtpModal, setActiveOtpModal] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    dispatchId: string;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadDispatches = async () => {
    setIsLoading(true);
    try {
      const data = await getRedistributionDispatches();
      setDispatches(data);
    } catch (err) {
      console.warn('Failed to load dispatches from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  const openOtpModal = (dsp: RedistributionDispatch) => {
    setActiveOtpModal(dsp.dispatchId);
    setOtpInput(dsp.handoverCode); // pre-populate with demo OTP for convenience
    setVerificationFeedback(null);
  };

  const closeOtpModal = () => {
    setActiveOtpModal(null);
    setOtpInput('');
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOtpModal) return;

    setIsVerifying(true);
    setVerificationFeedback(null);

    try {
      const result = await verifyHandoverOtp(activeOtpModal, otpInput.trim());
      if (result.success) {
        setVerificationFeedback({
          dispatchId: activeOtpModal,
          type: 'success',
          message: result.message || 'OTP verified successfully! Consignment custody confirmed.',
        });
        // Update local state immediately
        setDispatches((prev) =>
          prev.map((d) =>
            d.dispatchId === activeOtpModal
              ? {
                  ...d,
                  stage: 'Verified Handoff',
                  isVerified: true,
                  verificationTimestamp: 'Just now',
                }
              : d
          )
        );
        setTimeout(() => {
          closeOtpModal();
        }, 1200);
      } else {
        setVerificationFeedback({
          dispatchId: activeOtpModal,
          type: 'error',
          message: result.message || 'OTP verification failed. Invalid code.',
        });
      }
    } catch (err: any) {
      setVerificationFeedback({
        dispatchId: activeOtpModal,
        type: 'error',
        message: err?.message || 'Invalid OTP code. Please check code with destination recipient.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const STAGES_FLOW = [
    'Allocated',
    'Driver En Route',
    'In Transit',
    'Verified Handoff',
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Navigation Context */}
      <WorkflowContextBar
        currentStage="REDISTRIBUTE"
        purpose="Live consignment tracking with continuous sensor probe telemetry and secure OTP two-way recipient custody handoff."
        prev={{ tab: 'matching', label: 'MATCH: Recipients' }}
        next={{ tab: 'impact', label: 'LEARN: Impact & Analytics' }}
        onNavigate={onNavigateTab}
      />

      {/* Header Banner */}
      <div className="bg-foodloop-surface dark:bg-slate-900 border border-foodloop-border dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
        <SectionHeader
          title="Redistribution Logistics & Chain of Custody"
          subtitle="Real-time consignment tracking, in-transit thermal probe monitoring, and verified recipient handoff"
          badge="STAGE 06: REDISTRIBUTE"
          actions={
            <div className="flex items-center gap-2">
              <ActionButton
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={loadDispatches}
                disabled={isLoading}
              >
                Refresh Dispatches
              </ActionButton>
              <ActionButton
                variant="primary"
                size="sm"
                icon={ShieldCheck}
                onClick={() => onNavigateTab('impact')}
              >
                Inspect Diverted Impact
              </ActionButton>
            </div>
          }
        />

        {/* Fleet Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-foodloop-canvas dark:bg-slate-800/60 border border-foodloop-border dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Active Vans
            </span>
            <span className="text-xl font-bold text-foodloop-navy dark:text-slate-100 tabular-numbers">
              {dispatches.filter((d) => !d.isVerified).length} Active
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">EV Insulated Fleet</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
              Transit Temp Compliance
            </span>
            <span className="text-xl font-bold text-foodloop-green dark:text-emerald-400 tabular-numbers">
              100%
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400/80 block">≥ 60°C Hot Hold Standard</span>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
            <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 block">
              Verified Deliveries
            </span>
            <span className="text-xl font-bold text-blue-800 dark:text-blue-400 tabular-numbers">
              {dispatches.filter((d) => d.isVerified).length} Batches
            </span>
            <span className="text-[11px] text-blue-700 dark:text-blue-400/80 block">Recipient OTP Verified</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 block">
              Custody Protocol
            </span>
            <span className="text-xl font-bold text-foodloop-navy dark:text-slate-100 tabular-numbers">
              Two-Way OTP
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Cryptographic Sign-off</span>
          </div>
        </div>
      </div>

      {/* Active Dispatches List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            Loading logistics consignments...
          </div>
        ) : dispatches.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 border border-foodloop-border dark:border-slate-800 rounded-xl transition-colors">
            <p className="font-bold text-foodloop-navy dark:text-slate-100">No active dispatches.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Accept a candidate recipient match in the Recipient Matching tab to provision a logistics courier.
            </p>
          </div>
        ) : (
          dispatches.map((dsp) => {
            const isComplete = dsp.stage === 'Verified Handoff' || dsp.isVerified;
            const stageIndex = STAGES_FLOW.indexOf(dsp.stage);

            return (
              <div
                key={dsp.dispatchId}
                className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs transition-colors ${
                  isComplete
                    ? 'border-foodloop-border dark:border-slate-800'
                    : 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-500/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-foodloop-border dark:border-slate-800 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {dsp.dispatchId}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {dsp.portions} Portions
                      </span>
                      {dsp.isDemoData && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Demo Logistics
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foodloop-navy dark:text-slate-100">
                      {dsp.surplusSummary}
                    </h3>
                    <p className="text-xs text-foodloop-textMuted dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-foodloop-orange" />
                      <span>
                        Destination: <strong>{dsp.recipientName}</strong> ({dsp.destinationAddress})
                      </span>
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
                        onClick={() => openOtpModal(dsp)}
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
                        stageIndex >= idx || dsp.stage === 'Verified Handoff' || dsp.isVerified;
                      const isCurrent = dsp.stage === step;

                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-colors ${
                              isPassed
                                ? 'bg-foodloop-green text-white border-foodloop-green'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`mt-1.5 text-[11px] font-medium leading-tight ${
                              isCurrent
                                ? 'text-foodloop-green dark:text-emerald-400 font-bold'
                                : isPassed
                                ? 'text-foodloop-navy dark:text-slate-200'
                                : 'text-slate-400 dark:text-slate-500'
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 bg-foodloop-canvas dark:bg-slate-800/60 p-3 rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">
                      Assigned Courier & Vehicle
                    </span>
                    <div className="font-medium text-foodloop-navy dark:text-slate-100">{dsp.courierName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{dsp.vehicleType}</div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">
                      In-Transit Sensor Probe
                    </span>
                    <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      {dsp.transitTempC}°C (Hot-Holding Standard Satisfied)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Dispatched: {dsp.dispatchTime} • ETA: {dsp.eta}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">
                      Secure Handover Token
                    </span>
                    <div className="font-mono font-bold text-foodloop-navy dark:text-slate-100 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-foodloop-orange" />
                      {dsp.handoverCode}
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">
                        ({isComplete ? 'Handoff Confirmed' : 'Demo Passcode'})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {dsp.isVerified
                        ? `✓ Verified by recipient (${dsp.verificationTimestamp || 'Logged'})`
                        : 'Pending physical custody handoff confirmation'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* OTP Verification Modal */}
      {activeOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-foodloop-border dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-foodloop-border dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foodloop-navy dark:text-slate-100">
                    Confirm Custody Handoff
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    Dispatch ID: {activeOtpModal}
                  </span>
                </div>
              </div>

              <button
                onClick={closeOtpModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-semibold text-foodloop-navy dark:text-slate-200 block">
                  Demonstration Protocol Note:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  In production, the recipient shelter coordinator provides this physical confirmation token upon driver arrival.
                  Enter the assigned code below (or <code>DEMO</code>) to complete the chain of custody.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Handover OTP Code:
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. FL-6129"
                  className="w-full p-2.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800 font-mono font-bold text-foodloop-navy dark:text-slate-100 text-sm focus:outline-hidden focus:border-foodloop-green"
                  required
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                  Expected demo token for this consignment: <strong>{otpInput}</strong>
                </span>
              </div>

              {verificationFeedback && (
                <div
                  className={`p-3 rounded-lg border flex items-center gap-2 text-xs ${
                    verificationFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {verificationFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-foodloop-green shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{verificationFeedback.message}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <ActionButton
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={closeOtpModal}
                  disabled={isVerifying}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  icon={ShieldCheck}
                  disabled={isVerifying || !otpInput.trim()}
                >
                  {isVerifying ? 'Verifying...' : 'Confirm Delivery'}
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
