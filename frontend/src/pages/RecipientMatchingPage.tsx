import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  HeartHandshake,
  Truck,
} from 'lucide-react';
import { NavTabId, RecipientMatch } from '../types';
import { DEMO_RECIPIENT_MATCHES } from '../data/mockData';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ActionButton } from '../components/ui/ActionButton';

interface RecipientMatchingPageProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const RecipientMatchingPage: React.FC<RecipientMatchingPageProps> = ({
  onNavigateTab,
}) => {
  const [matches, setMatches] = useState<RecipientMatch[]>(DEMO_RECIPIENT_MATCHES);

  const handleAcceptMatch = (id: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, matchStatus: 'Driver Assigned' } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs">
        <SectionHeader
          title="Algorithmic Recipient Matching Engine"
          subtitle="Multi-objective allocation routing based on geographic proximity, recipient headcount demand, and dietary compatibility"
          badge="STAGE 05: MATCH"
          actions={
            <ActionButton
              variant="primary"
              size="sm"
              icon={Truck}
              onClick={() => onNavigateTab('redistribution')}
            >
              View Active Dispatches
            </ActionButton>
          }
        />

        {/* Algorithm Factor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-foodloop-canvas border border-foodloop-border">
            <span className="font-bold text-foodloop-navy block mb-0.5">
              1. Distance Decay Score
            </span>
            <p className="text-[11px] text-foodloop-textMuted">
              Prioritizes verified beneficiaries within &lt; 5.0 km radius to preserve meal temperatures.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-foodloop-canvas border border-foodloop-border">
            <span className="font-bold text-foodloop-navy block mb-0.5">
              2. Capacity Balancing
            </span>
            <p className="text-[11px] text-foodloop-textMuted">
              Matches total available portions against recipient immediate dinner feeding requirements.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-foodloop-canvas border border-foodloop-border">
            <span className="font-bold text-foodloop-navy block mb-0.5">
              3. Dietary Adherence
            </span>
            <p className="text-[11px] text-foodloop-textMuted">
              Strict compatibility checking (Pure Vegetarian, Child-safe mild spice, Halal/Kosher).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-foodloop-canvas border border-foodloop-border">
            <span className="font-bold text-foodloop-navy block mb-0.5">
              4. Equitable Allocation
            </span>
            <p className="text-[11px] text-foodloop-textMuted">
              Prevents distribution clustering to ensure all accredited partner shelters receive food.
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {matches.map((match) => {
          const isAssigned = match.matchStatus === 'Driver Assigned';
          return (
            <div
              key={match.id}
              className={`rounded-xl border p-5 shadow-xs bg-white flex flex-col justify-between ${
                match.priorityScore >= 90
                  ? 'border-emerald-300 ring-1 ring-emerald-500/20'
                  : 'border-foodloop-border'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-foodloop-border">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {match.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {match.orgType}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foodloop-navy mt-1">
                      {match.recipientName}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold font-mono text-foodloop-green">
                      {match.priorityScore}
                      <span className="text-xs font-normal text-slate-400">/100</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Match Rank</span>
                  </div>
                </div>

                {/* Surplus Match Details */}
                <div className="p-3 rounded-lg bg-foodloop-canvas space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Surplus:</span>
                    <span className="font-semibold text-foodloop-navy">
                      {match.dishName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allocation Volume:</span>
                    <span className="font-bold text-foodloop-green tabular-numbers">
                      {match.portionsAvailable} Portions (Demanded: {match.capacityNeededPortions})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dietary Match:</span>
                    <span className="text-slate-700 font-medium">
                      {match.dietaryCompatibility}
                    </span>
                  </div>
                </div>

                {/* Transit Details */}
                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-foodloop-orange" />
                    <strong>{match.distanceKm} km</strong> radial distance
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    ~{match.transitMinutes} mins ETA
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <StatusBadge
                  status={match.matchStatus}
                  variant={isAssigned ? 'info' : 'safe'}
                  size="sm"
                />

                {isAssigned ? (
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
                    icon={HeartHandshake}
                  >
                    Confirm & Dispatch
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
