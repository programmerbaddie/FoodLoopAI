import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';
import { HealthStatus } from '../services/api';

interface HeaderProps {
  health: HealthStatus | null;
  loading: boolean;
  error: string | null;
}

export const Header: React.FC<HeaderProps> = ({ health, loading, error }) => {
  return (
    <header className="border-b border-foodloop-border bg-foodloop-surface sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mission Tag */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-foodloop-green flex items-center justify-center text-white shadow-sm font-bold text-lg">
              FL
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-foodloop-navy">
                  FoodLoop <span className="text-foodloop-green">AI</span>
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-foodloop-green border border-foodloop-greenBorder">
                  Predict • Verify • Redistribute
                </span>
              </div>
              <p className="text-xs text-foodloop-textMuted hidden md:block">
                Institutional Kitchen Waste Reduction & Sustainable Redistribution
              </p>
            </div>
          </div>

          {/* Institutional Context & Health Badge */}
          <div className="flex items-center space-x-3">
            {/* Ministry Tag */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>MoFPI | SIH26234</span>
            </div>

            {/* Backend Health Status */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-mono border">
              <div
                className={`w-2 h-2 rounded-full ${
                  loading
                    ? 'bg-amber-400 animate-pulse'
                    : health && !error
                    ? 'bg-emerald-600'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-600 font-sans">
                {loading
                  ? 'Connecting...'
                  : health && !error
                  ? `Backend: ${health.status.toUpperCase()}`
                  : 'Backend: Offline'}
              </span>
            </div>

            {/* Team Badge */}
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded bg-orange-50 text-foodloop-orange border border-foodloop-orangeBorder text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>IMPACT INNOVATOR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
