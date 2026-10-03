import React from 'react';
import {
  Server,
  ExternalLink,
  RefreshCw,
  Building2,
  UtensilsCrossed,
  Cpu,
  Layers,
  FileCode2,
} from 'lucide-react';
import { HealthStatus } from '../services/api';
import { PipelineStrip } from '../components/PipelineStrip';

interface OverviewPageProps {
  health: HealthStatus | null;
  loading: boolean;
  error: string | null;
  onRefreshHealth: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  health,
  loading,
  error,
  onRefreshHealth,
}) => {
  return (
    <div className="space-y-6">
      {/* Primary Mission Card */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-foodloop-green border border-foodloop-greenBorder text-xs font-semibold">
              <span>MoFPI Problem Statement SIH26234</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foodloop-navy">
              FoodLoop <span className="text-foodloop-green">AI</span>
            </h1>
            <p className="text-sm sm:text-base text-foodloop-navyMuted font-medium">
              Predict • Verify • Redistribute
            </p>
            <p className="text-xs sm:text-sm text-foodloop-textMuted leading-relaxed">
              AI-Powered Smart Food Waste Reduction and Sustainable Redistribution Ecosystem
              for Institutional Kitchens and Food Processing Units.
            </p>
          </div>

          {/* Quick Meta Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-w-[260px] space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
              <span className="text-foodloop-textMuted">Ministry</span>
              <span className="font-semibold text-foodloop-navy">MoFPI</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
              <span className="text-foodloop-textMuted">PS Category</span>
              <span className="font-mono text-foodloop-navy">SIH26234 / Software</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
              <span className="text-foodloop-textMuted">Team</span>
              <span className="font-semibold text-foodloop-orange">IMPACT INNOVATOR</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foodloop-textMuted">Current Status</span>
              <span className="font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Phase 1 Foundation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Pipeline Strip */}
      <PipelineStrip />

      {/* Operational Grid: Live Backend Probe + Architecture Foundation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backend Health Diagnostics */}
        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-foodloop-green" />
              <h3 className="text-sm font-bold text-foodloop-navy">
                FastAPI Gateway Status
              </h3>
            </div>
            <button
              onClick={onRefreshHealth}
              disabled={loading}
              className="p-1 rounded text-foodloop-textMuted hover:text-foodloop-navy hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Refresh Health Probe"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-foodloop-textMuted">
            Live health verification probe communicating with the asynchronous Python FastAPI service.
          </p>

          <div className="p-3.5 rounded-lg bg-foodloop-canvas border border-foodloop-border space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Endpoint:</span>
              <span className="text-foodloop-navy font-semibold">GET /health</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Status:</span>
              <span
                className={`font-semibold ${
                  health?.status === 'ok' ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {health?.status ? health.status.toUpperCase() : error ? 'UNREACHABLE' : 'PROBING...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Service:</span>
              <span className="text-foodloop-navy">
                {health?.service || 'FoodLoop AI Backend'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Version:</span>
              <span className="text-foodloop-navy">{health?.version || '0.1.0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Environment:</span>
              <span className="text-foodloop-navy">{health?.environment || 'development'}</span>
            </div>
            {health?.timestamp && (
              <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-sans">Timestamp:</span>
                <span className="text-slate-600">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <span className="font-semibold">Backend offline: </span>
              Start Uvicorn server on port 8000.
            </div>
          )}

          <div className="pt-2 border-t border-foodloop-border flex items-center justify-between text-xs">
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foodloop-green hover:underline flex items-center gap-1 font-medium"
            >
              <span>Swagger API Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="http://127.0.0.1:8000/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foodloop-navyMuted hover:underline flex items-center gap-1"
            >
              <span>ReDoc</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Operational Context & Target Facilities */}
        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-foodloop-navy" />
            <h3 className="text-sm font-bold text-foodloop-navy">
              Institutional Scope
            </h3>
          </div>

          <p className="text-xs text-foodloop-textMuted leading-relaxed">
            Engineered for high-volume food production environments where over-preparation
            and logistical handoff inefficiencies lead to preventable organic waste.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start space-x-2.5 p-2 rounded-lg bg-foodloop-canvas border border-foodloop-border">
              <UtensilsCrossed className="w-4 h-4 text-foodloop-green mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-foodloop-navy">
                  Institutional Kitchens
                </h4>
                <p className="text-[11px] text-foodloop-textMuted">
                  University dining halls, hostel messes, hospital cafeterias, and enterprise pantries.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2 rounded-lg bg-foodloop-canvas border border-foodloop-border">
              <Cpu className="w-4 h-4 text-foodloop-green mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-foodloop-navy">
                  Food Processing Units
                </h4>
                <p className="text-[11px] text-foodloop-textMuted">
                  Batch manufacturing, pre-packaged food sorting facilities, and distribution hubs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2 rounded-lg bg-foodloop-canvas border border-foodloop-border">
              <Layers className="w-4 h-4 text-foodloop-green mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-foodloop-navy">
                  Verified Redistribution Nodes
                </h4>
                <p className="text-[11px] text-foodloop-textMuted">
                  Community shelters, accredited food banks, and verified emergency feeding organizations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture Summary */}
        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <FileCode2 className="w-4 h-4 text-foodloop-navy" />
            <h3 className="text-sm font-bold text-foodloop-navy">
              System Architecture
            </h3>
          </div>

          <p className="text-xs text-foodloop-textMuted leading-relaxed">
            Clean decoupled stack built with strict operational boundaries, transparent data
            models, and reproducible machine learning components.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-foodloop-canvas border border-foodloop-border">
              <span className="text-foodloop-navyMuted font-medium">Frontend Framework</span>
              <span className="font-mono text-foodloop-navy">React 18 + Vite + Tailwind</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-foodloop-canvas border border-foodloop-border">
              <span className="text-foodloop-navyMuted font-medium">Backend Framework</span>
              <span className="font-mono text-foodloop-navy">Python 3.10+ / FastAPI</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-foodloop-canvas border border-foodloop-border">
              <span className="text-foodloop-navyMuted font-medium">Data Modeling</span>
              <span className="font-mono text-foodloop-navy">Pydantic v2 / PostgreSQL</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-foodloop-canvas border border-foodloop-border">
              <span className="text-foodloop-navyMuted font-medium">Machine Learning</span>
              <span className="font-mono text-foodloop-navy">Explainable Scikit-Learn</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-snug">
            <span className="font-semibold">Core Product Rule: </span>
            No simulated statistics or placeholder accuracy claims. All metrics represent genuine operational telemetry.
          </div>
        </div>
      </div>
    </div>
  );
};
