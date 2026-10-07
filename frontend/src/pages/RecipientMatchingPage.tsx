import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  HeartHandshake,
  Truck,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Utensils,
  Info,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { NavTabId, RecipientMatch, SurplusItem } from '../types';
import { getRecipientMatches, acceptRecipientMatch, getActiveSurplus } from '../services/api';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ActionButton } from '../components/ui/ActionButton';
import { WorkflowContextBar } from '../components/ui/WorkflowContextBar';

interface RecipientMatchingPageProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const RecipientMatchingPage: React.FC<RecipientMatchingPageProps> = ({
  onNavigateTab,
}) => {
  const [matches, setMatches] = useState<RecipientMatch[]>([]);
  const [surplusList, setSurplusList] = useState<SurplusItem[]>([]);
  const [selectedSurplusId, setSelectedSurplusId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load active surplus batches and initial suggested matches
  const loadData = async (targetSurplusId?: string) => {
    setIsLoading(true);
    try {
      const [surplusData, matchesData] = await Promise.all([
        getActiveSurplus(),
        getRecipientMatches(targetSurplusId === 'all' ? undefined : targetSurplusId),
      ]);
      setSurplusList(surplusData);
      setMatches(matchesData);
    } catch (err) {
      console.warn('Failed to load matching data from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSurplusId);
  }, [selectedSurplusId]);

  const handleAcceptMatch = async (matchId: string) => {
    setIsAccepting(matchId);
    setActionMessage(null);
    try {
      const updated = await acceptRecipientMatch(matchId);
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, matchStatus: updated.matchStatus } : m))
      );
      setActionMessage({
        type: 'success',
        text: `Match '${matchId}' accepted. Logistics carrier assigned and dispatched to ${updated.recipientName}.`,
      });
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || `Failed to accept match candidate '${matchId}'.`,
      });
    } finally {
      setIsAccepting(null);
    }
  };

  // Selected surplus metadata (if filtering by a specific surplus item)
  const currentSurplus = surplusList.find((s) => s.id === selectedSurplusId);
  const isSelectedUnverified = currentSurplus && !currentSurplus.redistributionEligible;

  return (
    <div className="space-y-6">
      {/* Workflow Navigation Context */}
      <WorkflowContextBar
        currentStage="MATCH"
        purpose="Multi-criteria allocation pairing verified-safe surplus with nearby partner organizations based on distance, dietary profile, and capacity."
        prev={{ tab: 'safety', label: 'VERIFY: Food Safety' }}
        next={{ tab: 'redistribution', label: 'REDISTRIBUTE: Logistics' }}
        onNavigate={onNavigateTab}
      />

      {/* Header Banner */}
      <div className="bg-foodloop-surface dark:bg-slate-900 border border-foodloop-border dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
        <SectionHeader
          title="Smart Recipient Matching Engine"
          subtitle="Deterministic multi-criteria allocation pairing verified-safe surplus with verified community demonstration recipients"
          badge="STAGE 05: MATCH"
          actions={
            <div className="flex items-center gap-2">
              <ActionButton
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => loadData(selectedSurplusId)}
                disabled={isLoading}
              >
                Refresh
              </ActionButton>
              <ActionButton
                variant="primary"
                size="sm"
                icon={Truck}
                onClick={() => onNavigateTab('redistribution')}
              >
                View Active Dispatches
              </ActionButton>
            </div>
          }
        />

        {/* Algorithm Factor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-foodloop-canvas dark:bg-slate-800/60 border border-foodloop-border dark:border-slate-700">
            <span className="font-bold text-foodloop-navy dark:text-slate-100 block mb-0.5">
              1. Strict Safety Clearance
            </span>
            <p className="text-[11px] text-foodloop-textMuted dark:text-slate-400">
              Only surplus verified safe under operational hygiene standards is eligible for matching.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-foodloop-canvas dark:bg-slate-800/60 border border-foodloop-border dark:border-slate-700">
            <span className="font-bold text-foodloop-navy dark:text-slate-100 block mb-0.5">
              2. Proximity & Thermal Safe Window
            </span>
            <p className="text-[11px] text-foodloop-textMuted dark:text-slate-400">
              Prioritizes verified recipients within 10.0 km radius to preserve hot-holding temperatures.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-foodloop-canvas dark:bg-slate-800/60 border border-foodloop-border dark:border-slate-700">
            <span className="font-bold text-foodloop-navy dark:text-slate-100 block mb-0.5">
              3. Category & Dietary Compatibility
            </span>
            <p className="text-[11px] text-foodloop-textMuted dark:text-slate-400">
              Ensures destination shelter has processing and storage capacity for the specific dish category.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-foodloop-canvas dark:bg-slate-800/60 border border-foodloop-border dark:border-slate-700">
            <span className="font-bold text-foodloop-navy dark:text-slate-100 block mb-0.5">
              4. Headcount Demand Balancing
            </span>
            <p className="text-[11px] text-foodloop-textMuted dark:text-slate-400">
              Matches available surplus volume against recipient dinner feeding requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Target Surplus Selector & Safety Gate Status Bar */}
      <div className="bg-white dark:bg-slate-900 border border-foodloop-border dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-foodloop-border dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-foodloop-navy dark:text-slate-100">
              Target Surplus Batch Selection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filter matching calculations against a specific surplus batch or evaluate all active verified inventory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Select Batch:</label>
            <select
              value={selectedSurplusId}
              onChange={(e) => setSelectedSurplusId(e.target.value)}
              className="text-xs font-medium p-2 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800 text-foodloop-navy dark:text-slate-100 focus:outline-hidden focus:border-foodloop-green"
            >
              <option value="all">All Safety Verified Batches</option>
              {surplusList.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.id}] {s.dishName} — {s.portionsEquivalent} Portions ({s.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Surplus Details Preview */}
        {currentSurplus && (
          <div className="p-3 rounded-lg bg-foodloop-canvas dark:bg-slate-800/60 border border-foodloop-border dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-foodloop-navy dark:text-slate-100 block text-sm">
                  {currentSurplus.dishName}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Category: <strong>{currentSurplus.category}</strong> • Batch: {currentSurplus.batchId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantity</span>
                <span className="font-bold text-foodloop-navy dark:text-slate-100">
                  {currentSurplus.portionsEquivalent} Portions ({currentSurplus.quantityKg} kg)
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Safety Gate</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-foodloop-green dark:text-emerald-400" />
                  <span className="font-bold text-foodloop-green dark:text-emerald-400">
                    {currentSurplus.status}
                  </span>
                </div>
              </div>

              <div>
                <StatusBadge
                  status={currentSurplus.redistributionEligible ? 'Eligible' : 'Verification Required'}
                  variant={currentSurplus.redistributionEligible ? 'safe' : 'warning'}
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Safety Barrier Warning when unverified surplus is selected */}
        {isSelectedUnverified && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  Safety Clearance Required Before Matching
                </p>
                <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                  Surplus batch <strong>{currentSurplus.batchId} ({currentSurplus.dishName})</strong> has not passed safety verification. Redistribution protocols prohibit pairing or dispatching unverified food.
                </p>
              </div>
            </div>
            <ActionButton
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onNavigateTab('safety')}
            >
              Verify Food Safety Now
            </ActionButton>
          </div>
        )}
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-foodloop-green shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="flex-1 font-medium">{actionMessage.text}</span>
          {actionMessage.type === 'success' && (
            <button
              onClick={() => onNavigateTab('redistribution')}
              className="underline font-bold hover:text-emerald-700 ml-2"
            >
              Track in Logistics →
            </button>
          )}
        </div>
      )}

      {/* Candidate Matches Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          Loading algorithmic matching candidates...
        </div>
      ) : matches.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 border border-foodloop-border dark:border-slate-800 rounded-xl transition-colors">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="font-bold text-foodloop-navy dark:text-slate-100">No recipient matches available.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ensure surplus batches have completed safety verification before requesting recipient matching.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((match) => {
            const isAssigned =
              match.matchStatus === 'Driver Assigned' || match.matchStatus === 'Accepted';
            const isEligible = match.eligibility !== false;

            return (
              <div
                key={match.id}
                className={`rounded-xl border p-5 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between transition-colors ${
                  !isEligible
                    ? 'border-slate-200 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-800/20'
                    : match.priorityScore >= 90
                    ? 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-500/20'
                    : 'border-foodloop-border dark:border-slate-800'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Recipient Name & Priority Score */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-foodloop-border dark:border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {match.id}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {match.orgType}
                        </span>
                        {match.isDemoData && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Demo Recipient
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foodloop-navy dark:text-slate-100 mt-1">
                        {match.recipientName}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-lg font-bold font-mono ${
                          !isEligible ? 'text-slate-400' : 'text-foodloop-green dark:text-emerald-400'
                        }`}
                      >
                        {match.priorityScore}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {isEligible ? `Rank #${match.rank || 1}` : 'Ineligible'}
                      </span>
                    </div>
                  </div>

                  {/* Surplus Match Details */}
                  <div className="p-3 rounded-lg bg-foodloop-canvas dark:bg-slate-800/60 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Target Surplus:</span>
                      <span className="font-semibold text-foodloop-navy dark:text-slate-100">
                        {match.dishName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Allocation Volume:</span>
                      <span className="font-bold text-foodloop-green dark:text-emerald-400 tabular-numbers">
                        {match.portionsAvailable} Portions (Demanded: {match.capacityNeededPortions})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Dietary Match:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {match.dietaryCompatibility}
                      </span>
                    </div>
                  </div>

                  {/* Transit & Geographic Details */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-foodloop-orange" />
                      <strong className="text-foodloop-navy dark:text-slate-200">{match.distanceKm} km</strong> radial distance
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~{match.transitMinutes} mins ETA
                    </span>
                  </div>

                  {/* Matching Rationale Factors */}
                  {match.reasons && match.reasons.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Matching Factor Audit:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {match.reasons.map((r, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              !isEligible
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <StatusBadge
                    status={!isEligible ? 'Ineligible' : match.matchStatus}
                    variant={!isEligible ? 'critical' : isAssigned ? 'info' : 'safe'}
                    size="sm"
                  />

                  {!isEligible ? (
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      Exclusion Criteria Met
                    </span>
                  ) : isAssigned ? (
                    <ActionButton
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateTab('redistribution')}
                      icon={Truck}
                    >
                      Track Dispatch
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptMatch(match.id)}
                      disabled={isAccepting === match.id}
                      icon={HeartHandshake}
                    >
                      {isAccepting === match.id ? 'Assigning...' : 'Confirm & Dispatch'}
                    </ActionButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
