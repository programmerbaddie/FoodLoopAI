import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  badge?: {
    text: string;
    variant: 'green' | 'orange' | 'blue' | 'neutral';
  };
  icon?: LucideIcon;
  variant?: 'default' | 'highlight' | 'warning';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  badge,
  icon: Icon,
  variant = 'default',
}) => {
  const borderClass =
    variant === 'highlight'
      ? 'border-emerald-300 bg-emerald-50/40'
      : variant === 'warning'
      ? 'border-amber-300 bg-amber-50/40'
      : 'border-foodloop-border bg-foodloop-surface';

  const badgeColorClass = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    orange: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badge?.variant || 'neutral'];

  return (
    <div
      className={`rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-sm ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-foodloop-textMuted">
          {label}
        </p>
        {Icon && (
          <div className="p-1.5 rounded-md bg-white border border-slate-200/80 text-foodloop-navy">
            <Icon className="w-4 h-4 text-foodloop-navyMuted" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foodloop-navy tabular-numbers">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-foodloop-textMuted">{unit}</span>
        )}
      </div>

      {(subtext || badge) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
          {subtext && (
            <span className="text-[11px] text-foodloop-textMuted leading-tight">
              {subtext}
            </span>
          )}
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColorClass}`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
