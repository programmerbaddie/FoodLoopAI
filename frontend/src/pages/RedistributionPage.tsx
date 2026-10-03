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
      {/* Header Banner */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs">
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
          <div className="p-3 rounded-lg bg-foodloop-canvas border border-foodloop-border">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Active Vans
            </span>
            <span className="text-xl font-bold text-foodloop-navy tabular-numbers">
              {dispatches.filter((d) => !d.isVerified).length} Active
            </span>
            <span className="text-[11px] text-slate-500 block">EV Insulated Fleet</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
              Transit Temp Compliance
            </span>
            <span className="text-xl font-bold text-foodloop-green tabular-numbers">
              100%
            </span>
            <span className="text-[11px] text-emerald-700 block">≥ 60°C Hot Hold Standard</span>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">
              Verified Deliveries
            </span>
            <span className="text-xl font-bold text-blue-800 tabular-numbers">
              {dispatches.filter((d) => d.isVerified).length} Batches
            </span>
            <span className="text-[11px] text-blue-700 block">Recipient OTP Verified</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-700 block">
              Custody Protocol
            </span>
            <span className="text-xl font-bold text-foodloop-navy tabular-numbers">
              Demo OTP
            </span>
            <span className="text-[11px] text-slate-600 block">Two-Way Sign-off</span>
          </div>
        </div>
      </div>

      {/* Active Dispatches List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading logistics consignments...
          </div>
        ) : dispatches.length === 0 ? (
          <div className="p-10 text-center bg-white border border-foodloop-border rounded-xl">
            <p className="font-bold text-foodloop-navy">No active dispatches.</p>
            <p className="text-xs text-slate-500 mt-1">
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
                className={`bg-white border rounded-xl p-5 shadow-xs transition-colors ${
                  isComplete
                    ? 'border-foodloop-border'
                    : 'border-emerald-300 ring-1 ring-emerald-500/20'
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
                      {dsp.isDemoData && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Demo Logistics
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foodloop-navy">
                      {dsp.surplusSummary}
                    </h3>
                    <p className="text-xs text-foodloop-textMuted flex items-center gap-1">
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
                      {dsp.transitTempC}°C (Hot-Holding Standard Satisfied)
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
                      <span className="text-[9px] text-slate-400 font-normal">
                        ({isComplete ? 'Handoff Confirmed' : 'Demo Passcode'})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-foodloop-border space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-foodloop-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foodloop-navy">
                    Confirm Custody Handoff
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Dispatch ID: {activeOtpModal}
                  </span>
                </div>
              </div>

              <button
                onClick={closeOtpModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-foodloop-navy block">
                  Demonstration Protocol Note:
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  In production, the recipient shelter coordinator provides this physical confirmation token upon driver arrival.
                  Enter the assigned code below (or <code>DEMO</code>) to complete the chain of custody.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Recipient Handover OTP Code:
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. FL-6129"
                  className="w-full p-2.5 rounded-lg border border-foodloop-border bg-foodloop-canvas font-mono font-bold text-foodloop-navy text-sm focus:outline-hidden focus:border-foodloop-green"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Expected demo token for this consignment: <strong>{otpInput}</strong>
                </span>
              </div>

              {verificationFeedback && (
                <div
                  className={`p-3 rounded-lg border flex items-center gap-2 text-xs ${
                    verificationFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
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
